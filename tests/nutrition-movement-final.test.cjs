const fs=require('fs'),path=require('path'),assert=require('assert');
const root=path.join(__dirname,'..','premium-v2'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
for(const f of ['spm-resources-content.js','spm-resources.js','spm-visual-cards-staging-v4.js','spm-nutrition-premium-images-v1.js','wellness-daily-tip-v1.js'])assert.doesNotThrow(()=>new Function(read(f)),f+' parse');
const C=read('spm-resources-content.js'),V=read('spm-visual-cards-staging-v4.js'),N=read('spm-nutrition-premium-images-v1.js'),W=read('wellness-daily-tip-v1.js'),L=read('live.html');
for(const id of ['vegetables','fruit','protein','pulses','fats','limit']){assert(C.includes("id:'"+id+"'"),'missing food '+id);assert(C.includes("practical:p("),'expanded practical guidance missing');}
assert(C.includes('Brócoli | espinaca')&&C.includes('Aceite de oliva | aguacate'),'expanded food lists missing');
assert(V.includes("bike:'07-bicicleta-premium.svg'"),'bike still repeats walking card');
assert(!V.includes("01-plato-spm.jpg"),'obsolete Plato image still referenced');
assert(fs.existsSync(path.join(root,'assets/activity/cards-v1/07-bicicleta-premium.svg')),'bike asset missing');
for(const f of ['spm-nutrition-master.webp','spm-nutrition-fats.webp'])assert(fs.existsSync(path.join(root,'assets/nutrition',f)),'nutrition master missing '+f);
for(const f of ['02-verduras.jpg','03-frutas.jpg','04-proteinas-saludables.jpg','05-legumbres-e-integrales.jpg','06-grasas-insaturadas.jpg','07-alimentos-y-bebidas-a-limitar.jpg'])assert(fs.existsSync(path.join(root,'assets/nutrition/cards-v1',f)),'nutrition card missing '+f);
assert(N.includes('spm-nutrition-master.webp')&&N.includes('spm-plate-premium'),'final Plato SPM visual system missing');
assert(W.includes("const ORDER=['nutrition','movement','sleep']"),'wellness rotation must be nutrition movement sleep');
assert(W.includes("SPM_RESOURCES.open('nutrition'")&&W.includes("SPM_RESOURCES.open('movement'"),'daily tips not linked to resource modules');
for(const s of ['spm-visual-cards-staging-v4.js','spm-nutrition-premium-images-v1.js','wellness-daily-tip-v1.js'])assert(L.includes(s),'live missing '+s);
console.log('Nutrition + Movement static QA OK');