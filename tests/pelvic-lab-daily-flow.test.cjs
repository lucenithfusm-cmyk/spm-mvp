const {test, before} = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const {JSDOM, VirtualConsole} = require('../labs/desire/node_modules/jsdom');
const {build} = require('../labs/pelvic-floor/node_modules/esbuild');
const root = path.resolve(__dirname, '../labs/pelvic-floor');
let bundle;

before(async()=>{
  // Actual React, host adapter and Lab. The test bundle stays in memory.
  const output=await build({stdin:{contents:"import React from 'react'; import {createRoot} from 'react-dom/client'; import {PelvicLab} from './src/components/PelvicLab'; window.__act=React.act;window.IS_REACT_ACT_ENVIRONMENT=true;window.__root=createRoot(document.getElementById('root'));window.__mount=()=>window.__root.render(React.createElement(PelvicLab));",resolveDir:root,loader:'tsx'},bundle:true,write:false,format:'iife',platform:'browser',jsx:'automatic',alias:{'@':path.join(root,'src')},loader:{'.jpg':'dataurl'},define:{'process.env.NODE_ENV':'"test"'}});
  bundle=output.outputFiles[0].text;
});

async function setup(options={}){
  const errors=[],console=new VirtualConsole();console.on('jsdomError',e=>errors.push(e.message));
  const dom=new JSDOM('<!doctype html><html><body><iframe title="Lab"></iframe></body></html>',{url:'https://spm.test/',runScripts:'dangerously',pretendToBeVisual:true,virtualConsole:console});
  const parent=dom.window,win=parent.document.querySelector('iframe').contentWindow;
  // JSDOM omits MessageChannel; React uses it only to enqueue an act task.
  win.MessageChannel=class{constructor(){this.port1={onmessage:null};this.port2={postMessage:data=>setImmediate(()=>this.port1.onmessage?.({data}))};}};
  win.document.body.innerHTML='<div id="root"></div>';
  const context={day:6,origin:'dailyPlan',intent:'daily-relax',activityId:'pelvic-daily-lab',restriction:'relax',...options.context};
  const state=structuredClone(options.state||{}),writes=[],results=[],audio=[];
  let closed=0,paused=0,reject=false,clock=0,timerId=0;const timers=new Map();
  parent.SPM_PELVIC_LAB_HOST={getState:()=>structuredClone(state),getContext:()=>({...context}),
    write:(key,value)=>{if(reject)return false;state[key]=structuredClone(value);writes.push({key,value:structuredClone(value)});return true;},
    onResult:r=>{results.push(structuredClone(r));return true;},close:async()=>{closed++;return !options.closeFails;}};
  win.scrollTo=()=>{};win.HTMLMediaElement.prototype.play=function(){audio.push(this.src.split('/').at(-1));return Promise.resolve();};
  win.HTMLMediaElement.prototype.pause=function(){paused++;};win.HTMLMediaElement.prototype.load=function(){};
  win.HTMLDialogElement.prototype.showModal=function(){this.open=true;};
  Object.defineProperty(win.performance,'now',{value:()=>clock});
  Object.defineProperty(win,'localStorage',{get(){throw Error('The daily Lab must never use localStorage');}});
  win.setInterval=fn=>{timers.set(++timerId,fn);return timerId;};win.clearInterval=id=>timers.delete(id);
  win.eval(bundle);
  const act=async fn=>{await win.__act(fn);};await act(()=>win.__mount());
  return {dom,win,context,state,writes,results,audio,errors,act,get closed(){return closed;},get paused(){return paused;},reject(value){reject=value;},
    async tick(ms){clock+=ms;await act(()=>{for(const fn of timers.values())fn();});},
    async notify(){await act(()=>win.dispatchEvent(new win.Event('spm:pelvic-context')));},
    async dispose(){await act(()=>win.__root.unmount());dom.window.close();}};
}
const doc=h=>h.win.document;
const text=node=>node.textContent.replace(/\s+/g,' ').trim();
function button(h,label,within=doc(h)){
  const found=[...within.querySelectorAll('button')].find(n=>typeof label==='string'?text(n)===label:label.test(text(n)));
  assert.ok(found,`button ${label} exists`);return found;
}
async function click(h,label,within){const node=button(h,label,within);assert.equal(node.disabled,false,`${label} enabled`);await h.act(()=>node.dispatchEvent(new h.win.MouseEvent('click',{bubbles:true})));}
async function start(h){await click(h,'Comenzar mi práctica');assert.ok(doc(h).querySelector('[data-stage="run"]'));}
async function finish(h,interrupted=false){await click(h,interrupted?'Interrumpir y registrar una dificultad':'Terminé mi práctica a mi ritmo');assert.ok(doc(h).querySelector('[data-stage="post"]'));}
async function answer(h,values=['Sí','No','No']){for(let i=0;i<3;i++)await click(h,values[i],doc(h).querySelectorAll('[data-stage="post"] fieldset')[i]);}
async function screen(h,index){
  if(doc(h).querySelector('[data-screen-id]').dataset.screenId!=='library')await click(h,'Biblioteca',doc(h).querySelector('nav'));
  const buttons=doc(h).querySelectorAll('.pf-screen-links button');buttons[index].closest('details').open=true;
  await h.act(()=>buttons[index].dispatchEvent(new h.win.MouseEvent('click',{bubbles:true})));
}

