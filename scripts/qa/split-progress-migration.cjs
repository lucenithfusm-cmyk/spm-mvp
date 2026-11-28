'use strict';

// Offline preparation only. These parts are for a fresh, isolated QA branch,
// never a production installation or the repository migration history.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const root = path.resolve(__dirname, '../..');
const MAX_BYTES = 900000;
const marker = '-- Trusted manifests, never supplied by the browser.\n';
const versions = ['spm-20261127-v1', 'legacy', 'assessment-20261127', 'validation-20261127'];
const hash = value => crypto.createHash('sha256').update(value).digest('hex');
const bytes = value => Buffer.byteLength(value, 'utf8');

function jsonLiteral(value) {
  const json = JSON.stringify(value);
  let index = 0, tag;
  do { tag = `$spm_review_json_${index++}$`; } while (json.includes(tag));
  return `${tag}${json}${tag}::jsonb`;
}

function parseMigration(sql) {
  const beginning = sql.indexOf('\nBEGIN;\n');
  const boundary = sql.indexOf(marker);
  if (beginning < 0 || boundary <= beginning || sql.indexOf(marker, boundary + marker.length) !== -1 || !sql.endsWith('\nCOMMIT;\n')) {
    throw Error('Unexpected canonical migration structure; review the splitter before proceeding.');
  }
  const body = sql.slice(beginning + '\nBEGIN;\n'.length, boundary);
  const lines = sql.slice(boundary + marker.length, -'\nCOMMIT;\n'.length).split('\n').filter(Boolean);
  const seeds = lines.map(line => {
    const match = line.match(/^insert into public\.spm_agenda_versions\(version,manifest\) values\('([a-z0-9-]+)',\$spm_manifest\$(.*)\$spm_manifest\$::jsonb\) on conflict\(version\) do nothing;$/);
    if (!match) throw Error('Unexpected seed statement; no SQL is split at arbitrary byte boundaries.');
    return { version: match[1], manifest: JSON.parse(match[2]), sql: line };
  });
  if (JSON.stringify(seeds.map(seed => seed.version)) !== JSON.stringify(versions)) throw Error('Unexpected catalogue versions or order.');
  const legacy = seeds.find(seed => seed.version === 'legacy').manifest;
  if (legacy.version !== 'legacy' || JSON.stringify(Object.keys(legacy).sort()) !== JSON.stringify(['allRoutes', 'version']) || !legacy.allRoutes || Array.isArray(legacy.allRoutes) || typeof legacy.allRoutes !== 'object') {
    throw Error('Unexpected legacy catalogue structure.');
  }
  return { body, seeds, legacy };
}

const emptyGuard = `DO $spm_empty_branch$
BEGIN
  IF EXISTS (SELECT 1 FROM public.plans) THEN
    RAISE EXCEPTION 'SPM_QA_BRANCH_MUST_BE_EMPTY';
  END IF;
END
$spm_empty_branch$;`;

function wrap(sql, sourceHash, role) {
  return `-- SPM isolated QA branch ONLY. Do not apply to production.\n-- Canonical SHA-256: ${sourceHash}\n-- Part: ${role}. Keep clients disconnected until final verification.\nBEGIN;\n${emptyGuard}\n${sql.trim()}\nCOMMIT;\n`;
}

function legacyInsert(routes) {
  const payload = { version: 'legacy', allRoutes: routes };
  return `insert into public.spm_agenda_versions(version,manifest) values('legacy',${jsonLiteral(payload)})
on conflict(version) do update set manifest=jsonb_set(public.spm_agenda_versions.manifest,'{allRoutes}',
  (public.spm_agenda_versions.manifest->'allRoutes') || (excluded.manifest->'allRoutes'));`;
}

function splitMigration(sql) {
  const parsed = parseMigration(sql), sourceHash = hash(sql), parts = [];
  function add(role, content, metadata = {}) {
    const query = wrap(content, sourceHash, role);
    if (bytes(query) >= MAX_BYTES) throw Error(`Part ${role} is too large; refusing to emit an oversized query.`);
    const number = String(parts.length + 1).padStart(3, '0');
    parts.push({ file: `part-${number}.sql`, name: `spm_qa_progress_${sourceHash.slice(0, 12)}_${number}`, role, bytes: bytes(query), sha256: hash(query), ...metadata, query });
  }
  add('schema', parsed.body);
  for (const seed of parsed.seeds.filter(seed => seed.version !== 'legacy')) {
    add(`catalogue_${seed.version.replaceAll('-', '_')}`, seed.sql, { versions: [seed.version] });
  }

  let chunk = {};
  const flush = () => { add('legacy_contexts', legacyInsert(chunk), { versions: ['legacy'], legacyContexts: Object.keys(chunk) }); chunk = {}; };
  for (const [key, value] of Object.entries(parsed.legacy.allRoutes)) {
    const candidate = { ...chunk, [key]: value };
    if (bytes(wrap(legacyInsert(candidate), sourceHash, 'legacy_contexts')) >= MAX_BYTES && Object.keys(chunk).length) flush();
    chunk[key] = value;
    if (bytes(wrap(legacyInsert(chunk), sourceHash, 'legacy_contexts')) >= MAX_BYTES) throw Error(`Legacy context ${key} alone is too large.`);
  }
  if (Object.keys(chunk).length) flush();

  // No persistent helper objects: completeness checks run inside this final transaction.
  // Full payload equality is verified by the focal PostgreSQL test and, before hosted
  // clients are connected, by comparing every returned catalogue to the canonical JSON.
  const expectedKeys = Object.keys(parsed.legacy.allRoutes).sort();
  const expectedVersions = [...versions].sort();
  const checks = parsed.seeds.filter(seed => seed.version !== 'legacy').map(seed => `
  IF (SELECT manifest FROM public.spm_agenda_versions WHERE version='${seed.version}') IS DISTINCT FROM ${jsonLiteral(seed.manifest)} THEN
    RAISE EXCEPTION 'SPM_QA_CATALOGUE_MISMATCH: ${seed.version}';
  END IF;`).join('\n');
  add('verify_complete', `DO $spm_verify_complete$
BEGIN
  IF (SELECT jsonb_agg(version ORDER BY version COLLATE "C") FROM public.spm_agenda_versions) IS DISTINCT FROM ${jsonLiteral(expectedVersions)} THEN
    RAISE EXCEPTION 'SPM_QA_CATALOGUE_VERSIONS_INCOMPLETE';
  END IF;
  IF (SELECT jsonb_agg(key ORDER BY key COLLATE "C") FROM public.spm_agenda_versions, jsonb_object_keys(manifest->'allRoutes') AS keys(key) WHERE version='legacy') IS DISTINCT FROM ${jsonLiteral(expectedKeys)} THEN
    RAISE EXCEPTION 'SPM_QA_LEGACY_CONTEXTS_INCOMPLETE';
  END IF;
  IF (SELECT manifest->>'version' FROM public.spm_agenda_versions WHERE version='legacy') IS DISTINCT FROM 'legacy' THEN
    RAISE EXCEPTION 'SPM_QA_LEGACY_VERSION_MISMATCH';
  END IF;
${checks}
END
$spm_verify_complete$;`, { verifies: versions, legacyContextCount: expectedKeys.length });

  return { canonicalSha256: sourceHash, canonicalBytes: bytes(sql), byteLimitExclusive: MAX_BYTES, versions, legacyContextCount: expectedKeys.length, parts };
}

