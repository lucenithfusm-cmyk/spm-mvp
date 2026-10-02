(()=>{
'use strict';
const KEY='spm_commercial_funnel_v1';
function save(name,gate){try{const rows=JSON.parse(localStorage.getItem(KEY)||'[]');rows.push({event:name,at:new Date().toISOString(),path:location.pathname,language:gate?.dataset.language||window.SPM_LANG||document.documentElement.lang||'es',primary:gate?.dataset.primary||null,safety:gate?.dataset.safety||null});localStorage.setItem(KEY,JSON.stringify(rows.slice(-100)))}catch{}}
function bind(){const gate=document.querySelector('.spmGate');if(!gate||gate.dataset.analytics==='1')return;gate.dataset.analytics='1';save('offer_view',gate);const start=gate.querySelector('.startPay'),unlock=gate.querySelector('.testUnlock'),back=gate.querySelector('.backResult');if(start)start.addEventListener('click',()=>{save('cta_create_program',gate);save('checkout_view',gate)});if(back)back.addEventListener('click',()=>save('checkout_back',gate));if(unlock)unlock.addEventListener('click',()=>save('program_activation_test',gate))}
const obs=new MutationObserver(bind);obs.observe(document.documentElement,{childList:true,subtree:true});window.SPM_COMMERCIAL_FUNNEL={events(){try{return JSON.parse(localStorage.getItem(KEY)||'[]')}catch{return[]}},reset(){localStorage.removeItem(KEY)}};bind();
window.addEventListener('spm:commercial',event=>{const name=event.detail?.event;if(name)save(name,document.querySelector('.spmGate'))});
})();