// Risks introduced by the manual guide: time, explicit observation, context and scope.
test('manual cues, pause and visibility changes stop the clock and return the visual to rest without completing',async()=>{
  const h=await setup();assert.deepEqual(h.audio,[]);assert.deepEqual(h.results,[]);
  await start(h);await click(h,/2Respira$/);
  assert.equal(doc(h).querySelector('[data-floor-state]').dataset.floorState,'breathe');
  assert.ok(h.audio.at(-1).includes('pf.cue.respira'));
  await h.tick(2400);await click(h,'Pausar guía');const elapsed=doc(h).querySelector('[data-elapsed]').dataset.elapsed;
  await h.tick(60000);assert.equal(doc(h).querySelector('[data-elapsed]').dataset.elapsed,elapsed);
  assert.equal(doc(h).querySelector('[data-floor-state]').dataset.floorState,'rest');assert.deepEqual(h.results,[]);
  await click(h,'Continuar guía');await h.act(()=>{Object.defineProperty(doc(h),'hidden',{configurable:true,value:true});doc(h).dispatchEvent(new h.win.Event('visibilitychange'));});
  assert.equal(doc(h).querySelector('[data-playing]').dataset.playing,'false');assert.equal(doc(h).querySelector('[data-floor-state]').dataset.floorState,'rest');
  assert.deepEqual(h.results,[]);assert.equal(h.writes.some(w=>w.key==='pf-results'),false);assert.deepEqual(h.errors,[]);await h.dispose();
});

test('intentional completion has no minimum and requires explicit answers before offering only a fresh scoped perception result',async()=>{
  const historical={practiceId:'contrae',completed:true,cleanContraction:true,fullRelease:true,discomfort:false,postTension:false,recommendation:'progress',origin:'library',at:'2025-01-01T12:00:00.000Z'};
  const h=await setup({state:{'pf-results':[historical]}});await start(h);await finish(h);
  assert.equal(button(h,'Registrar mi respuesta').disabled,true);assert.equal(doc(h).querySelectorAll('[data-stage="post"] [aria-pressed="true"]').length,0);
  await answer(h);await click(h,'Registrar mi respuesta');assert.ok(doc(h).querySelector('[data-stage="result"]'));
  assert.equal(h.results.length,1);const r=h.results[0];
  assert.equal(r.practiceId,'percibe');assert.equal(r.completed,true);assert.equal(r.cleanContraction,null);assert.equal(r.recommendation,'repeat');
  assert.equal(r.day,6);assert.equal(r.activityId,'pelvic-daily-lab');assert.equal(r.intent,'daily-relax');assert.ok(Number.isFinite(Date.parse(r.at)));
  assert.deepEqual(h.state['pf-results'][0],historical);assert.equal(h.closed,0);assert.equal(h.writes.some(w=>w.key==='pf-screening'),false);
  assert.ok(text(doc(h).querySelector('[data-stage="result"]')).includes('Tu respuesta está preparada'));
  await click(h,'Volver a Hoy',doc(h).querySelector('[data-stage="result"]'));assert.equal(h.closed,1);assert.deepEqual(h.errors,[]);await h.dispose();
});

