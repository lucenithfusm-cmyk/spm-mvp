'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { PGlite } = require(process.env.SPM_PGLITE_PATH || '@electric-sql/pglite');
const { splitMigration, MAX_BYTES } = require('../scripts/qa/split-progress-migration.cjs');
const root = path.resolve(__dirname, '..');
const migrationName = fs.readdirSync(path.join(root, 'supabase/migrations')).find(name => name.endsWith('_spm_versioned_agenda_atomic_progress.sql'));
const canonical = fs.readFileSync(path.join(root, 'supabase/migrations', migrationName), 'utf8');
const result = splitMigration(canonical);
const fixture = fs.readFileSync(path.join(__dirname, 'support/progress-schema.sql'), 'utf8');
let original, divided;

async function baseline() {
  const db = new PGlite();
  await db.exec(fixture);
  for (const [name, start] of [
    ['202611050001_wompi_orders.sql', 'create or replace function public.spm_complete_missing_answers'],
    ['202611050002_paid_access_release_gate.sql', 'create or replace function public.spm_protect_plan_identity'],
    ['20261109222705_safety_answer_correction.sql', null]
  ]) {
    const sql = fs.readFileSync(path.join(root, 'supabase/migrations', name), 'utf8');
    await db.exec(start ? sql.slice(sql.indexOf(start)) : sql);
  }
  return db;
}

async function snapshot(db) {
  const queries = {
    catalogues: 'select version,manifest from public.spm_agenda_versions order by version',
    functions: "select p.proname,pg_get_function_identity_arguments(p.oid) args,pg_get_functiondef(p.oid) definition,p.proacl::text grants from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and p.proname like 'spm_%' order by p.proname,args",
    triggers: "select c.relname,t.tgname,pg_get_triggerdef(t.oid) definition from pg_trigger t join pg_class c on c.oid=t.tgrelid join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and not t.tgisinternal order by c.relname,t.tgname",
    policies: "select tablename,policyname,permissive,roles::text,cmd,qual,with_check from pg_policies where schemaname='public' order by tablename,policyname",
    columns: "select table_name,column_name,is_nullable,udt_name,column_default from information_schema.columns where table_schema='public' order by table_name,ordinal_position",
    grants: "select table_name,grantee,privilege_type,is_grantable from information_schema.table_privileges where table_schema='public' order by table_name,grantee,privilege_type",
    rls: "select relname,relrowsecurity,relforcerowsecurity from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relkind='r' order by relname"
  };
  const snapshot = {};
  for (const [name, sql] of Object.entries(queries)) snapshot[name] = (await db.query(sql)).rows;
  return snapshot;
}

test.before(async () => {
  original = await baseline();
  divided = await baseline();
  await original.exec(canonical);
  for (const part of result.parts) await divided.exec(part.query);
});
test.after(async () => { await original?.close(); await divided?.close(); });

test('las partes son reproducibles, íntegramente UTF-8 y menores de 900000 bytes', () => {
  assert.deepEqual(splitMigration(canonical), result);
  assert.equal(result.canonicalSha256, crypto.createHash('sha256').update(canonical).digest('hex'));
  assert.equal(result.byteLimitExclusive, MAX_BYTES);
  for (const part of result.parts) {
    assert.ok(Buffer.byteLength(part.query, 'utf8') < 900000, part.file);
    assert.equal(Buffer.byteLength(part.query, 'utf8'), part.bytes);
    assert.equal(crypto.createHash('sha256').update(part.query).digest('hex'), part.sha256);
  }
});

test('PostgreSQL conserva los cuatro catálogos completos y los 72 contextos legacy sin cambios', async () => {
  const a = (await original.query('select version,manifest from public.spm_agenda_versions order by version')).rows;
  const b = (await divided.query('select version,manifest from public.spm_agenda_versions order by version')).rows;
  assert.equal(a.length, 4);
  assert.deepEqual(b, a);
  const legacy = b.find(row => row.version === 'legacy').manifest;
  assert.equal(Object.keys(legacy.allRoutes).length, 72);
  const emitted = result.parts.flatMap(part => part.legacyContexts || []);
  assert.equal(new Set(emitted).size, 72);
  assert.equal(emitted.length, 72);
  assert.deepEqual(emitted.sort(), Object.keys(legacy.allRoutes).sort());
  for (const days of Object.values(legacy.allRoutes)) assert.equal(Object.keys(days).length, 28);
});

test('funciones, triggers, RLS, permisos y columnas coinciden con la migración canónica', async () => {
  assert.deepEqual(await snapshot(divided), await snapshot(original));
});

test('la verificación final detecta un contexto legacy faltante', async () => {
  const key = result.parts.find(part => part.legacyContexts)?.legacyContexts[0];
  assert.ok(key);
  const before = (await divided.query("select manifest from public.spm_agenda_versions where version='legacy'")).rows[0].manifest;
  await divided.query("update public.spm_agenda_versions set manifest=jsonb_set(manifest,'{allRoutes}',(manifest->'allRoutes')-$1) where version='legacy'", [key]);
  await assert.rejects(divided.exec(result.parts.at(-1).query), /SPM_QA_LEGACY_CONTEXTS_INCOMPLETE/);
  await divided.exec('ROLLBACK;');
  await divided.query("update public.spm_agenda_versions set manifest=$1 where version='legacy'", [JSON.stringify(before)]);
});

test('una base con planes rechaza la instalación antes de modificar el esquema', async () => {
  const db = await baseline();
  try {
    const userId = crypto.randomUUID(), planId = crypto.randomUUID();
    await db.query('insert into auth.users(id) values($1)', [userId]);
    await db.query("insert into public.plans(id,user_id,route_key) values($1,$2,'wellbeing')", [planId, userId]);
    await assert.rejects(db.exec(result.parts[0].query), /SPM_QA_BRANCH_MUST_BE_EMPTY/);
    await db.exec('ROLLBACK;');
    assert.equal((await db.query("select to_regclass('public.spm_agenda_versions') as table_name")).rows[0].table_name, null);
    assert.equal((await db.query('select count(*)::int count from public.plans')).rows[0].count, 1);
  } finally { await db.close(); }
});

test('un formato canónico inesperado falla antes de generar partes', () => {
  assert.throws(() => splitMigration(canonical.replace('on conflict(version) do nothing;', 'on conflict(version) do update set manifest=excluded.manifest;')), /Unexpected seed statement/);
});
