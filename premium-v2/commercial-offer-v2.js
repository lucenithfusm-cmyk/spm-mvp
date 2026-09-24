(()=>{
'use strict';
const STYLE_ID='spmOfferV2CSS';
function addCSS(){
  if(document.getElementById(STYLE_ID))return;
  const style=document.createElement('style');style.id=STYLE_ID;
  style.textContent=`
.spmGateVisual{background:radial-gradient(ellipse at 50% 0,#10363b,#061419 52%)}
.spmGateVisual [hidden]{display:none!important}
.spmGateVisual .spmGateInner{width:min(1080px,100%);padding:28px 28px 24px;background:none;min-height:100dvh}
.spmGateVisual .spmGateTop{font-size:24px;letter-spacing:-.04em;color:#e9faf5;gap:8px}
.spmGateVisual .spmGateTop i{width:7px;height:7px;margin-right:4px}
.spmGateVisual .spmGateTop>span{font-size:13px;letter-spacing:0;border:1px solid #56877f;border-radius:8px;padding:4px 6px;color:#8fe3d0}
.spmGateVisual .spmGateHero{margin-top:30px;padding:0;border:0;border-radius:0;background:none;box-shadow:none;backdrop-filter:none}
.spmOfferHeading{max-width:740px;margin:0 0 24px}
.spmGateVisual .spmOfferHeading h1{font-size:clamp(31px,5vw,53px);line-height:1.03;letter-spacing:-.045em;margin:11px 0 13px;color:#f0faf6}
.spmGateVisual .spmOfferHeading .lead{font-size:16px;line-height:1.5;max-width:620px;margin:0;color:#aac2c4}
.spmOfferMood{position:relative;margin:0;isolation:isolate;border:1px solid #8fe3d022;border-radius:26px;overflow:hidden;background:#0b282f}
.spmOfferMood img{display:block;width:100%;height:auto;aspect-ratio:1586/992;object-fit:contain}
.spmOfferMood:after{content:'';position:absolute;inset:0;background:linear-gradient(90deg,#03232d80,transparent 42%);pointer-events:none}
.spmGateVisual .spmArtworkBrand{position:absolute;left:clamp(12px,2vw,24px);top:clamp(12px,2vw,24px);z-index:3;display:block;padding:6px 9px;border:1px solid #c5eadc42;border-radius:8px;background:#06242bc4;color:#f0fff9;font:950 clamp(15px,2.3vw,25px)/1 system-ui,-apple-system,Segoe UI,sans-serif;letter-spacing:-.065em;text-shadow:0 1px 5px #0003;pointer-events:none}
.spmGateVisual .spmOfferFilm .spmArtworkBrand{left:12px;top:12px;font-size:18px}
.spmOfferMood figcaption{position:absolute;left:5.5%;top:50%;transform:translateY(-50%);z-index:1;color:#f3fff8;font-size:clamp(18px,4.8vw,45px);line-height:1.08;letter-spacing:-.035em;font-weight:850;max-width:37%;text-shadow:0 1px 16px #05232a66}
.spmOfferFacts{display:flex;align-items:center;justify-content:center;gap:0;margin:17px 0 38px;color:#a9c8c6;font-size:13px;font-weight:700}
.spmOfferFacts span{padding:0 24px;text-align:center}.spmOfferFacts span+span{border-left:1px solid #2b5055}.spmOfferFacts b{color:#9de8d7;font-size:20px}
.spmOfferBenefits{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin:20px 0 0}
.spmOfferBenefits>div{display:flex;gap:12px;align-items:center;justify-content:center;padding:18px 12px;border:1px solid #2d5559;border-radius:17px;background:linear-gradient(140deg,#103139,#082229)}
.spmOfferBenefits svg{width:29px;height:29px;flex:none;fill:none;stroke:#91e6d1;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
.spmOfferBenefits span{color:#e1f4ee;font-size:15px;font-weight:750;line-height:1.25}
.spmOfferExplore{display:grid;grid-template-columns:.95fr 1.05fr;align-items:start;gap:32px;margin:0 0 38px}
.spmOfferSectionLabel{font-size:10px;font-weight:850;color:#7dd9c6;letter-spacing:.14em}
.spmOfferExplore h2{font-size:24px;line-height:1.13;letter-spacing:-.025em;margin:9px 0 18px;color:#f0f9f6}
.spmOfferFilm{position:relative;display:block;width:100%;padding:0;overflow:hidden;border:1px solid #487d735c;border-radius:21px;background:#09252d;color:#f1fff9;cursor:pointer;text-align:left;touch-action:manipulation}
.spmOfferFilm>img{display:block;width:100%;height:auto;aspect-ratio:16/10;object-fit:contain;opacity:.83;transition:opacity .2s}
.spmOfferFilm:hover>img,.spmOfferFilm:focus-visible>img{opacity:1}
.spmOfferPlay{position:absolute;top:35%;left:9%;height:48px;width:48px;border-radius:50%;display:grid;place-items:center;background:#a0ecd9;color:#06232a;font-size:17px;padding-left:3px;box-shadow:0 4px 28px #03181a70;transition:transform .2s}
.spmOfferFilm:hover .spmOfferPlay{transform:scale(1.08)}
.spmOfferFilmCaption{display:grid;gap:5px;padding:15px 17px;background:#0b2b32}.spmOfferFilmCaption b{font-size:15px}.spmOfferFilmCaption small{color:#8fc3bd;font-size:12px}
.spmOfferTabs{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:4px;padding:4px;background:#03171d;border:1px solid #2c5056;border-radius:14px;margin-bottom:10px}
.spmOfferTabs button{border:0;border-radius:10px;background:transparent;color:#98b8bb;padding:11px 5px;min-height:42px;font-size:13px;font-weight:800;cursor:pointer;touch-action:manipulation}
.spmOfferTabs button[aria-selected=true]{background:#90e1ce;color:#06262d;box-shadow:0 3px 12px #0002}
.spmOfferPanel{border-radius:20px;background:#0b262e;border:1px solid #2a525b;overflow:hidden;animation:spmOfferReveal .18s ease-out}
.spmOfferToolImage{height:222px;background:radial-gradient(ellipse,#17404a,#06191f);padding:9px;display:grid;place-items:center}
.spmOfferToolImage img{display:block;max-width:100%;max-height:100%;width:100%;height:100%;object-fit:contain;border-radius:8px}
.spmOfferToolCopy{padding:16px 18px;border-top:1px solid #204049}.spmOfferToolCopy h3{font-size:16px;margin:0 0 7px;color:#edf9f3}.spmOfferToolCopy p{font-size:13px;line-height:1.45;color:#a6c2c5;margin:0}
.spmOfferConnection{margin:0}.spmOfferConnection figcaption{max-width:31%;font-size:clamp(18px,3vw,30px)}
.spmOfferPracticeRow{display:grid;grid-template-columns:1fr 1fr;gap:26px;align-items:center;margin:0 0 34px}
.spmOfferCalendar{padding:24px;border:1px solid #3b706966;border-radius:24px;background:radial-gradient(ellipse at 0 0,#174038,#0a252b 75%)}
.spmOfferCalendar h2,.spmOfferHope h2{margin:9px 0 20px;color:#f1faf5;font-size:29px;line-height:1.12;letter-spacing:-.035em}
.spmOfferDayBars{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;height:55px;margin:20px 0 13px}
.spmOfferWeekBars{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));align-items:end;gap:3px}
.spmOfferWeekBars i{display:block;height:100%;border-radius:4px;background:#284b4d;transform-origin:bottom;transition:background .2s}
.spmOfferWeekBars.is-current i{background:linear-gradient(0deg,#38ada1,#a2efd8);box-shadow:0 0 14px #7be0ca26;animation:spmOfferDayPulse 2.4s ease-in-out infinite;animation-delay:calc(var(--day)*.13s)}
.spmOfferWeekButtons{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:6px}
.spmOfferWeekButtons button{min-height:44px;padding:7px 3px;font-size:11px;font-weight:800;line-height:1.25;border:1px solid #385c5e;border-radius:11px;background:#08242a;color:#a3c3bf;cursor:pointer;touch-action:manipulation}
.spmOfferWeekButtons button[aria-pressed=true]{background:#92e4ce;color:#06272d;border-color:#92e4ce}
.spmOfferCalendarFoot{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-top:17px;font-size:11px;color:#8eafad}.spmOfferDayRange{color:#adeddc;font-size:12px;white-space:nowrap}
.spmOfferHope{margin:0 0 25px}
@keyframes spmOfferDayPulse{0%,100%{transform:scaleY(.78);opacity:.72}50%{transform:scaleY(1);opacity:1}}
.spmOfferResult{border:1px solid #2d5359;border-radius:17px;background:#0a242c;margin:20px 0}
.spmOfferResult summary{position:relative;cursor:pointer;list-style:none;padding:15px 42px 15px 18px;display:grid;gap:5px}.spmOfferResult summary::-webkit-details-marker{display:none}.spmOfferResult summary>span{font-size:11px;color:#84cabb}.spmOfferResult summary>b{font-size:15px;color:#e3f2ee}.spmOfferResult summary>i{position:absolute;right:18px;top:21px;font-size:20px;font-style:normal;color:#8fe3d0}.spmOfferResult[open] summary>i{transform:rotate(45deg)}
.spmOfferResult>div{padding:0 18px 16px;color:#a8c1c4;font-size:14px;line-height:1.5}.spmOfferResult p{margin:0 0 10px}.spmOfferResult p:last-child{margin-bottom:0}
.spmGateVisual .spmGateNote{max-width:680px;margin:18px auto 22px;text-align:center;font-size:11px;line-height:1.5;color:#85a3a8}
.spmGateVisual .spmCTAWrap{position:sticky;bottom:max(12px,env(safe-area-inset-bottom));z-index:10;display:grid;grid-template-columns:1fr 1.3fr;gap:18px;align-items:center;padding:13px 15px;margin:18px 0 0;border:1px solid #628f8066;border-radius:20px;background:#082027f5;box-shadow:0 12px 36px #0006;backdrop-filter:blur(18px)}
.spmOfferPrice{display:grid;gap:3px;white-space:nowrap;padding-left:5px}.spmOfferPrice strong{font-size:29px;letter-spacing:-.04em;line-height:1;color:#f0fff8}.spmOfferPrice span{font-size:11px;color:#9bbbba}
.spmGateVisual .spmCTA{font-size:15px;padding:17px 12px;min-height:53px;border-radius:14px;box-shadow:none}.spmGateVisual .spmCTA span{padding-left:6px}
.spmGateVisual .spmPayment{margin:28px auto 0;max-width:580px}.spmGateVisual .spmSafety{margin-bottom:22px}
.spmGateVisual button:focus-visible,.spmGateVisual summary:focus-visible{outline:3px solid #b2f6e3;outline-offset:3px}
@keyframes spmOfferReveal{from{opacity:.35;transform:translateY(3px)}to{opacity:1;transform:none}}
@media(max-width:680px){
.spmGateVisual .spmGateInner{padding:20px 15px 18px}.spmGateVisual .spmGateHero{margin-top:22px}.spmOfferHeading{margin-bottom:20px}.spmGateVisual .spmOfferHeading .lead{font-size:14px;line-height:1.45}.spmOfferMood{border-radius:20px}.spmOfferMood figcaption{font-size:clamp(18px,5.5vw,30px);left:5%;max-width:36%}.spmOfferFacts{margin:13px 0 29px;font-size:11px}.spmOfferFacts span{padding:0 15px}.spmOfferFacts b{font-size:17px}.spmOfferExplore{grid-template-columns:1fr;gap:29px;margin-bottom:29px}.spmOfferExplore h2{font-size:22px;margin:8px 0 15px}.spmOfferFilmCaption{padding:12px 15px;display:flex;justify-content:space-between;align-items:center;gap:8px}.spmOfferFilmCaption b{font-size:13px}.spmOfferFilmCaption small{font-size:10px;white-space:nowrap}.spmOfferToolImage{height:215px}.spmOfferConnection{margin-bottom:20px}.spmOfferConnection figcaption{font-size:clamp(18px,5.4vw,27px);max-width:30%}.spmGateVisual .spmCTAWrap{grid-template-columns:1fr 1.3fr;gap:8px;padding:10px 10px;bottom:max(8px,env(safe-area-inset-bottom));border-radius:17px}.spmOfferPrice{padding-left:2px}.spmOfferPrice strong{font-size:25px}.spmOfferPrice span{font-size:9px}.spmGateVisual .spmCTA{font-size:13px;padding:13px 7px;line-height:1.2}.spmGateVisual .spmCTA span{padding-left:2px}.spmGateVisual .spmGateNote{font-size:10px;margin:15px 6px 19px}
}
@media(max-width:680px){.spmOfferBenefits{gap:7px;margin-top:14px}.spmOfferBenefits>div{padding:15px 5px;flex-direction:column;gap:10px;text-align:center;border-radius:14px}.spmOfferBenefits svg{width:25px;height:25px}.spmOfferBenefits span{font-size:12px}.spmOfferPracticeRow{grid-template-columns:1fr;gap:22px;margin-bottom:29px}.spmOfferCalendar{padding:20px 17px;border-radius:20px}.spmOfferCalendar h2,.spmOfferHope h2{font-size:25px}.spmOfferWeekButtons button{font-size:10px}.spmOfferCalendarFoot{font-size:10px}.spmOfferPracticeRow .spmOfferConnection{margin:0}.spmOfferHope{margin-bottom:22px}}
@media(prefers-reduced-motion:reduce){.spmOfferPanel,.spmOfferWeekBars.is-current i{animation:none}.spmOfferPlay,.spmOfferFilm>img,.spmOfferWeekBars i{transition:none}}
`;
  document.head.appendChild(style);
}
function mount(){
  const gate=document.querySelector('.spmGateVisual');
  if(!gate||gate.dataset.offerBound==='1')return;
  addCSS();gate.dataset.offerBound='1';
  gate.querySelectorAll('.spmOfferReflection,.spmOfferConnection,.spmOfferFilm').forEach(artwork=>{const brand=document.createElement('span');brand.className='spmArtworkBrand';brand.textContent='SPM';brand.setAttribute('aria-hidden','true');artwork.appendChild(brand);artwork.dataset.spmBranded='overlay'});
  gate.querySelector('.spmOfferTime')?.setAttribute('data-spm-branded','embedded');
  const tabs=[...gate.querySelectorAll('[role=tab]')],panels=[...gate.querySelectorAll('[role=tabpanel]')];
  function select(index,focus=false){
    tabs.forEach((tab,n)=>{tab.setAttribute('aria-selected',String(n===index));tab.tabIndex=n===index?0:-1;panels[n].hidden=n!==index});
    if(focus)tabs[index].focus();
  }
  tabs.forEach((tab,index)=>{
    tab.addEventListener('click',()=>select(index));
    tab.addEventListener('keydown',event=>{let next=index;if(event.key==='ArrowRight')next=(index+1)%tabs.length;else if(event.key==='ArrowLeft')next=(index+tabs.length-1)%tabs.length;else if(event.key==='Home')next=0;else if(event.key==='End')next=tabs.length-1;else return;event.preventDefault();select(next,true)});
  });
  const weeks=[...gate.querySelectorAll('[data-offer-week]')],bars=[...gate.querySelectorAll('[data-calendar-week]')],range=gate.querySelector('.spmOfferDayRange');
  function selectWeek(index,focus=false){
    weeks.forEach((button,n)=>button.setAttribute('aria-pressed',String(n===index)));
    bars.forEach((bar,n)=>bar.classList.toggle('is-current',n===index));
    if(range)range.textContent=weeks[index].dataset.range;
    if(focus)weeks[index].focus();
  }
  weeks.forEach((button,index)=>{
    button.addEventListener('click',()=>selectWeek(index));
    button.addEventListener('keydown',event=>{let next=index;if(event.key==='ArrowRight')next=(index+1)%weeks.length;else if(event.key==='ArrowLeft')next=(index+weeks.length-1)%weeks.length;else if(event.key==='Home')next=0;else if(event.key==='End')next=weeks.length-1;else return;event.preventDefault();selectWeek(next,true)});
  });
  gate.querySelector('.spmOfferFilm')?.addEventListener('click',()=>window.SPM_COMMERCIAL_PREVIEW?.cinematic());
}
const observer=new MutationObserver(mount);
observer.observe(document.documentElement,{childList:true,subtree:true});
mount();
})();