test('a failed host close keeps the iframe usable with its guide, clock and audio paused and no result',async()=>{
  const h=await setup({closeFails:true});await start(h);await click(h,/2Respira$/);await h.tick(2700);
  const paused=h.paused;await click(h,'Volver a Hoy',doc(h).querySelector('nav'));
  assert.equal(h.closed,1);assert.ok(doc(h).querySelector('[data-stage="run"]'));
  assert.equal(doc(h).querySelector('[data-playing]').dataset.playing,'false');assert.equal(doc(h).querySelector('[data-floor-state]').dataset.floorState,'rest');
  assert.ok(h.paused>paused);const elapsed=doc(h).querySelector('[data-elapsed]').dataset.elapsed;
  await h.tick(90000);assert.equal(doc(h).querySelector('[data-elapsed]').dataset.elapsed,elapsed);assert.deepEqual(h.results,[]);
  await click(h,'Continuar guía');await h.act(()=>h.win.dispatchEvent(new h.win.Event('spm:pelvic-pause')));
  assert.equal(doc(h).querySelector('[data-playing]').dataset.playing,'false');assert.deepEqual(h.errors,[]);await h.dispose();
});

test('interrupting can record a difficulty without completing, while a rejected write preserves answers for one retry',async()=>{
  const h=await setup();await start(h);await finish(h,true);await answer(h,['No','Sí','Sí']);await click(h,'Registrar mi respuesta');
  assert.deepEqual(h.results,[]);assert.equal(h.state['pf-daily-result'].completed,false);assert.notEqual(h.state['pf-daily-result'].recommendation,'progress');await h.dispose();
  const retry=await setup();await start(retry);await finish(retry);await answer(retry);retry.reject(true);await click(retry,'Registrar mi respuesta');
  assert.equal(doc(retry).querySelectorAll('[data-stage="post"] [aria-pressed="true"]').length,3);assert.deepEqual(retry.results,[]);
  retry.reject(false);await click(retry,'Reintentar registro');assert.equal(retry.results.length,1);assert.equal(retry.state['pf-results'].length,1);assert.deepEqual(retry.errors,[]);await retry.dispose();
});

test('a stale-day save is rejected and a safety review removes the practice instead of resuming it',async()=>{
  const h=await setup();await start(h);await finish(h);await answer(h);h.context.day=7;await click(h,'Registrar mi respuesta');
  assert.equal(doc(h).querySelectorAll('[data-stage="post"] [aria-pressed="true"]').length,3);assert.deepEqual(h.writes,[]);assert.deepEqual(h.results,[]);
  h.context.restriction='review';await h.notify();assert.ok(doc(h).querySelector('[data-practice-blocked="review"]'));assert.equal(doc(h).querySelector('[data-stage="run"]'),null);assert.deepEqual(h.errors,[]);await h.dispose();
});

test('all sixteen screens stay reachable without a contraction action in ready, awareness, relax or review',async()=>{
  for(const restriction of ['ready','awareness','relax','review']){
    const h=await setup({context:{origin:'library',intent:'library',activityId:null,restriction},state:{'pf-step':11}}),ids=[];
    for(let i=0;i<16;i++){
      await screen(h,i);ids.push(doc(h).querySelector('[data-screen-id]').dataset.screenId);
      assert.equal(doc(h).querySelectorAll('[data-practice]:not([data-practice="percibe"])').length,0,`${restriction}, screen ${i}`);
      assert.equal(doc(h).querySelectorAll('[data-floor-state="up"],[data-floor-state="hold"]').length,0,`${restriction}, screen ${i}`);
      assert.equal([...doc(h).querySelectorAll('button')].some(n=>/^(Contrae|Sostén|Breves|Sostenidas|Máxima)$/.test(text(n))),false);
      if(restriction==='review')assert.equal([...doc(h).querySelectorAll('button')].some(n=>text(n)==='Comenzar mi práctica'),false);
    }
    assert.equal(new Set(ids).size,16);assert.deepEqual(h.results,[]);assert.deepEqual(h.errors,[]);await h.dispose();
  }
});

test('flags and the local No lo sé observation cannot overwrite strength screening or recommend progression',async()=>{
  const h=await setup({context:{restriction:'ready'}});await screen(h,4);await click(h,'No lo sé');
  assert.equal(h.writes.some(w=>w.key==='pf-screening'),false);
  await click(h,/Dolor pélvico, perineal, testicular o al eyacular$/);assert.deepEqual(h.state['pf-flags'],[0]);
  await click(h,'Volver a la guía');await start(h);await finish(h);await answer(h);await click(h,'Registrar mi respuesta');
  assert.equal(h.results[0].recommendation,'relax');assert.equal(h.writes.some(w=>w.key==='pf-screening'),false);assert.deepEqual(h.errors,[]);await h.dispose();
});
