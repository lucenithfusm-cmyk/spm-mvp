(()=>{
'use strict';
const STYLE_ID='spmOfferV2CSS';
let activeFilm=null;
let activeOffer=null;
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
.spmOfferPlay{position:absolute;top:35%;left:9%;height:48px;width:48px;border-radius:50%;display:grid;place-items:center;background:#a0ecd9;color:#06232a;font-size:17px;padding-left:3px;box-shadow:0 4px 28px #03181a70;animation:spmOfferPlayPulse 2.8s ease-in-out infinite}
.spmOfferPlay:after{content:'';position:absolute;inset:-7px;border:1px solid #a0ecd98c;border-radius:50%;pointer-events:none;animation:spmOfferPlayHalo 2.8s ease-out infinite}
@keyframes spmOfferPlayPulse{0%,45%,100%{transform:scale(1)}18%{transform:scale(1.09)}30%{transform:scale(1.03)}}
@keyframes spmOfferPlayHalo{0%{transform:scale(.88);opacity:0}16%{opacity:.65}65%,100%{transform:scale(1.4);opacity:0}}
.spmOfferFilmCaption{display:grid;gap:5px;padding:15px 17px;background:#0b2b32}.spmOfferFilmCaption b{font-size:15px}.spmOfferFilmCaption small{color:#8fc3bd;font-size:12px}
.spmOfferPlayer{overflow-anchor:none;min-width:0}
.spmOfferExplore>section{min-width:0}
.spmOfferMessage{max-width:720px;margin:25px auto;text-align:center}
.spmGateVisual .spmOfferMessage h2{margin:0 0 9px;color:#e8faf3;font-size:clamp(23px,3.4vw,32px);line-height:1.15;letter-spacing:-.035em}
.spmOfferMessage p{max-width:570px;margin:0 auto;color:#aac8c7;font-size:15px;line-height:1.5}
.spmOfferMessageConnection{margin:0 auto 30px}.spmOfferMessageFinal{margin:25px auto 15px}
.spmOfferScope{max-width:900px}
.spmOfferPaths{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:11px;list-style:none;margin:20px 0 17px;padding:0;text-align:left}
.spmOfferPaths li{min-width:0;padding:17px 16px;border:1px solid #426c6759;border-top:2px solid #81cfba;border-radius:15px;background:linear-gradient(145deg,#123337,#0a222a)}
.spmOfferPaths li:nth-child(3n+2){border-top-color:#7db9d3}.spmOfferPaths li:nth-child(3n){border-top-color:#b0b8df}
.spmGateVisual .spmOfferPaths h3{margin:0 0 7px;color:#e8faf3;font-size:15px;line-height:1.3;letter-spacing:-.015em}
.spmOfferPaths p{max-width:none;margin:0;font-size:13px;line-height:1.45;color:#aac8c7}
.spmOfferScope .spmOfferScopeFoot{color:#a7dece;font-size:13px}
.spmOfferReviews{margin:0 0 35px}
.spmGateVisual .spmOfferReviews h2{max-width:650px;margin:9px 0 20px;color:#e8faf3;font-size:clamp(25px,3.4vw,34px);line-height:1.12;letter-spacing:-.035em}
.spmOfferReviewGrid{display:grid;grid-template-columns:1.15fr 1fr;gap:18px}
.spmOfferReview{position:relative;display:flex;flex-direction:column;min-width:0;margin:0;padding:24px 25px;border:1px solid #4f8a7e66;border-radius:23px;background:radial-gradient(ellipse at 0 0,#173e3d,#0a252c 72%)}
.spmOfferReview:nth-child(2){background:radial-gradient(ellipse at 100% 0,#163744,#0a252c 72%);border-color:#466f805c}
.spmOfferQuoteMark{height:33px;color:#91dfcd;font:70px/.95 Georgia,serif}
.spmOfferReview blockquote{margin:7px 0 22px;padding:0;border:0;flex:1}
.spmOfferReview blockquote p{margin:0;color:#e1efeb;font-size:16px;line-height:1.6}
.spmOfferReview figcaption{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;border-top:1px solid #69988b3b;padding-top:15px}
.spmOfferReview figcaption b{font-size:12px;color:#92decb}.spmOfferReview figcaption span{font-size:11px;color:#95b5b3}
.spmOfferReviewNote{margin:11px 3px 0;font-size:11px;line-height:1.4;color:#88aaa8}
.spmOfferPurchase{margin-top:16px;padding:23px;border:1px solid #71c6ad70;border-radius:21px;background:linear-gradient(125deg,#163d3d,#0a252c)}
.spmOfferPurchasePrice{display:flex;align-items:center;flex-wrap:wrap;gap:14px;margin:14px 0 10px}.spmOfferPurchasePrice strong{color:#f1fff8;font-size:43px;line-height:1;letter-spacing:-.05em}.spmOfferPurchasePrice span{font-size:12px;font-weight:750;color:#a5e0d0;padding:6px 9px;border:1px solid #7ab29e55;border-radius:99px}
.spmOfferPurchase p{margin:0 0 19px;color:#c3d9d5;font-size:13px;line-height:1.5}
.spmOfferFilmError{color:#b4d6d1;font-size:13px;line-height:1.4}
/* Reuse the approved film in this page; only its surrounding layout changes. */
.spmGateVisual .spmOfferInlineFilm{position:relative;inset:auto;z-index:auto;display:block;overflow:hidden;padding:12px;border:1px solid #487d735c;border-radius:21px;background:#071e26;container-type:inline-size}
.spmGateVisual .spmOfferInlineFilm .spmJCinematic{width:100%;margin:0}
.spmGateVisual .spmOfferInlineFilm .spmFilmControls{gap:4px}.spmGateVisual .spmOfferInlineFilm .spmFilmControls button{min-height:42px;padding:8px 10px;font-size:11px}
.spmGateVisual .spmOfferInlineFilm .spmFilmVisual{max-height:none;margin:10px 0 14px;border-radius:14px}
.spmGateVisual .spmOfferInlineFilm .spmJStatus{font-size:20px;min-height:44px;line-height:1.1}
.spmGateVisual .spmOfferInlineFilm .spmJSub{font-size:12px!important;min-height:54px;max-width:100%;margin-top:8px!important;line-height:1.45!important}
.spmGateVisual .spmOfferInlineFilm .spmJMeter{margin:12px auto 3px}
.spmGateVisual .spmOfferInlineFilm .spmJFinalBtn{display:none!important}
.spmGateVisual .spmOfferInlineFilm .spmCinemaBrand,.spmGateVisual .spmOfferInlineFilm .spmCinemaPanel,.spmGateVisual .spmOfferInlineFilm .spmCinemaFinal{padding:clamp(14px,5cqw,28px)}
.spmGateVisual .spmOfferInlineFilm .spmCinemaBrand>small,.spmGateVisual .spmOfferInlineFilm .spmCinemaPanel>small{font-size:clamp(8px,2.6cqw,11px)}
.spmGateVisual .spmOfferInlineFilm .spmCinemaBrand strong{font-size:clamp(48px,17cqw,80px);margin:12px 0 9px}.spmGateVisual .spmOfferInlineFilm .spmCinemaBrand strong span{padding:6px;margin-left:10px}
.spmGateVisual .spmOfferInlineFilm .spmCinemaBrand p{font-size:clamp(12px,3.8cqw,16px)}
.spmGateVisual .spmOfferInlineFilm .spmCinemaPanel h3{font-size:clamp(17px,6cqw,25px);margin:6px 0 9px}
.spmGateVisual .spmOfferInlineFilm .spmCinemaPanel p{font-size:clamp(10px,3.2cqw,13px)}
.spmGateVisual .spmOfferInlineFilm .spmLiveBars{gap:8px;margin:4px 0 9px}.spmGateVisual .spmOfferInlineFilm .spmLiveBar{grid-template-columns:67px 1fr;gap:10px}.spmGateVisual .spmOfferInlineFilm .spmLiveBar span{font-size:10px}.spmGateVisual .spmOfferInlineFilm .spmLiveBar>i{height:7px}
.spmGateVisual .spmOfferInlineFilm .spmCinemaDial{padding:10px 14px}.spmGateVisual .spmOfferInlineFilm .spmCinemaDial svg{width:70%;max-height:62%}.spmGateVisual .spmOfferInlineFilm .spmDialReadout{font-size:21px}
.spmGateVisual .spmOfferInlineFilm .spmCinemaTimer .spmEpTimer{font-size:clamp(38px,13cqw,62px)}.spmGateVisual .spmOfferInlineFilm .spmCinemaTimer .spmEpSteps span{font-size:10px;padding:7px 4px}
.spmGateVisual .spmOfferInlineFilm .spmFilmTap{margin-top:9px;font-size:10px;padding:5px 10px}
.spmGateVisual .spmOfferInlineFilm .spmCinemaProgress .spmDayDots i{height:clamp(10px,4cqw,20px)}.spmGateVisual .spmOfferInlineFilm .spmCinemaProgress .spmBurstChart{height:clamp(30px,11cqw,55px);margin-top:10px}
.spmGateVisual .spmOfferInlineFilm .spmCinemaRoute .spmRouteSteps{margin:10px 0;gap:6px}.spmGateVisual .spmOfferInlineFilm .spmRouteStep{padding:10px 3px 8px;font-size:10px;border-radius:10px}.spmGateVisual .spmOfferInlineFilm .spmRouteStep b{font-size:23px;margin-bottom:5px}
.spmGateVisual .spmOfferInlineFilm .spmFinalCopy>small,.spmGateVisual .spmOfferInlineFilm .spmCinemaFinal:not(.spmCinemaMid) .spmFinalCopy>small{font-size:clamp(7px,2.2cqw,10px);letter-spacing:.09em}
.spmGateVisual .spmOfferInlineFilm .spmFinalCopy .spmFinalSeal,.spmGateVisual .spmOfferInlineFilm .spmCinemaFinal:not(.spmCinemaMid) .spmFinalSeal{font-size:clamp(30px,11cqw,50px);margin:8px 0 10px}
.spmGateVisual .spmOfferInlineFilm .spmFinalPromise,.spmGateVisual .spmOfferInlineFilm .spmCinemaFinal:not(.spmCinemaMid) .spmFinalPromise{font-size:clamp(16px,5.2cqw,24px)}
.spmGateVisual .spmOfferInlineFilm .spmFinalCopy .spmFinalLine{margin:10px 0}.spmGateVisual .spmOfferInlineFilm .spmFinalCopy .spmFinalTags span{font-size:clamp(7px,2.5cqw,11px);padding:5px 6px}
.spmGateVisual .spmOfferInlineFilm .spmBurstLabel{font-size:9px;left:8px;bottom:8px;padding:6px 8px;max-width:calc(100% - 16px)}
.spmOfferTabs{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:4px;padding:4px;background:#03171d;border:1px solid #2c5056;border-radius:14px;margin-bottom:10px}
.spmOfferTabs button{border:0;border-radius:10px;background:transparent;color:#98b8bb;padding:11px 5px;min-height:42px;font-size:13px;font-weight:800;cursor:pointer;touch-action:manipulation}
.spmOfferTabs button[aria-selected=true]{background:#90e1ce;color:#06262d;box-shadow:0 3px 12px #0002}
.spmOfferPanel{border-radius:20px;background:#0b262e;border:1px solid #2a525b;overflow:hidden;animation:spmOfferReveal .18s ease-out}
.spmOfferToolImage{position:relative;height:222px;background:radial-gradient(ellipse,#17404a,#06191f);overflow:hidden}
.spmOfferToolImage img{position:absolute;inset:9px;display:block;width:calc(100% - 18px);height:calc(100% - 18px);max-width:none;max-height:none;object-fit:contain;border-radius:8px}
.spmOfferToolCopy{padding:16px 18px;min-height:110px;box-sizing:border-box;border-top:1px solid #204049}.spmOfferToolCopy h3{font-size:16px;margin:0 0 7px;color:#edf9f3}.spmOfferToolCopy p{font-size:13px;line-height:1.45;color:#a6c2c5;margin:0}
.spmOfferMotionToggle{display:block;margin:8px 0 0 auto;min-height:36px;padding:6px 9px;border:0;border-radius:9px;background:transparent;color:#b8d9d2;font:inherit;font-size:11px;font-weight:600;line-height:1.3;cursor:pointer;touch-action:manipulation}
.spmOfferMotionToggle:hover{background:#8fe3d012}.spmOfferMotionPaused .spmOfferWeekBars i{animation-play-state:paused}
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
@media(max-width:680px){.spmOfferMessage{margin:23px auto}.spmOfferMessage p{font-size:14px}.spmOfferPurchase{padding:19px 17px}.spmOfferPurchase .spmCTA{font-size:14px}.spmOfferPurchasePrice strong{font-size:39px}}
@media(max-width:680px){.spmOfferPaths{grid-template-columns:repeat(2,minmax(0,1fr));gap:9px;margin:17px 0 15px}.spmOfferPaths li{padding:14px 12px;border-radius:13px}.spmGateVisual .spmOfferPaths h3{font-size:14px}.spmOfferPaths p,.spmOfferScope .spmOfferScopeFoot{font-size:12px}}
@media(max-width:680px){.spmOfferReviews{margin-bottom:29px}.spmOfferReviewGrid{grid-template-columns:1fr;gap:13px}.spmOfferReview{padding:20px;border-radius:20px}.spmOfferReview blockquote{margin-bottom:18px}.spmOfferReview blockquote p{font-size:15px;line-height:1.55}.spmOfferReviewNote{font-size:10px}}
@media(prefers-reduced-motion:reduce){.spmOfferPanel,.spmOfferWeekBars.is-current i,.spmOfferPlay,.spmOfferPlay:after{animation:none}.spmOfferPlay:after{display:none}.spmOfferPlay,.spmOfferFilm>img,.spmOfferWeekBars i{transition:none}}
`;
  document.head.appendChild(style);
}
function refreshOfferMotion(){activeOffer?.rotations.forEach(rotation=>rotation.refresh())}
function releaseOfferMotion(){
  if(!activeOffer)return;
  activeOffer.rotations.forEach(rotation=>rotation.dispose());activeOffer=null;
}
function rotateSection(gate,section,delay,next,description){
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)'),isEn=gate.dataset.language==='en';
  let timer=0,paused=false,keyboardFocus=false,disposed=false,suspended=false;
  const button=document.createElement('button');button.type='button';button.className='spmOfferMotionToggle';
  section.appendChild(button);
  const listeners=[];
  function on(target,event,handler,options){target.addEventListener(event,handler,options);listeners.push(()=>target.removeEventListener(event,handler,options))}
  function label(){
    button.textContent=paused?(isEn?'▶ Resume':'▶ Reanudar'):(isEn?'Ⅱ Pause':'Ⅱ Pausar');
    button.setAttribute('aria-label',(paused?(isEn?'Resume automatic preview: ':'Reanudar vista automática: '):(isEn?'Pause automatic preview: ':'Pausar vista automática: '))+description);
    button.hidden=reduced.matches;
  }
  function refresh(){
    clearTimeout(timer);timer=0;
    if(disposed)return;
    const rect=section.getBoundingClientRect(),viewport=gate.getBoundingClientRect();
    const width=Math.max(0,Math.min(rect.right,viewport.right)-Math.max(rect.left,viewport.left));
    const height=Math.max(0,Math.min(rect.bottom,viewport.bottom)-Math.max(rect.top,viewport.top));
    const visible=rect.width>0&&rect.height>0&&width*height/(rect.width*rect.height)>=.35;
    const focus=document.activeElement,focused=section.contains(focus)&&(keyboardFocus||focus.matches(':focus-visible'));
    const running=gate.isConnected&&visible&&!paused&&!focused&&!suspended&&!document.hidden&&!reduced.matches&&!section.closest('[hidden]')&&!(activeFilm?.gate===gate&&activeFilm.playing);
    section.classList.toggle('spmOfferMotionPaused',!running);
    if(running)timer=setTimeout(()=>{timer=0;if(!gate.isConnected){dispose();return}next();refresh()},delay);
  }
  function dispose(){if(disposed)return;disposed=true;clearTimeout(timer);intersection?.disconnect();listeners.forEach(remove=>remove())}
  const intersection=typeof IntersectionObserver==='function'?new IntersectionObserver(refresh,{root:gate,threshold:[0,.35]}):null;
  on(button,'click',()=>{paused=!paused;label();refresh()});
  // Manual choices always get a full reading interval before the next change.
  on(section,'click',refresh);
  on(section,'focusin',refresh);
  on(section,'focusout',()=>{keyboardFocus=false;queueMicrotask(refresh)});
  on(section,'keydown',event=>{if(['Tab','ArrowRight','ArrowLeft','Home','End'].includes(event.key)){keyboardFocus=true;refresh()}});
  on(section,'pointerdown',()=>{keyboardFocus=false;refresh()});
  on(gate,'scroll',refresh,{passive:true});
  on(window,'resize',refresh);
  on(document,'visibilitychange',refresh);
  on(window,'pagehide',()=>{suspended=true;refresh()});
  on(window,'pageshow',()=>{suspended=false;refresh()});
  if(reduced.addEventListener)on(reduced,'change',()=>{label();refresh()});
  intersection?.observe(section);
  label();refresh();
  return {refresh,dispose};
}
function releaseFilm(close=false,focus=false){
  const session=activeFilm;
  if(!session)return;
  activeFilm=null;
  session.cleanup?.();
  const current=document.querySelector('.spmJourney');
  if(close&&(!current||current===session.layer))window.SPM_COMMERCIAL_PREVIEW?.close();
  session.poster.hidden=false;session.host.hidden=true;
  if(focus&&session.poster.isConnected)session.poster.focus({preventScroll:true});
  refreshOfferMotion();
}
function playInlineFilm(gate){
  const journey=window.SPM_COMMERCIAL_PREVIEW,poster=gate.querySelector('.spmOfferFilm'),host=gate.querySelector('.spmOfferFilmMount'),error=gate.querySelector('.spmOfferFilmError');
  if(!journey?.cinematic){error.hidden=false;error.textContent=gate.dataset.language==='en'?'The video is loading. Please try again in a moment.':'El video se está preparando. Vuelve a intentarlo en un momento.';return}
  releaseFilm(true);
  const scrollTop=gate.scrollTop;
  // The approved module remains the sole owner of scenes, timing and audio.
  // Mount its existing node synchronously so no full-screen frame is painted.
  journey.cinematic();
  const layer=document.querySelector('body > .spmJourneyCinema');
  if(!layer)return;
  layer.classList.add('spmOfferInlineFilm');layer.setAttribute('role','region');layer.removeAttribute('aria-modal');
  layer.setAttribute('aria-label',gate.dataset.language==='en'?'SPM program video':'Video del programa SPM');
  const voice=layer.querySelector('.spmFilmNarration');
  const playbackEvents=['playing','pause','ended','error'];
  function updatePlayback(event){if(activeFilm?.layer!==layer)return;activeFilm.playing=event.type==='playing';refreshOfferMotion()}
  playbackEvents.forEach(event=>voice?.addEventListener(event,updatePlayback));
  activeFilm={gate,layer,poster,host,playing:!!voice&&!voice.paused&&!voice.ended,cleanup:()=>playbackEvents.forEach(event=>voice?.removeEventListener(event,updatePlayback))};
  refreshOfferMotion();
  host.appendChild(layer);host.hidden=false;poster.hidden=true;error.hidden=true;gate.scrollTop=scrollTop;
  const stop=layer.querySelector('.spmFilmSkip');
  stop.textContent=gate.dataset.language==='en'?'Stop':'Detener';
  stop.onclick=()=>releaseFilm(true,true);
  // The purchase card directly underneath replaces the standalone-film CTA.
  layer.querySelector('.spmJFinalBtn').onclick=()=>gate.querySelector('.spmOfferPurchase .startPay')?.click();
  layer.querySelector('.spmFilmAudio').focus({preventScroll:true});
}
function mount(){
  if(activeFilm&&(!activeFilm.gate.isConnected||!activeFilm.layer.isConnected))releaseFilm(true);
  if(activeOffer&&!activeOffer.gate.isConnected)releaseOfferMotion();
  const gate=document.querySelector('.spmGateVisual');
  if(!gate||gate.dataset.offerBound==='1')return;
  addCSS();gate.dataset.offerBound='1';
  gate.querySelectorAll('.spmOfferReflection,.spmOfferConnection,.spmOfferFilm').forEach(artwork=>{const brand=document.createElement('span');brand.className='spmArtworkBrand';brand.textContent='SPM';brand.setAttribute('aria-hidden','true');artwork.appendChild(brand);artwork.dataset.spmBranded='overlay'});
  gate.querySelector('.spmOfferTime')?.setAttribute('data-spm-branded','embedded');
  const tabs=[...gate.querySelectorAll('[role=tab]')],panels=[...gate.querySelectorAll('[role=tabpanel]')];
  let toolIndex=0,weekIndex=0;
  function select(index,focus=false){
    toolIndex=index;
    tabs.forEach((tab,n)=>{tab.setAttribute('aria-selected',String(n===index));tab.tabIndex=n===index?0:-1;panels[n].hidden=n!==index});
    if(focus)tabs[index].focus();
  }
  tabs.forEach((tab,index)=>{
    tab.addEventListener('click',()=>select(index));
    tab.addEventListener('keydown',event=>{let next=index;if(event.key==='ArrowRight')next=(index+1)%tabs.length;else if(event.key==='ArrowLeft')next=(index+tabs.length-1)%tabs.length;else if(event.key==='Home')next=0;else if(event.key==='End')next=tabs.length-1;else return;event.preventDefault();select(next,true)});
  });
  const weeks=[...gate.querySelectorAll('[data-offer-week]')],bars=[...gate.querySelectorAll('[data-calendar-week]')],range=gate.querySelector('.spmOfferDayRange');
  function selectWeek(index,focus=false){
    weekIndex=index;
    weeks.forEach((button,n)=>button.setAttribute('aria-pressed',String(n===index)));
    bars.forEach((bar,n)=>bar.classList.toggle('is-current',n===index));
    if(range){range.setAttribute('aria-live',focus?'polite':'off');range.textContent=weeks[index].dataset.range}
    if(focus)weeks[index].focus();
  }
  weeks.forEach((button,index)=>{
    button.addEventListener('click',()=>selectWeek(index));
    button.addEventListener('keydown',event=>{let next=index;if(event.key==='ArrowRight')next=(index+1)%weeks.length;else if(event.key==='ArrowLeft')next=(index+weeks.length-1)%weeks.length;else if(event.key==='Home')next=0;else if(event.key==='End')next=weeks.length-1;else return;event.preventDefault();selectWeek(next,true)});
  });
  const isEn=gate.dataset.language==='en';
  activeOffer={gate,rotations:[
    rotateSection(gate,gate.querySelector('.spmOfferTools'),5000,()=>select((toolIndex+1)%tabs.length),isEn?'program tools':'herramientas del programa'),
    rotateSection(gate,gate.querySelector('.spmOfferCalendar'),3200,()=>selectWeek((weekIndex+1)%weeks.length),isEn?'program weeks':'semanas del programa')
  ]};
  gate.querySelector('.spmOfferFilm')?.addEventListener('click',()=>playInlineFilm(gate));
  gate.addEventListener('click',event=>{if(event.target.closest('.startPay')&&activeFilm?.gate===gate)releaseFilm(true)},true);
}
const observer=new MutationObserver(mount);
observer.observe(document.documentElement,{childList:true,subtree:true});
mount();
window.addEventListener('pagehide',()=>releaseFilm(true));
})();
