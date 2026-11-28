const fs=require('node:fs'),path=require('node:path');
const h=require('../../tests/helpers/agenda-harness.cjs')();
const manifest=JSON.parse(fs.readFileSync(path.resolve(__dirname,'../../docs/qa/spm-agenda-20261127-manifest.json'),'utf8'));
for(const family of [manifest.routes,manifest.variants])for(const [key,days] of Object.entries(family))for(const row of Object.values(days))for(const a of [row.primary,row.support,...row.explanations,...row.resources].filter(Boolean)){
 const c=h.makeContext(a.sourceRoute,a.sourceDay,{scheduleVersion:'legacy',safety:'none'});if(a.pelvicIntent==='scheduled')c.answers={...c.answers,pf_awareness:'good_control',pf_tension:1};
 const source=h.window.SPM_DAILY_PRACTICE.legacyAssignments(c).find(x=>x.id===a.sourceActivityId);
 a.interaction=source?.lesson?.interaction||null;a.wellnessCategory=source?.tip?.category||null;
}
fs.writeFileSync(path.resolve(__dirname,'../../docs/qa/spm-agenda-20261127-manifest.json'),JSON.stringify(manifest,null,2)+'\n');
fs.writeFileSync(path.resolve(__dirname,'../../premium-v2/agenda-manifest-20261127.js'),'/* Compiled from the reviewed 27/11/2026 agenda. See docs/qa/spm-agenda-20261127-manifest.json. */\nwindow.SPM_AGENDA_MANIFEST='+JSON.stringify(manifest)+';\n');
console.log('Manifest metadata enriched from current source');
