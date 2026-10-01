(()=>{'use strict';
if(window.SPM_DE_GUIDED_V3)return;
const SESSIONS={
 monitoring:{title:'Salir del modo examen',subtitle:'Atención a sensaciones · 60 segundos',steps:[
  ['ATENCIÓN A SENSACIONES','Nota contacto, temperatura, presión o ritmo. No necesitas medir la erección.',20],
  ['DEJA DE COMPROBAR','Si aparece “¿sigue firme?”, reconoce la comprobación y suéltala.',20],
  ['VUELVE AL CONTACTO','Regresa a una sensación concreta y deja que el cuerpo responda sin supervisarlo.',20]
 ]},
 maintenance:{title:'Sostener sin perseguir',subtitle:'Fluctuación · ritmo · presencia',steps:[
  ['MANTÉN LO AGRADABLE','Conserva el estímulo que funciona sin acelerar para “asegurar” la respuesta.',25],
  ['PERMITE UNA FLUCTUACIÓN','Si baja un poco, evita comprobar. Una variación no cancela la experiencia.',20],
  ['CAMBIA RITMO O ESTÍMULO','Haz un cambio pequeño y vuelve a observar sensaciones.',25],
  ['DECIDE SIN PRESIÓN','Continúa, pausa o cambia de actividad según lo que se sienta natural.',20]
 ]},
 recovery:{title:'Recuperación de firmeza sin presión',subtitle:'Protocolo DE · 5 pasos',steps:[
  ['DEJA DE EVALUAR','Detén la comprobación de la firmeza. No intentes forzar una respuesta.',15],
  ['EXHALA Y SUELTA','Afloja mandíbula, abdomen, glúteos y periné.',12],
  ['CAMBIA EL ESTÍMULO','Vuelve a contacto o sensación agradable de baja presión.',35],
  ['DA ESPACIO','Espera sin exigir un resultado inmediato.',35],
  ['RETOMA SOLO SI APARECE','Si vuelve interés o respuesta, continúa gradualmente. Si no, conserva conexión.',20]
 ]}
};
const css=`
.deg{position:fixed;inset:0;z-index:17000;background:rgba(1,8,13,.96);display:grid;place-items:center;padding:12px;color:#eff8f7}
.deg[hidden]{display:none!important}.degBox{width:min(900px,98vw);max-height:94vh;overflow:auto;background:linear-gradient(180deg,#0b2027,#061216);border:1px solid #2b4d55;border-radius:25px;box-shadow:0 30px 90px #000b}
.degHead{display:flex;justify-content:space-between;gap:12px;padding:18px 20px;border-bottom:1px solid #23444b}.degHead small{color:#79dec5;font-weight:900;letter-spacing:.08em}.degHead h2{margin:5px 0 0;font-size:clamp(22px,4vw,34px)}.degClose{width:44px;height:44px;border:1px solid #31515a;background:#10242a;color:#fff;border-radius:12px;font-size:22px}
.degBody{padding:20px}.degVisual{min-height:250px;border-radius:20px;background:radial-gradient(circle at 50% 35%,rgba(70,181,174,.24),transparent 38%),#07181d;display:grid;place-items:center;text-align:center;padding:20px;overflow:hidden}
.degOrb{width:150px;height:150px;border-radius:50%;border:2px solid #69d8be;box-shadow:0 0 0 18px rgba(105,216,190,.05),0 0 60px rgba(105,216,190,.16);display:grid;place-items:center;transition:.8s ease}.degOrb.active{transform:scale(1.08);box-shadow:0 0 0 28px rgba(105,216,190,.06),0 0 85px rgba(105,216,190,.22)}
.degOrb strong{font-size:44px;color:#82e3cb}.degCue{font-size:23px;font-weight:900;margin:18px 0 6px}.degText{color:#bdd0d2;line-height:1.55;max-width:650px;margin:auto}.degSteps{display:grid;gap:8px;margin-top:16px}.degStep{display:grid;grid-template-columns:34px 1fr auto;gap:10px;align-items:center;padding:11px 12px;border:1px solid #26464e;border-radius:14px;background:#0b2026;color:#9fb5b9}.degStep.on{border-color:#75dfc4;background:#10322f;color:#effaf7}.degStep b{color:inherit}.degStep span{font-size:12px}.degProg{height:7px;background:#18343a;border-radius:99px;overflow:hidden;margin:16px 0}.degProg i{display:block;height:100%;width:0;background:linear-gradient(90deg,#77dfc5,#d3af65)}.degActions{display:flex;gap:9px;flex-wrap:wrap}.degBtn{border:0;border-radius:13px;padding:12px 16px;font-weight:900;background:#77dfc5;color:#052018}.degBtn.sec{background:#102a32;color:#fff;border:1px solid #31515a}.degResult{margin-top:16px;padding:14px;border:1px solid #31515a;border-radius:15px;background:#0a1e24}.degResult input{width:100%}
@media(max-width:520px){.degBody{padding:14px}.degVisual{min-height:220px}.degOrb{width:128px;height:128px}.degCue{font-size:20px}.degStep{grid-template-columns:30px 1fr}}
`;
const st=document.createElement('style');st.textContent=css;document.head.appendChild(st);
const ov=document.createElement('div');ov.className='deg';ov.hidden=true;ov.innerHTML=`<div class="degBox"><div class="degHead"><div><small>SPM · ENTRENAMIENTO GUIADO DE</small><h2 id="degTitle"></h2><p id="degSub" style="margin:0;color:#91a9ad"></p></div><button class="degClose" aria-label="Cerrar">×</button></div><div class="degBody"><div class="degProg"><i></i></div><div class="degVisual"><div><div class="degOrb"><strong id="degTime">—</strong></div><div class="degCue" id="degCue">Prepárate</div><div class="degText" id="degText"></div></div></div><div class="degSteps" id="degSteps"></div><div class="degActions" style="margin-top:16px"><button class="degBtn" id="degStart">Comenzar</button><button class="degBtn sec" id="degPause" hidden>Pausar</button><button class="degBtn sec" id="degReset" hidden>Reiniciar</button></div><div class="degResult" id="degResult" hidden><b>¿Cómo cambió tu confianza para manejar esta situación?</b><div style="display:flex;gap:7px;flex-wrap:wrap;margin-top:10px">${[1,2,3,4,5].map(n=>`<button class="degBtn sec" data-deg-score="${n}">${n}</button>`).join('')}</div></div></div></div>`;document.body.appendChild(ov);
let key='',cfg=null,idx=0,left=0,total=0,elapsed=0,timer=null,running=false,origin='lab';
const q=s=>ov.querySelector(s);
function renderSteps(){q('#degSteps').innerHTML=cfg.steps.map((s,i)=>`<div class="degStep ${i===idx?'on':''}"><b>${i+1}</b><div><b>${s[0]}</b><br><span>${s[1]}</span></div><span>${s[2]} s</span></div>`).join('')}
function paint(){const s=cfg.steps[idx];q('#degCue').textContent=s[0];q('#degText').textContent=s[1];q('#degTime').textContent=left+' s';q('.degOrb').classList.toggle('active',running);renderSteps();q('.degProg i').style.width=Math.min(100,elapsed/total*100)+'%'}
function tick(){clearInterval(timer);running=true;q('#degPause').hidden=false;q('#degReset').hidden=false;q('#degStart').hidden=true;paint();timer=setInterval(()=>{left--;elapsed++;if(left<=0){clearInterval(timer);idx++;if(idx>=cfg.steps.length){finish();return;}left=cfg.steps[idx][2];}paint()},1000)}
function finish(){running=false;clearInterval(timer);q('.degProg i').style.width='100%';q('.degOrb').classList.remove('active');q('#degTime').textContent='✓';q('#degCue').textContent='Sesión completada';q('#degText').textContent='Registra cómo te fue. SPM usa tendencias, no una sola sesión.';q('#degPause').hidden=true;q('#degResult').hidden=false;window.dispatchEvent(new CustomEvent('spm:de-guided-complete',{detail:{key,origin,duration:elapsed}}))}
function reset(){clearInterval(timer);running=false;idx=0;elapsed=0;left=cfg.steps[0][2];q('#degResult').hidden=true;q('#degStart').hidden=false;q('#degPause').hidden=true;q('#degReset').hidden=true;paint()}
function open(k,opts={}){if(!SESSIONS[k])return;key=k;cfg=SESSIONS[k];origin=opts.origin||'lab';q('#degTitle').textContent=cfg.title;q('#degSub').textContent=cfg.subtitle;total=cfg.steps.reduce((a,s)=>a+s[2],0);ov.hidden=false;reset()}
function close(){clearInterval(timer);running=false;ov.hidden=true}
q('.degClose').onclick=close;q('#degStart').onclick=tick;q('#degPause').onclick=e=>{if(running){clearInterval(timer);running=false;e.currentTarget.textContent='Continuar';q('.degOrb').classList.remove('active')}else{e.currentTarget.textContent='Pausar';tick()}};q('#degReset').onclick=reset;
ov.addEventListener('click',e=>{if(e.target===ov)close();const b=e.target.closest('[data-deg-score]');if(b){const rows=JSON.parse(localStorage.getItem('spm_de_guided_v3')||'[]');rows.push({key,score:Number(b.dataset.degScore),at:new Date().toISOString()});localStorage.setItem('spm_de_guided_v3',JSON.stringify(rows.slice(-60)));close()}});
window.SPM_DE_GUIDED_V3={open,sessions:SESSIONS};
})();