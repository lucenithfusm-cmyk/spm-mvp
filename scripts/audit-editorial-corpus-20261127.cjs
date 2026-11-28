#!/usr/bin/env node
/* Inventario trazable del texto fuente. No sustituye escucha ni revisión clínica. */
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process'),crypto=require('node:crypto');
const ts=require('../labs/desire/node_modules/typescript');
const root=path.resolve(__dirname,'..'),out=path.join(root,'docs/qa/editorial-20261127');
const baseline='c27bbbba0292513b898d0684a30a95cd1e4e6449';
const reviewedFile=path.join(out,'reviewed-sources.json');
const reviewed=fs.existsSync(reviewedFile)?JSON.parse(fs.readFileSync(reviewedFile,'utf8')):{};
const normalize=s=>String(s).replace(/\s+/g,' ').trim();
const hash=s=>crypto.createHash('sha256').update(s).digest('hex');
function list(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>{
 const p=path.join(dir,e.name);if(e.isDirectory())return /^(?:node_modules|assets|dist|\.git)$/.test(e.name)?[]:list(p);
 return /\.(?:js|ts|tsx|json|html)$/.test(e.name)&&!/(?:\.test|\.d)\.[tj]sx?$/.test(e.name)?[path.relative(root,p)]:[];
});}
const files=[...list(path.join(root,'premium-v2')),...list(path.join(root,'labs'))].sort();
const live=fs.readFileSync(path.join(root,'premium-v2/live.html'),'utf8');
const directlyLoaded=new Set([...live.matchAll(/<script\b[^>]*\bsrc=["']([^"']+)["']/g)].map(m=>m[1].split('?')[0]).filter(s=>!/^https?:/.test(s)).map(s=>path.posix.normalize('premium-v2/'+s)));
function human(s){
 if(s.length<2||s.length>20000||!/[A-Za-zÀ-ÿ]/.test(s))return false;
 if(/^(?:https?:|data:|\/premium-v2\/|assets\/|\.?\.?\/|#[\w-]+$)/.test(s))return false;
 if(/^[\w./@:?=&%-]+\.(?:js|css|jpg|png|webp|mp[34]|webm|json|pdf|html)(?:[?#].*)?$/.test(s))return false;
 if(/^[\w:./@%-]+$/.test(s)&&!/[À-ÿ]/.test(s)&&!/^[A-Z][a-z]+$/.test(s))return false;
 if(/^\s*\.(?:[\w-]+)[^{]*\{/.test(s)||/\b(?:background|display|font-family)\s*:[^<]+;/.test(s)&&!/<(?:p|h[1-6]|button|label|span)\b/.test(s))return false;
 return /\s|[À-ÿ¿¡]/.test(s)||/^[A-Z][a-z]+$/.test(s);
}
function sourceScope(node,sf){
 const bits=[];let n=node;
 while(n&&n!==sf){
  if(ts.isPropertyAssignment(n))bits.unshift(n.name.getText(sf));
  else if(ts.isVariableDeclaration(n))bits.unshift(n.name.getText(sf));
  else if(ts.isFunctionDeclaration(n)&&n.name)bits.unshift(n.name.text+'()');
  else if(ts.isArrayLiteralExpression(n.parent))bits.unshift('['+n.parent.elements.indexOf(n)+']');
  n=n.parent;
 }
 return bits.join('.')||'module';
}
function parse(file,source){
 const sf=ts.createSourceFile(file,source,ts.ScriptTarget.Latest,true,file.endsWith('.tsx')?ts.ScriptKind.TSX:ts.ScriptKind.JS),items=[],counts=new Map();
 function add(node,text,kind){
  if(!human(text))return;
  const scope=sourceScope(node,sf),i=counts.get(scope)||0;counts.set(scope,i+1);
  const location=sf.getLineAndCharacterOfPosition(node.getStart(sf));
  items.push({key:scope+'#'+i,scope,line:location.line+1,column:location.character+1,text,kind});
 }
 function visit(n){
  if(ts.isStringLiteralLike(n)){
   if(n.parent&&((ts.isPropertyAssignment(n.parent)&&n.parent.name===n)||(ts.isImportDeclaration(n.parent))))return;
   add(n,n.text,'literal');
  }else if(ts.isTemplateExpression(n))add(n,n.getText(sf),'dynamic_template');
  else if(ts.isJsxText(n))add(n,normalize(n.getText(sf)),'jsx_text');
  ts.forEachChild(n,visit);
 }
 if(file.endsWith('.json')){
  try{const data=JSON.parse(source);function walk(v,key){if(typeof v==='string'&&human(v))items.push({key,scope:key,line:null,column:null,text:v,kind:'json'});else if(v&&typeof v==='object')for(const [k,value]of Object.entries(v))walk(value,key+'.'+k);}walk(data,'root');}catch{}
 }else if(file.endsWith('.html')){
  for(const m of source.matchAll(/<(title|h[1-6]|p|button|label|option|summary|legend)\b[^>]*>([\s\S]*?)<\/\1>/gi)){const value=normalize(m[2].replace(/<[^>]*>/g,' '));if(human(value))items.push({key:m[1]+':'+items.length,scope:m[1],line:source.slice(0,m.index).split('\n').length,column:null,text:value,kind:'html_text'});}
  for(const m of source.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi))if(m[1].trim())items.push(...parse(file+'.js',m[1]).map(i=>({...i,key:'inline:'+i.key,scope:'inline:'+i.scope})));
 }else visit(sf);
 return items;
}
function old(file){try{return cp.execFileSync('git',['show',baseline+':'+file],{cwd:root,encoding:'utf8',maxBuffer:20*1024*1024,stdio:['ignore','pipe','ignore']});}catch{return '';}}
function route(file,scope){
 if(/conexion-satisfaccion/.test(file))return 'Conexión y satisfacción + compartida';
 if(/(?:erection|erectile|firmness)/.test(file))return 'Erección y firmeza';
 if(/desire/.test(file))return 'Deseo + compartida';
 if(/confianza/.test(file))return 'Confianza + compartida';
 if(/ejaculat|ep-bloque|ep-pattern|squeeze|startstop/.test(file))return 'Control eyaculatorio + Confianza';
 if(/nutrition|recipe|sleep|movement|wellness|resources/.test(file))return 'Hábitos + recursos transversales';
 return 'Transversal / verificar alcance';
}
if(require.main===module){
const units=[],sourceFiles=[];
for(const file of files){
 if(/\/(?:revision[^/]*|[^/]*-review)\//.test(file)||/\/revision[^/]*\.html$/.test(file))continue;
 const current=fs.readFileSync(path.join(root,file),'utf8'),previous=old(file);
 const now=parse(file,current),before=parse(file,previous),byKey=new Map(before.map(x=>[x.key,x])),byText=new Map(before.map(x=>[x.text,x]));
 const rule=reviewed[file]||{},reach=directlyLoaded.has(file)?'live_script':file.startsWith('labs/')?'lab_source':'candidate_dynamic_or_legacy';
 sourceFiles.push({file,sha256:hash(current),units:now.length,reachability:reach,editorial_review:rule.status||'pending'});
 for(const item of now){
  const prior=byText.get(item.text)||byKey.get(item.key),changed=prior?.text!==item.text;
  const scopedReview=rule.status==='reviewed'||(rule.scopes||[]).some(k=>item.scope===k||item.scope.startsWith(k+'.'));
  units.push({content_id:hash(file+'|'+item.key).slice(0,16),file,key:item.key,line:item.line,surface:item.kind,route:route(file,item.scope),days:'Consultar identidad de contenido y calendario; no inferir del título.',before:prior?.text??null,after:item.text,status:scopedReview?(changed?'changed_reviewed':'reviewed_unchanged'):'pending_review',detected_change:changed,reachability:reach,audio_source:rule.audio||'Consultar inventario de voz; literal no prueba audio activo.',objective:rule.objective||'Pendiente de vincular a la actividad efectiva',action:rule.action||'Pendiente de revisión contextual',record:rule.record||'Pendiente de vincular al registro real',modality:rule.modality||'Por actividad; no asumir pareja',close:rule.close||'Pendiente de confirmar control y guardado',proposal:scopedReview?item.text:null,reason:scopedReview?(changed?'Cambio editorial/funcional revisado según anexo 02':'Texto leído y conservado: no modifica técnica, escala ni dosis'):'Inventariado; pendiente revisión contextual, no se declara aprobado.',test_pending:rule.test_pending||'Interacción real, escucha física y persistencia autenticada según superficie'});
 }
}
fs.mkdirSync(out,{recursive:true});
fs.writeFileSync(path.join(out,'content-inventory.json'),JSON.stringify({baseline,method:'TypeScript AST + JSON + HTML. Identifica candidatos estáticos y plantillas dinámicas; no acredita corpus completo de imágenes/video, carga real ni escucha.',sourceFiles,units},null,2)+'\n');
const counts={files:sourceFiles.length,units:units.length,reviewed:units.filter(x=>x.status!=='pending_review').length,changed_reviewed:units.filter(x=>x.status==='changed_reviewed').length,reviewed_unchanged:units.filter(x=>x.status==='reviewed_unchanged').length,pending:units.filter(x=>x.status==='pending_review').length};
fs.writeFileSync(path.join(out,'inventory-summary.json'),JSON.stringify(counts,null,2)+'\n');console.log(JSON.stringify(counts,null,2));
}
module.exports={parse};
