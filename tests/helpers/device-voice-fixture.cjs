const fs=require('node:fs'),path=require('node:path');
const {JSDOM}=require('../../scripts/qa/node_modules/jsdom');
const read=p=>fs.readFileSync(path.join(__dirname,'../..',p),'utf8');
const source=read('premium-v2/device-voice-v1.js');
const tick=()=>new Promise(resolve=>setImmediate(resolve));
function setup({missing=false,voices=[]}={}){
 const dom=new JSDOM('<!doctype html><html><head></head><body><section id="activity"></section></body></html>',{url:'https://spm.test/premium-v2/live.html',runScripts:'outside-only',pretendToBeVisual:true});
 const w=dom.window,calls=[],events={},timers=new Map();let timer=0,canceled=0,available=voices;
 w.HTMLMediaElement.prototype.pause=function(){};
 w.setTimeout=fn=>{timers.set(++timer,fn);return timer;};w.clearTimeout=id=>timers.delete(id);
 if(!missing){w.SpeechSynthesisUtterance=class{constructor(text){this.text=text;this.voice=null;this.rate=1;}};w.speechSynthesis={speak(u){calls.push(u);},cancel(){canceled++;},resume(){this.paused=false;},paused:false,getVoices:()=>available,addEventListener:(event,fn)=>{events[event]=fn;}};}
 w.eval(source);
 return{w,calls,timers,voice:w.SPM_VOICE,owner:w.document.querySelector('#activity'),setVoices(list){available=list;events.voiceschanged?.();},get canceled(){return canceled;},close(){dom.window.close();}};
}
// Legacy unit fixtures use a small application DOM. Run the real coordinator in
// JSDOM, forwarding its native utterances to that fixture's speech recorder.
// This proves delegation/wording, not acoustic playback or the fixture's layout.
function installOn(windowLike,Utterance){
 // A real JSDOM window must own its coordinator: DOM brands from separate
 // installed JSDOM copies cannot be mixed in MutationObserver/appendChild.
 if(windowLike.document?.defaultView===windowLike&&typeof windowLike.eval==='function'){
  if(Utterance)windowLike.SpeechSynthesisUtterance=Utterance;
  windowLike.eval(source);return windowLike.SPM_VOICE;
 }
 const dom=new JSDOM('<!doctype html><html><head></head><body></body></html>',{url:'https://spm.test/premium-v2/live.html',runScripts:'outside-only'});
 const w=dom.window;w.speechSynthesis=windowLike.speechSynthesis;
 w.SpeechSynthesisUtterance=Utterance||windowLike.SpeechSynthesisUtterance||class{constructor(text){this.text=text;this.voice=null;}};
 w.setTimeout=()=>1;w.clearTimeout=()=>{};w.eval(source);windowLike.SPM_VOICE=w.SPM_VOICE;
 require('node:test').after(()=>dom.window.close());
 return windowLike.SPM_VOICE;
}
module.exports={setup,read,tick,installOn};
