const {test,before}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {JSDOM,VirtualConsole}=require('jsdom');
const {build}=require('../labs/breathing/node_modules/esbuild');
const root=path.resolve(__dirname,'../labs/breathing');let bundle;
before(async()=>{
 const result=await build({stdin:{contents:"import React from 'react';import {createRoot} from 'react-dom/client';import {FinalDeviceDemo} from './src/components/breath/FinalDeviceDemo';import {FINAL_DEMO_SCENES,FINAL_TRANSCRIPT} from './src/lib/final-demo-scenes';window.__scenes=FINAL_DEMO_SCENES;window.__transcript=FINAL_TRANSCRIPT;window.__act=React.act;window.IS_REACT_ACT_ENVIRONMENT=true;window.__root=createRoot(document.getElementById('root'));window.__mount=()=>window.__root.render(React.createElement(FinalDeviceDemo));",resolveDir:root,loader:'tsx'},bundle:true,write:false,format:'iife',platform:'browser',jsx:'automatic',alias:{'@':path.join(root,'src')},define:{'process.env.NODE_ENV':'"test"'}});bundle=result.outputFiles[0].text;
});
async function setup({missing=false}={}){
 const errors=[],console=new VirtualConsole();console.on('jsdomError',e=>errors.push(e.message));
 const dom=new JSDOM('<div id="root"></div>',{url:'https://spm.test/premium-v2/breathing-lab/index.html',runScripts:'outside-only',pretendToBeVisual:true,virtualConsole:console}),w=dom.window,calls=[];let canceled=0,plays=0,reject=false;
 w.MessageChannel=class{constructor(){this.port1={onmessage:null};this.port2={postMessage:data=>setImmediate(()=>this.port1.onmessage?.({data}))};}};
 w.HTMLMediaElement.prototype.pause=function(){};w.HTMLMediaElement.prototype.load=function(){};
 w.HTMLMediaElement.prototype.play=function(){plays++;return reject?Promise.reject(Error('blocked')):Promise.resolve();};
 if(!missing){w.SpeechSynthesisUtterance=class{constructor(text){this.text=text;this.voice=null;}};w.speechSynthesis={getVoices:()=>[],addEventListener(){},speak(u){calls.push(u);u.onstart?.();},cancel(){canceled++;},resume(){},paused:false};}
 w.eval(fs.readFileSync(path.resolve(root,'../../premium-v2/device-voice-v1.js'),'utf8'));w.eval(bundle);
 const act=async fn=>w.__act(fn);await act(()=>w.__mount());
 return{w,calls,errors,act,get canceled(){return canceled;},get plays(){return plays;},reject(value){reject=value;},async close(){await act(()=>w.__root.unmount());w.close();}};
}
const figure=h=>h.w.document.querySelector('figure'),button=(h,label)=>[...figure(h).querySelectorAll('button')].find(n=>n.textContent===label);
async function click(h,label){const node=button(h,label);assert.ok(node,label);assert.equal(node.disabled,false,label+' enabled');await h.act(()=>node.click());}

test('the six original scenes have complete readable narration and no autoplay or automatic progression',async()=>{
 const h=await setup();try{
  assert.equal(h.calls.length,0);assert.equal(h.plays,0);assert.equal(h.w.__scenes.length,6);
  assert.ok(figure(h).textContent.includes(h.w.__transcript));
  for(let i=0;i<6;i++){
   assert.match(figure(h).querySelector('figcaption').textContent,new RegExp(`escena ${i+1} de 6`));
   assert.equal(figure(h).querySelector('img').getAttribute('src'),`./media/device-demo/scene-${i+1}.jpg`);
   assert.ok(fs.existsSync(path.join(root,'public/media/device-demo',`scene-${i+1}.jpg`)));
   await click(h,'Escuchar escena');const u=h.calls.at(-1);assert.equal(u.text,h.w.__scenes[i].text);assert.equal(u.lang,'es-CO');assert.equal(u.voice,null);
   await h.act(()=>u.onend());assert.match(figure(h).querySelector('figcaption').textContent,new RegExp(`escena ${i+1} de 6`));
   if(i<5)await click(h,'Siguiente escena');
  }
  assert.equal(button(h,'Siguiente escena').disabled,true);assert.deepEqual(h.errors,[]);
 }finally{await h.close();}
});
test('pause repeats the current text; manual navigation and unmount cancel speech and invalidate old callbacks',async()=>{
 const h=await setup();try{
  await click(h,'Escuchar escena');const old=h.calls.at(-1),late=old.onend;
  await click(h,'Pausar voz');assert.equal(h.w.SPM_VOICE.state,'paused');await click(h,'Reanudar desde este párrafo');assert.equal(h.calls.at(-1).text,old.text);
  const count=h.calls.length;await click(h,'Siguiente escena');await h.act(()=>late());assert.equal(h.calls.length,count);assert.match(figure(h).querySelector('figcaption').textContent,/escena 2/);
  await click(h,'Escuchar escena');const canceled=h.canceled;await h.act(()=>h.w.__root.unmount());assert.ok(h.canceled>canceled);assert.equal(h.w.SPM_VOICE.speaking,false);
 }finally{h.w.close();}
});
test('a blocked or absent voice leaves the complete text and a retry; the preserved motion is always muted',async()=>{
 const h=await setup({missing:true});try{
  await click(h,'Escuchar escena');assert.ok(button(h,'Reintentar voz'));assert.ok(figure(h).textContent.includes(h.w.__transcript));
  const video=figure(h).querySelector('video');assert.equal(video.muted,true);assert.equal(video.controls,false);
  await h.act(()=>{video.muted=false;video.dispatchEvent(new h.w.Event('volumechange'));});assert.equal(video.muted,true);
  h.reject(true);await click(h,'Ver movimiento sin voz');assert.match(figure(h).textContent,/No se pudo reproducir el movimiento/);
  h.reject(false);await click(h,'Ver movimiento sin voz');assert.ok(button(h,'Pausar movimiento'));assert.equal(h.plays,2);assert.equal(h.calls.length,0);
 }finally{await h.close();}
});