function writeParts(output, result, source) {
  const migrationDirectory = path.join(root, 'supabase/migrations');
  const target = path.resolve(output);
  if (target === migrationDirectory || target.startsWith(migrationDirectory + path.sep)) throw Error('QA parts must stay outside supabase/migrations.');
  if (fs.existsSync(target) && fs.readdirSync(target).length) throw Error('Choose an empty output directory; existing files are not overwritten.');
  fs.mkdirSync(target, { recursive: true });
  for (const part of result.parts) fs.writeFileSync(path.join(target, part.file), part.query);
  const manifest = { ...result, canonicalSource: path.relative(root, source), target: 'Fresh isolated QA branch only; no hosted action performed', parts: result.parts.map(({ query, ...part }) => part) };
  fs.writeFileSync(path.join(target, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
  fs.writeFileSync(path.join(target, 'README.md'), `# Partes de la migración para una rama aislada de QA\n\nEstos archivos se generan sin conectarse a Supabase. No aplicarlos al proyecto principal ni copiarlos a supabase/migrations. El archivo canónico permanece intacto.\n\n## Condiciones de uso\n\n1. Crear una rama aislada autorizada y comprobar su project_ref distinto del proyecto principal. La comprobación de plans vacío no demuestra por sí sola que se está en una rama.\n2. Verificar que la rama conserva el esquema previo esperado y no contiene datos de usuarios. Mantener los clientes desconectados durante toda la instalación.\n3. Comprobar SHA-256 y tamaño de cada archivo contra manifest.json. Aplicar las partes en el orden listado, exclusivamente al project_ref de la rama.\n4. La última parte verifica las cuatro versiones, los tres catálogos pequeños completos y las ${result.legacyContextCount} claves legacy. Leer después los cuatro catálogos (legacy por contextos si el resultado es grande) y comparar todos sus valores JSON con el archivo canónico antes de habilitar clientes.\n5. Verificar funciones, RLS y grants en la rama. Crear datos sintéticos y probar Auth/PostgREST únicamente después de completar estas verificaciones.\n\nCada parte tiene su propia transacción: no hay atomicidad global entre llamadas. Si la instalación falla, mantener la rama sin clientes e inspeccionar el error. Estas partes no sustituyen el procedimiento transaccional de producción. No alteran la voz, la agenda, las reglas clínicas ni la aplicación.\n\n## Reproducción\n\n\`node scripts/qa/split-progress-migration.cjs --isolated-empty-branch --output /ruta/scratch/vacia\`\n\nCanónico: \`${manifest.canonicalSource}\`\n\nSHA-256: \`${result.canonicalSha256}\`\n\nPartes: ${result.parts.length}; cada consulta tiene menos de ${MAX_BYTES} bytes UTF-8.\n`);
  return manifest;
}

if (require.main === module) {
  try {
    const args = process.argv.slice(2);
    if (args.length !== 3 || args[0] !== '--isolated-empty-branch' || args[1] !== '--output' || !args[2]) throw Error('Usage: node scripts/qa/split-progress-migration.cjs --isolated-empty-branch --output /empty/scratch/directory');
    const names = fs.readdirSync(path.join(root, 'supabase/migrations')).filter(name => name.endsWith('_spm_versioned_agenda_atomic_progress.sql'));
    if (names.length !== 1) throw Error('Expected exactly one canonical progress migration.');
    const source = path.join(root, 'supabase/migrations', names[0]);
    const result = splitMigration(fs.readFileSync(source, 'utf8'));
    const manifest = writeParts(args[2], result, source);
    console.log(JSON.stringify({ output: path.resolve(args[2]), canonicalSha256: result.canonicalSha256, parts: manifest.parts.map(part => ({ file: part.file, bytes: part.bytes })), legacyContexts: result.legacyContextCount }));
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}

module.exports = { splitMigration, parseMigration, writeParts, MAX_BYTES };
