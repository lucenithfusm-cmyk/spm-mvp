(()=>{'use strict';
if(window.SPM_DE_FINAL_V4)return;window.SPM_DE_FINAL_V4=true;
const q=(s,r=document)=>r.querySelector(s),all=(s,r=document)=>[...r.querySelectorAll(s)];
const PHASE={
 PREPARAR:{icon:'◌',accent:'#79dfc5',soft:'rgba(121,223,197,.12)',copy:'Comprender · observar · regular'},
 ACTIVAR:{icon:'⚡',accent:'#62cde2',soft:'rgba(98,205,226,.12)',copy:'Crear condiciones · practicar · activar'},
 APLICAR:{icon:'◇',accent:'#a99dea',soft:'rgba(169,157,234,.12)',copy:'Transferir · comunicar · recuperar'},
 CONSOLIDAR:{icon:'✦',accent:'#d5b46d',soft:'rgba(213,180,109,.12)',copy:'Integrar · simplificar · mantener'}
};
const ICON={baseline:'◎',education:'◉',regulation:'◌',pelvic:'↕',stimuli:'✦',anxiety:'◇',review:'⌁',activation:'⚡',aerobic:'↗',habits:'☾',preencounter:'✦',attention:'⊙',sensate:'≈',application:'◇',exposure:'↗',partner:'♥',recovery:'↺',toolkit:'✦',flexibility:'∞',next:'→',summary:'⌁',final:'✓'};
const RESOURCE={
 4:{kind:'pelvic',label:'Pelvic Floor Lab',copy:'Abre el entrenamiento central de coordinación y relajación del piso pélvico.'},
 8:{kind:'wellness',label:'Biblioteca Bienestar',copy:'Nutrición, Movimiento y Sueño ya viven en SPM Central y se reutilizan desde aquí.'},
 9:{kind:'movement',label:'Movimiento SPM',copy:'Usa las seis rutas aprobadas de actividad física desde la Biblioteca Bienestar.'},
 10:{kind:'pelvic',label:'Pelvic Floor Lab',copy:'Continúa el entrenamiento central sin duplicar contenido dentro de DE.'},
 11:{kind:'sleep',label:'Sueño SPM',copy:'Abre el recurso de Sueño aprobado para recuperación, regularidad y energía.'},
 20:{kind:'recovery',label:'Recuperación después de una caída',copy:'Abre las 7 historias completas con Avatar Paciente SPM y Doctor SPM.'}
};
const WHY={
 baseline:'Partimos de una línea de base para comparar tendencias sin convertir cada encuentro en una prueba.',
 education:'Comprender la respuesta reduce interpretaciones erróneas y facilita intervenir donde realmente se interrumpe.',
 regulation:'Si tensión, prisa o vigilancia interfieren, primero entrenamos regulación y regreso a sensaciones.',
 pelvic:'El piso pélvico se usa cuando coordinación, tensión o relajación justifican esa práctica.',
 stimuli:'Identificar facilitadores e inhibidores permite modificar una variable a la vez.',
 anxiety:'La vigilancia y la anticipación pueden interrumpir excitación y señal eréctil.',
 review:'Las revisiones semanales deciden qué mantener y qué necesita más atención.',
 activation:'Mejoramos condiciones de respuesta sin convertir hábitos en otra prueba de rendimiento.',
 aerobic:'La función eréctil comparte determinantes con salud vascular y tolerancia al esfuerzo.',
 habits:'Sueño, estrés y recuperación modifican energía, deseo y capacidad de permanecer presente.',
 preencounter:'Preparar el contexto reduce exigencia antes de que aparezca el modo examen.',
 attention:'La atención vuelve a sensaciones en lugar de supervisar continuamente la firmeza.',
 sensate:'Foco sensorial reduce metas rígidas y devuelve presencia al contacto.',
 application:'Aplicar significa usar pocas herramientas en una situación realista, no hacerlo todo a la vez.',
 exposure:'La exposición gradual reduce el salto brusco de presión entre contextos.',
 partner:'Una comunicación breve puede proteger conexión y disminuir vigilancia.',
 recovery:'Una fluctuación no reinicia el proceso; se entrena cómo responder sin urgencia.',
 toolkit:'Consolidar es elegir lo que realmente funciona y descartar técnicas innecesarias.',
 flexibility:'La respuesta sexual normal admite variaciones; una expectativa funcional reduce presión.',
 next:'El siguiente ciclo conserva lo útil y cambia solo lo que sigue limitando.',
 summary:'SPM interpreta patrones de varias semanas, no un encuentro aislado.',
 final:'El cierre integra firmeza, confianza, presión, adherencia, contexto y seguridad.'
};
let lastDay=0;
function route(){return window.SPM_ERECTILE_FUNCTION?.days||{}}
function day(){const m=q('#deKicker')?.textContent?.match(/D[ií]a\s*(\d+)/i);return m?Number(m[1]):1}
function phase(d){return route()?.[d]?.[0]||'PREPARAR'}
function type(d){return route()?.[d]?.[2]||''}
function title(d){return route()?.[d]?.[1]||''}
function currentOrigin(){return window.SPM_ERECTILE_FUNCTION?.getOrigin?.()||'lab'}
function esc(s){return String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function openResource(kind,d){
 if(kind==='recovery'&&window.SPM_RESOURCES?.open)return window.SPM_RESOURCES.open('recovery',d,{origin:'lab'});
 if(kind==='movement'&&window.SPM_RESOURCES?.open)return window.SPM_RESOURCES.open('movement',d,{origin:'lab'});
 if(kind==='sleep'&&window.SPM_SLEEP_LIBRARY_V1?.open)return window.SPM_SLEEP_LIBRARY_V1.open({origin:'lab'});
 if(kind==='wellness'&&window.SPM_WELLNESS_LIBRARY_V1?.open)return window.SPM_WELLNESS_LIBRARY_V1.open({origin:'library'});
 if(kind==='pelvic'&&window.SPM_PELVIC_FLOOR?.open)return window.SPM_PELVIC_FLOOR.open();
 window.dispatchEvent(new CustomEvent('spm:open-lab',{detail:{lab:kind,origin:'erectile',day:d}}));
}
function buildResult(){
 const rs=window.SPM_ERECTILE_FUNCTION?.records?.()||[],last=rs.at(-1)||{},ev=rs.filter(r=>r.ehsEvaluable&&Number.isFinite(r.ehs));
 const avg=k=>rs.length?Math.round(rs.reduce((a,r)=>a+(Number(r[k])||0),0)/rs.length*10)/10:null;
 const used=[...new Set(rs.map(r=>RESOURCE[r.day]?.label).filter(Boolean))];
 const nextDay=Math.min(28,(last.day||0)+1);
 const result={
  erectionInitiation:last.initiation??null,erectionFirmness:ev.length?ev.at(-1).ehs:null,
  erectionMaintenance:last.maintenance??null,recoveryAbility:last.recovery??null,
  morningSpontaneousPattern:last.morning??null,contextVariability:last.variable??last.pattern??null,
  performancePressure:avg('anxiety'),monitoringLevel:last.monitoring??null,confidence:avg('confidence'),
  facilitators:Array.isArray(last.stimuli)?last.stimuli:(last.facilitators?[last.facilitators]:[]),
  inhibitors:last.inhibitors?[last.inhibitors]:[],assignedPractices:rs.slice(-6).map(r=>title(r.day)).filter(Boolean),
  linkedLabs:used,clinicalReviewSuggested:!!(last.clinicalReviewSuggested||last.next?.includes?.('review')),
  nextAction:title(nextDay)||'Continuar con la práctica asignada por SPM'
 };
 try{localStorage.setItem('spm_de_result_v4',JSON.stringify(result))}catch{}
 window.dispatchEvent(new CustomEvent('spm:de-result',{detail:result}));return result;
}
function hero(d){
 const p=phase(d),cfg=PHASE[p]||PHASE.PREPARAR,t=type(d),week=Math.ceil(d/7),progress=Math.round(d/28*100);
 return `<section class="deV4Hero" style="--de-accent:${cfg.accent};--de-soft:${cfg.soft}"><div class="deV4HeroGlow"></div><div class="deV4HeroTop"><span class="deV4Icon" aria-hidden="true">${ICON[t]||'✦'}</span><div><small>SEMANA ${week} · ${p}</small><h3>${esc(title(d))}</h3><p>${esc(WHY[t]||'SPM selecciona esta práctica por tu momento del ciclo y el patrón funcional que vienes registrando.')}</p></div></div><div class="deV4Meta"><span>Día <b>${d}</b> / 28</span><span>${esc(cfg.copy)}</span><span>Origen · ${esc(currentOrigin())}</span></div><div class="deV4Progress" aria-label="Progreso del ciclo"><i style="width:${progress}%"></i></div></section>`;
}
function resourceCard(d){
 const r=RESOURCE[d];if(!r)return '';
 return `<section class="deV4Central"><div class="deV4CentralMark">SPM CENTRAL</div><div><b>${esc(r.label)}</b><p>${esc(r.copy)}</p></div><button type="button" data-dev4-resource="${r.kind}">Abrir recurso <span>→</span></button></section>`;
}
function journey(){
 return `<div class="deV4Journey"><div><span>1</span><b>Aprender</b></div><i>→</i><div><span>2</span><b>Practicar</b></div><i>→</i><div><span>3</span><b>Observar</b></div><i>→</i><div><span>4</span><b>Aplicar</b></div></div>`;
}
function decorate(){
 const modal=q('#spmDeModal.on'),host=q('#deContent');if(!modal||!host)return;
 const d=day();if(!route()?.[d])return;modal.classList.add('deFinalV4');modal.dataset.phase=phase(d);
 if(host.dataset.dev4Day!==String(d)){
   host.dataset.dev4Day=String(d);lastDay=d;
   q('.deV4Hero',host)?.remove();q('.deV4Journey',host)?.remove();q('.deV4Central',host)?.remove();
   host.insertAdjacentHTML('afterbegin',hero(d)+journey());
   const central=resourceCard(d);if(central)host.insertAdjacentHTML('beforeend',central);
 }
 all('[data-dev4-resource]',host).forEach(b=>b.onclick=()=>openResource(b.dataset.dev4Resource,d));
 const contentCard=q('.deGrid > .deCard',modal);if(contentCard)contentCard.dataset.dev4='content';
 const trendCard=q('.deGrid > .deCard:nth-child(2)',modal);if(trendCard)trendCard.dataset.dev4='trend';
 all('.dePremium',host).forEach(x=>x.classList.add('dePremiumV4'));
}
function styles(){
 if(q('#deFinalV4Style'))return;const st=document.createElement('style');st.id='deFinalV4Style';st.textContent=`
#spmDeModal.deFinalV4{background:rgba(1,7,12,.96);backdrop-filter:blur(12px);padding:8px}
.deFinalV4 .deShell{width:min(1120px,100%);margin:0 auto;border-radius:26px;background:linear-gradient(180deg,#06151b,#040d11);border:1px solid #294b53;box-shadow:0 36px 110px #000c;color:#eef8f6}
.deFinalV4 .deHead{position:sticky;top:0;z-index:8;background:rgba(7,27,39,.95);backdrop-filter:blur(14px);border-bottom:1px solid #294b53;padding:16px 20px}
.deFinalV4 .deHead h2{font-size:clamp(22px,4vw,34px);letter-spacing:-.02em}.deFinalV4 .deHead small{color:#7ddfc6}
.deFinalV4 .deBody{padding:18px;background:radial-gradient(circle at 88% 4%,rgba(79,190,171,.10),transparent 30%),transparent}
.deFinalV4 .deGrid{grid-template-columns:minmax(0,1.45fr) minmax(250px,.55fr);gap:14px}
.deFinalV4 .deCard{background:linear-gradient(155deg,#0a2026,#061419);border:1px solid #294a52;border-radius:20px;color:#eaf6f4;box-shadow:0 16px 36px rgba(0,0,0,.24)}
.deFinalV4 [data-dev4="trend"]{background:linear-gradient(165deg,#091b21,#071217)}
.deV4Hero{position:relative;isolation:isolate;overflow:hidden;padding:20px;border:1px solid color-mix(in srgb,var(--de-accent) 32%,#294a52);border-radius:21px;background:radial-gradient(circle at 88% 0,var(--de-soft),transparent 38%),linear-gradient(145deg,#0c2730,#08181e);margin:8px 0 14px}.deV4HeroGlow{position:absolute;z-index:-1;width:220px;height:220px;border-radius:50%;right:-100px;top:-130px;background:radial-gradient(circle,var(--de-soft),transparent 68%)}.deV4HeroTop{display:grid;grid-template-columns:62px 1fr;gap:14px;align-items:start}.deV4Icon{width:60px;height:60px;display:grid;place-items:center;border-radius:18px;background:color-mix(in srgb,var(--de-accent) 14%,#0b2228);border:1px solid color-mix(in srgb,var(--de-accent) 30%,transparent);color:var(--de-accent);font-size:28px}.deV4Hero small{color:var(--de-accent);font-size:10px;letter-spacing:.11em;font-weight:950}.deV4Hero h3{font-size:clamp(25px,4.5vw,37px);line-height:1.08;margin:5px 0 8px}.deV4Hero p{color:#b2c7c8;line-height:1.52;margin:0;max-width:720px}.deV4Meta{display:flex;gap:7px;flex-wrap:wrap;margin-top:15px}.deV4Meta span{font-size:11px;padding:7px 9px;border:1px solid #31515a;border-radius:999px;background:rgba(6,22,27,.72);color:#cfe0df}.deV4Meta b{color:var(--de-accent)}.deV4Progress{height:5px;border-radius:99px;background:#183239;overflow:hidden;margin-top:13px}.deV4Progress i{display:block;height:100%;border-radius:99px;background:linear-gradient(90deg,var(--de-accent),#d3af65)}
.deV4Journey{display:grid;grid-template-columns:1fr auto 1fr auto 1fr auto 1fr;gap:7px;align-items:center;margin:0 0 14px}.deV4Journey div{display:flex;align-items:center;gap:7px;padding:9px 10px;border:1px solid #294a52;border-radius:13px;background:#0a1f25}.deV4Journey span{width:25px;height:25px;border-radius:50%;display:grid;place-items:center;background:#12343a;color:#7de0c6;font-size:11px;font-weight:950}.deV4Journey b{font-size:11px}.deV4Journey i{font-style:normal;color:#607d82}
.deV4Central{display:grid;grid-template-columns:auto 1fr auto;gap:12px;align-items:center;margin:15px 0 2px;padding:14px;border:1px solid #4b543a;border-radius:17px;background:radial-gradient(circle at 95% 0,rgba(211,175,101,.12),transparent 40%),linear-gradient(145deg,#172017,#0a191b)}.deV4CentralMark{font-size:9px;letter-spacing:.1em;font-weight:950;color:#d6b56d;writing-mode:vertical-rl;transform:rotate(180deg)}.deV4Central b{font-size:15px}.deV4Central p{margin:4px 0 0;color:#afc0bd;line-height:1.4;font-size:12px}.deV4Central button{border:0;border-radius:12px;padding:11px 13px;background:#d3af65;color:#1d1609;font-weight:900;white-space:nowrap}.deV4Central button span{display:inline-block;margin-left:5px;transition:transform .2s}.deV4Central button:hover span{transform:translateX(3px)}
.deFinalV4 .deRoad{gap:8px}.deFinalV4 .dePhase{background:#0d242a;color:#99b0b4;border:1px solid #294a52;border-radius:13px;padding:10px}.deFinalV4 .dePhase.on{background:#10342f;color:#effbf7;border-color:#70d9c0;box-shadow:0 0 0 1px rgba(112,217,192,.14)}.deFinalV4 .dePhase.done{background:#102821;color:#9bd7c4}
.deFinalV4 .deBtn{transition:transform .18s ease,border-color .18s ease,box-shadow .18s ease}.deFinalV4 .deBtn:hover{transform:translateY(-1px)}.deFinalV4 .deBtn.pri{background:linear-gradient(135deg,#78dfc5,#4cc1bd);color:#052019}.deFinalV4 .deBtn.sec,.deFinalV4 .deClose,.deFinalV4 .deReturn{background:#102a32;color:#eaf5f4;border:1px solid #31515a}
.deFinalV4 .deNote{background:#0d2930;border-left-color:#75dfc4;color:#d9e9e9}.deFinalV4 .deWarn{background:#2a2112;border-left-color:#d6ae5f;color:#f1dfb5}.deFinalV4 .deField textarea,.deFinalV4 .deField select,.deFinalV4 .deField input[type=number]{background:#07151a;border-color:#31515a;color:#eff8f8}
.deFinalV4 .deMetric label,.deFinalV4 .deChecks label,.deFinalV4 .deSummaryGrid div,.deFinalV4 .deEhs button,.deFinalV4 .deOpt{background:#0d2329;border-color:#294a52;color:#e8f3f3}.deFinalV4 .deEhs button.on,.deFinalV4 .deOpt.on{border-color:#79dfc5;background:#103934}
.deFinalV4 .dePremiumV4 .deHeroViz{background:radial-gradient(circle at 85% 0,rgba(85,204,181,.13),transparent 37%),linear-gradient(145deg,#0b2831,#07171d);border:1px solid #2b4e56}.deFinalV4 .dePremiumV4 .deTip,.deFinalV4 .dePremiumV4 .deMiniQuiz,.deFinalV4 .dePremiumV4 .deLadder button,.deFinalV4 .dePremiumV4 .deSignal div,.deFinalV4 .dePremiumV4 .deWeekStrip div,.deFinalV4 .dePremiumV4 .deAccordion{background:#0b2026;border-color:#294a52;color:#e8f4f2}.deFinalV4 .dePremiumV4 .deTip:hover,.deFinalV4 .dePremiumV4 .deTip.on,.deFinalV4 .dePremiumV4 .deLadder button.on{border-color:#72dcc2;background:#10332f}.deFinalV4 .dePremiumV4 .deAccordion button{background:#10272d;color:#edf7f5}.deFinalV4 .dePremiumV4 .deScenario{background:#0d2930;border-left-color:#75dfc4}.deFinalV4 .dePremiumV4 .deCompletion{background:linear-gradient(145deg,#102d2a,#0b1f25);border-color:#3f6e63}.deFinalV4 .dePremiumV4 .dePill{background:#10262d;border-color:#31515a;color:#dcebea}.deFinalV4 .dePremiumV4 .dePill.on{background:#75dfc4;color:#052019;border-color:#75dfc4}.deFinalV4 .dePremiumV4 .deGauge{background:#19333a}.deFinalV4 .dePremiumV4 .deGauge i{background:linear-gradient(90deg,#67cfe4,#75dfc4)}
.deFinalV4 .deVideo{border-color:#31515a;background:#091c22}.deFinalV4 .deVideo small{color:#8fa7ad}
#dePlatformV2{--de4:#75dfc4}.dev2Hero{background:radial-gradient(circle at 90% 0,rgba(117,223,196,.16),transparent 38%),linear-gradient(145deg,#071b27,#0b3038)!important;border-color:#31545c!important;box-shadow:0 18px 45px rgba(0,0,0,.26)}.dev2Card,.dev2Video,#dePlatformV2>.card{background:linear-gradient(155deg,#0a2026,#07151a)!important;border-color:#294a52!important}.dev2Card{transition:.2s ease}.dev2Card:hover{transform:translateY(-2px);border-color:#75dfc4!important}.dev2Week{background:#0d242a!important;border-color:#31515a!important}.dev2Pill{background:rgba(117,223,196,.08)!important;border-color:rgba(117,223,196,.22)!important}.dev2Safety{background:#251f12!important;border-color:#66562f!important;color:#ead9a8!important}
@media(max-width:780px){.deFinalV4 .deBody{padding:12px}.deFinalV4 .deGrid{grid-template-columns:1fr}.deV4Journey{grid-template-columns:1fr 1fr;gap:7px}.deV4Journey>i{display:none}.deV4Central{grid-template-columns:1fr}.deV4CentralMark{writing-mode:horizontal-tb;transform:none}.deV4Central button{width:100%}.deV4HeroTop{grid-template-columns:52px 1fr}.deV4Icon{width:50px;height:50px}.deFinalV4 [data-dev4="trend"]{order:2}}
@media(max-width:430px){.deFinalV4 .deShell{border-radius:18px}.deV4Hero{padding:15px}.deV4Hero h3{font-size:24px}.deV4Journey div{padding:8px}.deV4Journey b{font-size:10px}.deV4Meta{gap:5px}.deV4Meta span{font-size:10px}.deFinalV4 .deRoad{grid-template-columns:1fr 1fr}}
@media(prefers-reduced-motion:reduce){.deFinalV4 .deBtn,.dev2Card,.deV4Central button span{transition:none!important}.deFinalV4 .deBtn:hover,.dev2Card:hover{transform:none}}
`;document.head.appendChild(st)}
function boot(){styles();decorate()}
window.addEventListener('spm:de-open',()=>setTimeout(boot,0));document.addEventListener('click',e=>{if(e.target.closest('#deSave'))setTimeout(()=>{buildResult();decorate()},80);setTimeout(decorate,0)});
new MutationObserver(()=>requestAnimationFrame(decorate)).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
document.addEventListener('DOMContentLoaded',()=>setTimeout(boot,700),{once:true});setTimeout(boot,1200);
window.SPM_DE_FINAL={version:'4.0',decorate,result:buildResult,resources:RESOURCE,route};
})();