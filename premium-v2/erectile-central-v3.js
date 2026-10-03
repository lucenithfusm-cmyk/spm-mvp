(()=>{'use strict';
if(window.SPM_DE_CENTRAL_V3)return;window.SPM_DE_CENTRAL_V3=true;
const LIB=()=>window.SPM_DE_LIBRARY_V3;
const q=(s,r=document)=>r.querySelector(s),all=(s,r=document)=>[...r.querySelectorAll(s)];
const RATIONALE={
 baseline:'SPM usa una línea de base para comparar tendencias sin convertir cada encuentro en una prueba.',
 pattern:'Distinguir inicio, firmeza, mantenimiento y recuperación permite elegir una habilidad específica.',
 monitoring:'Cuando aparece comprobación constante, primero conviene entrenar atención y reducir vigilancia.',
 regulation:'La regulación se usa cuando tensión, prisa o activación interfieren con permanecer presente.',
 pelvic:'El piso pélvico se enlaza solo cuando coordinación, tensión o relajación justifican esa práctica.',
 stimuli:'Conocer facilitadores e inhibidores permite modificar una variable a la vez.',
 aerobic:'Movimiento y salud vascular se priorizan cuando hay margen cardiometabólico y es seguro entrenar.',
 sensate:'Sensate Focus reduce la obligación de “rendir” y devuelve atención al contacto.',
 gradedExposure:'La exposición gradual se asigna cuando el salto de presión aparece en contextos más exigentes.',
 partner:'La comunicación protege la conexión y evita que una pausa se convierta en fracaso.',
 recovery:'La recuperación se entrena cuando una fluctuación dispara alarma, urgencia o comprobación.',
 flexibility:'La flexibilidad reduce reglas rígidas que mantienen la vigilancia.',
 nextCycle:'SPM conserva lo que funcionó y cambia solo lo que sigue limitando la respuesta.'
};
const GUIDED={monitoring:'monitoring',maintenance:'maintenance',recovery:'recovery',erectionPractice:'maintenance'};
const TRANSVERSAL={
 pelvic:{label:'Pelvic Floor Lab',kind:'pelvic'},
 aerobic:{label:'Movimiento SPM',kind:'movement'},
 vascular:{label:'Movimiento + hábitos cardiometabólicos',kind:'movement'},
 sensate:{label:'Sensate Focus Lab',kind:'sensate'},
 partner:{label:'Connection Lab',kind:'connection'},
 regulation:{label:'Respiración SPM',kind:'breathing'},
 recovery:{label:'Recuperación después de una caída',kind:'recovery'}
};
const DAY_FOR_KEY={baseline:1,physiology:2,regulation:3,pelvic:4,stimuli:5,anxiety:6,review:7,practice:8,movement:9,maintenance:10,recovery:20,pattern:12,confidence:13,sensate:15,exposure:17,partner:18,toolkit:22,flexibility:23,preencounter:24,summary:27,final:28};
function currentDay(){const m=q('#deKicker')?.textContent?.match(/D[ií]a\s*(\d+)/i);return m?Number(m[1]):1}
function currentOrigin(){return window.SPM_ERECTILE_FUNCTION?.getOrigin?.()||'lab'}
function escapeHtml(s){return String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function createStyles(){if(q('#deCentralV3Style'))return;const s=document.createElement('style');s.id='deCentralV3Style';s.textContent=`
.deRestore{margin-top:16px;border:1px solid #2a4b53;border-radius:18px;background:linear-gradient(150deg,#0a2027,#07151a);overflow:hidden}.deRestoreHead{padding:15px 16px;border-bottom:1px solid #24434b;display:flex;align-items:center;justify-content:space-between;gap:12px}.deRestoreHead span{font-size:10px;letter-spacing:.09em;font-weight:900;color:#78dec5}.deRestoreHead b{font-size:15px}.deRestoreBody{padding:15px}.deRestoreTabs{display:flex;gap:7px;flex-wrap:wrap;margin-bottom:12px}.deRestoreTabs button{border:1px solid #31515a;background:#10262d;color:#bed1d3;border-radius:999px;padding:8px 10px;font-weight:800;font-size:12px}.deRestoreTabs button.on{background:#78dec5;color:#052018;border-color:#78dec5}.deRestorePane{padding:13px;border-radius:14px;background:#0d242a;color:#d8e8e8;line-height:1.55}.deRestoreWhy{margin-top:12px;padding:12px;border-left:3px solid #d3ae63;border-radius:10px;background:#211d13;color:#eddcaf}.deRestoreActions{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}.deRestoreBtn{border:0;border-radius:12px;padding:10px 12px;font-weight:900;background:#76dec4;color:#052019;cursor:pointer}.deRestoreBtn.sec{background:#102a32;color:#eef7f7;border:1px solid #31515a}.deLinkCard{margin-top:12px;display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px;border:1px solid #31515a;border-radius:14px;background:#091c22}.deLinkCard small{display:block;color:#90a9ad;margin-top:3px}.deLinkChip{font-size:10px;letter-spacing:.08em;font-weight:900;color:#78dec5}.deResultTag{margin-top:12px;color:#8fa8ad;font-size:11px}
@media(max-width:560px){.deRestoreHead,.deLinkCard{align-items:flex-start;flex-direction:column}.deRestoreActions{display:grid}.deRestoreBtn{width:100%}}
`;document.head.appendChild(s)}
function buildResult(){const rs=window.SPM_ERECTILE_FUNCTION?.records?.()||[];const last=rs.at(-1)||{};const ev=rs.filter(r=>r.ehsEvaluable&&Number.isFinite(r.ehs));const avg=k=>rs.length?Math.round(rs.reduce((a,r)=>a+(Number(r[k])||0),0)/rs.length*10)/10:null;const linked=[];rs.forEach(r=>{const d=LIB()?.days?.[r.day];const x=TRANSVERSAL[d?.tool];if(x&&!linked.includes(x.label))linked.push(x.label)});const result={erectionInitiation:last.initiation??null,erectionFirmness:ev.length?ev.at(-1).ehs:null,erectionMaintenance:last.maintenance??null,recoveryAbility:last.recovery??null,morningSpontaneousPattern:last.morning??null,contextVariability:last.variable??last.pattern??null,performancePressure:avg('anxiety'),monitoringLevel:last.monitoring??null,confidence:avg('confidence'),facilitators:Array.isArray(last.stimuli)?last.stimuli:(last.facilitators?[last.facilitators]:[]),inhibitors:last.inhibitors?[last.inhibitors]:[],assignedPractices:rs.map(r=>LIB()?.days?.[r.day]?.title).filter(Boolean).slice(-6),linkedLabs:linked,clinicalReviewSuggested:!!(last.clinicalReviewSuggested||last.next?.includes?.('review')),nextAction:LIB()?.days?.[Math.min(28,(last.day||0)+1)]?.title||'Continuar con la práctica asignada por SPM'};localStorage.setItem('spm_de_result_v3',JSON.stringify(result));window.dispatchEvent(new CustomEvent('spm:de-result',{detail:result}));return result}
function openTransversal(kind,day){if(kind==='pelvic'&&window.SPM_PELVIC_HUB?.open)return window.SPM_PELVIC_HUB.open({origin:'erectile',day});if(kind==='recovery'&&window.SPM_RESOURCES?.open)return window.SPM_RESOURCES.open('recovery',day);if(kind==='movement'&&window.SPM_RESOURCES?.open)return window.SPM_RESOURCES.open('movement',day);if(kind==='pelvic'&&window.SPM_PELVIC_FLOOR?.open)return window.SPM_PELVIC_FLOOR.open();window.dispatchEvent(new CustomEvent('spm:open-lab',{detail:{lab:kind,origin:'erectile',day}}))}
function inject(){createStyles();const modal=q('#spmDeModal.on'),host=q('#deContent');if(!modal||!host)return;const day=currentDay(),spec=LIB()?.days?.[day];if(!spec)return;if(host.querySelector('.deRestore'))return;
 const box=document.createElement('section');box.className='deRestore';const why=RATIONALE[spec.tool]||'SPM selecciona esta práctica por el patrón funcional y el contexto, no por una sola puntuación.';const x=TRANSVERSAL[spec.tool],guided=GUIDED[spec.tool];
 box.innerHTML=`<div class="deRestoreHead"><div><span>CONTENIDO DE RECUPERADO · DE ORIGINAL</span><br><b>${escapeHtml(spec.title)}</b></div><span>SPM PREMIUM V3</span></div><div class="deRestoreBody"><div class="deRestoreTabs"><button data-tab="practice" class="on">Practicar</button><button data-tab="learn">Comprender</button><button data-tab="measure">Medir</button><button data-tab="apply">Aplicar</button></div><div class="deRestorePane" data-pane>${escapeHtml(spec.practice)}</div><div class="deRestoreWhy"><b>¿Por qué SPM te asignó esto?</b><br>${escapeHtml(why)}</div><div class="deRestoreActions">${guided?`<button class="deRestoreBtn" data-de-guided="${guided}">▶ Abrir sesión guiada</button>`:''}${day===20||spec.tool==='recovery'?'<button class="deRestoreBtn sec" data-de-recovery>Ver mini historietas de recuperación</button>':''}${day===1?'<button class="deRestoreBtn sec" data-de-firmness>Ver escala visual de firmeza</button>':''}</div>${x?`<div class="deLinkCard"><div><b>${escapeHtml(x.label)}</b><small>Recurso transversal: DE lo orquesta y no duplica el Lab completo.</small></div><button class="deRestoreBtn sec" data-de-link="${x.kind}">Abrir recurso</button></div>`:''}<div class="deResultTag">Origen actual: ${currentOrigin()} · Registro interoperable con SPM Central</div></div>`;
 host.appendChild(box);
 const pane=q('[data-pane]',box);const values={learn:spec.learn,practice:spec.practice,measure:spec.measure,apply:spec.apply};
 all('[data-tab]',box).forEach(b=>b.onclick=()=>{all('[data-tab]',box).forEach(x=>x.classList.toggle('on',x===b));pane.textContent=values[b.dataset.tab]||''});
 q('[data-de-guided]',box)?.addEventListener('click',e=>window.SPM_DE_GUIDED_V3?.open?.(e.currentTarget.dataset.deGuided,{origin:currentOrigin()}));
 q('[data-de-recovery]',box)?.addEventListener('click',()=>openTransversal('recovery',day));
 q('[data-de-firmness]',box)?.addEventListener('click',()=>window.SPM_RESOURCES?.open?.('response',day));
 q('[data-de-link]',box)?.addEventListener('click',e=>openTransversal(e.currentTarget.dataset.deLink,day));
}
function open(key,opts={}){const day=typeof key==='number'?key:(DAY_FOR_KEY[key]||Object.entries(LIB()?.days||{}).find(([,v])=>v.tool===key)?.[0]);if(!day)return false;window.SPM_ERECTILE_FUNCTION?.open?.(Number(day),{origin:opts.origin||'library'});setTimeout(inject,0);return true}
document.addEventListener('click',e=>{if(e.target.closest('#deSave'))setTimeout(buildResult,60)});
window.addEventListener('spm:de-open',()=>setTimeout(inject,0));
window.addEventListener('spm:de-return',e=>{const o=e.detail?.origin;if(o==='dailyPlan'){q('#navPlan')?.click?.();q('#plan')?.scrollIntoView?.({behavior:'smooth',block:'start'})}else if(o==='library'){q('#navPlan')?.click?.();setTimeout(()=>q('#dePlatformV2')?.scrollIntoView?.({behavior:'smooth',block:'start'}),50)}});
new MutationObserver(()=>{if(q('#spmDeModal.on'))requestAnimationFrame(inject)}).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
window.SPM_DE_LIBRARY={version:'3.0',open,days:()=>LIB()?.days||{},result:buildResult,linkedLabs:TRANSVERSAL};
})();