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
.spmOfferMood figcaption{position:absolute;left:5.5%;top:50%;transform:translateY(-50%);z-index:1;color:#f3fff8;font-size:clamp(18px,4.8vw,45px);line-height:1.08;letter-spacing:-.035em;font-weight:850;max-width:37%;text-shadow:0 1px 16px #05232a66}
.spmOfferFacts{display:flex;align-items:center;justify-content:center;gap:0;margin:17px 0 38px;color:#a9c8c6;font-size:13px;font-weight:700}
.spmOfferFacts span{padding:0 24px;text-align:center}.spmOfferFacts span+span{border-left:1px solid #2b5055}.spmOfferFacts b{color:#9de8d7;font-size:20px}
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
.spmOfferConnection{margin:0 0 25px}.spmOfferConnection figcaption{max-width:31%;font-size:clamp(18px,4.5vw,41px)}
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
@media(prefers-reduced-motion:reduce){.spmOfferPanel{animation:none}.spmOfferPlay,.spmOfferFilm>img{transition:none}}
`;
  document.head.appendChild(style);
}
function mount(){
  const gate=document.querySelector('.spmGateVisual');
  if(!gate||gate.dataset.offerBound==='1')return;
  addCSS();gate.dataset.offerBound='1';
  const tabs=[...gate.querySelectorAll('[role=tab]')],panels=[...gate.querySelectorAll('[role=tabpanel]')];
  function select(index,focus=false){
    tabs.forEach((tab,n)=>{tab.setAttribute('aria-selected',String(n===index));tab.tabIndex=n===index?0:-1;panels[n].hidden=n!==index});
    if(focus)tabs[index].focus();
  }
  tabs.forEach((tab,index)=>{
    tab.addEventListener('click',()=>select(index));
    tab.addEventListener('keydown',event=>{let next=index;if(event.key==='ArrowRight')next=(index+1)%tabs.length;else if(event.key==='ArrowLeft')next=(index+tabs.length-1)%tabs.length;else if(event.key==='Home')next=0;else if(event.key==='End')next=tabs.length-1;else return;event.preventDefault();select(next,true)});
  });
  gate.querySelector('.spmOfferFilm')?.addEventListener('click',()=>window.SPM_COMMERCIAL_PREVIEW?.cinematic());
}
const observer=new MutationObserver(mount);
observer.observe(document.documentElement,{childList:true,subtree:true});
mount();
})();
