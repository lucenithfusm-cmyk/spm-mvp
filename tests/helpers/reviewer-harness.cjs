const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {JSDOM,ResourceLoader,VirtualConsole}=require('../../labs/desire/node_modules/jsdom');
const root=path.resolve(__dirname,'../..');
const wait=(ms=30)=>new Promise(resolve=>setTimeout(resolve,ms));
class LocalResources extends ResourceLoader{
  fetch(url){const parsed=new URL(url);if(parsed.hostname!=='spm.test')return null;const file=path.resolve(root,'.'+parsed.pathname);if(!file.startsWith(root+path.sep)||!fs.existsSync(file))return null;const request=Promise.resolve(fs.readFileSync(file));request.abort=()=>{};return request;}
}
async function harness(query='?programa=desire&dia=1'){
  const errors=[],observers=[],console=new VirtualConsole();console.on('jsdomError',error=>errors.push(error.message));
  const dom=new JSDOM(fs.readFileSync(path.join(root,'premium-v2/revision-programas-28-dias.html'),'utf8'),{
    url:'https://spm.test/premium-v2/revision-programas-28-dias.html'+query,runScripts:'dangerously',resources:new LocalResources(),pretendToBeVisual:true,virtualConsole:console,
    beforeParse(w){
      w.structuredClone=structuredClone;w.__originalStorage=w.localStorage;w.__originalStorage.setItem('spm_de_records','real-origin-record');
      w.HTMLElement.prototype.scrollIntoView=function(){};
      const Observer=w.MutationObserver;w.MutationObserver=class extends Observer{constructor(fn){super(fn);observers.push(this);}};
      w.IntersectionObserver=class{observe(){}unobserve(){}disconnect(){}};
      w.HTMLMediaElement.prototype.pause=function(){};w.HTMLMediaElement.prototype.load=function(){};w.HTMLMediaElement.prototype.play=async function(){};
      w.HTMLDialogElement.prototype.showModal=function(){this.open=true;};w.HTMLDialogElement.prototype.close=function(){this.open=false;};
      w.speechSynthesis={cancel(){},getVoices(){return[];},speak(){},addEventListener(){}};w.SpeechSynthesisUtterance=function(text){this.text=text;};
      w.matchMedia=()=>({matches:false,addEventListener(){},removeEventListener(){}});
    }
  });
  const until=Date.now()+5000;while(!dom.window.SPM_PROGRAM_REVIEW&&Date.now()<until)await wait();if(!dom.window.SPM_PROGRAM_REVIEW){dom.window.close();throw Error('Reviewer failed to initialize: '+errors.join('; '));}
  assert.equal(await dom.window.SPM_PROGRAM_REVIEW.ready,true,'review boots with real local renderers');
  await wait();return{w:dom.window,errors,close:()=>{observers.forEach(observer=>observer.disconnect());dom.window.close();}};
}
module.exports={harness,wait};
