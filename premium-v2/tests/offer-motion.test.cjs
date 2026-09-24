const {JSDOM}=require('jsdom');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');

function setup(language){
  const dom=new JSDOM(`<!doctype html><html lang="${language}"><head></head><body></body></html>`,{url:'https://test.example/',runScripts:'outside-only',pretendToBeVisual:true});
  const w=dom.window,jobs=new Map(),observations=[];
  let now=0,id=0,hidden=false;
  w.SPM_LANG=language;
  w.setInterval=()=>0;w.clearInterval=()=>{};
  w.setTimeout=(fn,delay=0)=>{jobs.set(++id,{fn,at:now+delay});return id};
  w.clearTimeout=key=>jobs.delete(key);
  Object.defineProperty(w.document,'hidden',{get:()=>hidden});
  const preference=new w.EventTarget();preference.matches=false;w.matchMedia=()=>preference;
  w.HTMLElement.prototype.scrollTo=function(){};
  w.IntersectionObserver=class{
    constructor(callback){this.callback=callback;observations.push(this)}
    observe(element){this.element=element}
    disconnect(){this.disconnected=true}
  };
  w.SPM_COMMERCIAL_PREVIEW={
    cinematic(){const layer=w.document.createElement('div');layer.className='spmJourney spmJourneyCinema';layer.innerHTML='<audio class="spmFilmNarration"></audio><button class="spmFilmSkip">Stop</button><button class="spmJFinalBtn">Continue</button><button class="spmFilmAudio">Replay</button>';w.document.body.appendChild(layer)},
    close(){w.document.querySelector('.spmJourneyCinema')?.remove()}
  };
  for(const file of ['commercial-conversion-v1.js','commercial-offer-v2.js'])w.eval(fs.readFileSync(path.join(root,file),'utf8'));
  const q=selector=>w.document.querySelector(selector);
  return {w,dom,jobs,q,
    show(selector,ratio=1){const section=q(selector);observations.filter(o=>o.element===section&&!o.disconnected).forEach(o=>o.callback([{isIntersecting:ratio>0,intersectionRatio:ratio}]))},
    tick(ms){const until=now+ms;for(let n=0;n<1000;n++){const due=[...jobs.entries()].filter(([,job])=>job.at<=until).sort((a,b)=>a[1].at-b[1].at)[0];if(!due)break;now=due[1].at;jobs.delete(due[0]);due[1].fn()}now=until},
    hide(value){hidden=value;w.document.dispatchEvent(new w.Event('visibilitychange'))},
    reduce(value){preference.matches=value;preference.dispatchEvent(new w.Event('change'))},
    tool(){return Number(q('[role=tab][aria-selected=true]').dataset.tool)},
    week(){return Number(q('[data-offer-week][aria-pressed=true]').dataset.offerWeek)}
  };
}

(async()=>{
  for(const language of ['es','en']){
    const t=setup(language),{w,q}=t;
    w.SPM_COMMERCIAL_GATE_PREVIEW.open();await Promise.resolve();
    const gate=q('.spmGate');gate.scrollTop=640;
    t.tick(20000);assert.equal(t.tool(),0);assert.equal(t.week(),0,'offscreen previews wait for the reader');
    t.show('.spmOfferTools');t.show('.spmOfferCalendar');
    for(let week=1;week<=4;week++){
      t.tick(3200);assert.equal(t.week(),week%4);
      assert.equal(q('.spmOfferWeekBars.is-current').dataset.calendarWeek,String(week%4));
      assert.equal(q('.spmOfferDayRange').textContent,q('[data-offer-week][aria-pressed=true]').dataset.range);
    }
    assert.equal(t.tool(),2,'all three tools appear without clicking');
    t.tick(2200);assert.equal(t.tool(),0,'tool rotation loops');assert.equal(gate.scrollTop,640,'automatic preview never scrolls the page');
    assert.equal(q('.spmOfferDayRange').getAttribute('aria-live'),'off','automatic weeks do not interrupt screen readers');

    q('[data-tool="2"]').click();t.tick(4999);assert.equal(t.tool(),2,'manual selection gets its full reading time');
    t.tick(1);assert.equal(t.tool(),0);
    q('.spmOfferTools .spmOfferMotionToggle').click();const pausedTool=t.tool();t.tick(16000);assert.equal(t.tool(),pausedTool);
    assert(q('.spmOfferTools .spmOfferMotionToggle').textContent.includes(language==='en'?'Resume':'Reanudar'));
    q('.spmOfferTools .spmOfferMotionToggle').click();t.tick(5000);assert.equal(t.tool(),(pausedTool+1)%3);
    q('[data-offer-week="3"]').click();t.tick(3199);assert.equal(t.week(),3);t.tick(1);assert.equal(t.week(),0);
    q('.spmOfferCalendar .spmOfferMotionToggle').click();const pausedWeek=t.week();t.tick(10000);assert.equal(t.week(),pausedWeek);q('.spmOfferCalendar .spmOfferMotionToggle').click();

    t.show('.spmOfferTools',0);t.show('.spmOfferCalendar',0);const offscreen=[t.tool(),t.week()];t.tick(20000);assert.deepEqual([t.tool(),t.week()],offscreen);
    t.show('.spmOfferTools');t.show('.spmOfferCalendar');t.hide(true);t.tick(20000);assert.deepEqual([t.tool(),t.week()],offscreen);t.hide(false);
    t.reduce(true);t.tick(20000);assert.deepEqual([t.tool(),t.week()],offscreen);assert(q('.spmOfferTools .spmOfferMotionToggle').hidden);
    q('[data-tool="1"]').click();assert.equal(t.tool(),1,'manual controls work with reduced motion');t.reduce(false);

    q('[data-tool="1"]').dispatchEvent(new w.KeyboardEvent('keydown',{key:'ArrowRight',bubbles:true}));assert.equal(t.tool(),2);
    t.tick(6000);assert.equal(t.tool(),2,'keyboard navigation pauses rotation');q('[data-tool="2"]').blur();
    const beforeFilm=[t.tool(),t.week()];q('.spmOfferFilm').click();q('.spmFilmNarration').dispatchEvent(new w.Event('playing'));t.tick(16000);assert.deepEqual([t.tool(),t.week()],beforeFilm,'film playback pauses both previews');
    q('.spmFilmNarration').dispatchEvent(new w.Event('ended'));t.tick(5000);assert.notEqual(t.tool(),beforeFilm[0],'rotation resumes at the natural ending with the player still embedded');
    assert(q('.spmJourneyCinema'));q('.spmFilmSkip').click();

    const beforeLeave=[t.tool(),t.week()];w.dispatchEvent(new w.Event('pagehide'));t.tick(20000);assert.deepEqual([t.tool(),t.week()],beforeLeave);w.dispatchEvent(new w.Event('pageshow'));t.tick(5000);assert.notEqual(t.tool(),beforeLeave[0],'returning from browser history resumes the preview');
    w.SPM_COMMERCIAL_GATE_PREVIEW.close();await Promise.resolve();assert.equal(t.jobs.size,0,'closing the offer releases every rotation timer');
    w.SPM_COMMERCIAL_GATE_PREVIEW.open();await Promise.resolve();assert.equal(w.document.querySelectorAll('.spmOfferMotionToggle').length,2,'reopening creates only one control per preview');
    t.dom.window.close();console.log('PASS',language,'— automatic loops, manual selection, pause/resume, viewport, hidden tab, reduced motion, keyboard, inline film, history return, cleanup');
  }
})().catch(error=>{console.error(error);process.exitCode=1});
