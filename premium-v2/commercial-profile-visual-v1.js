(()=>{
'use strict';
// Presentation-only enhancement of the existing question-18 transition.
// The journey module owns assessment state, timing, closing and the approved film.
const STYLE_ID='spmProfileVisualCSS';
const COLORS=[['#79e5c3','121,229,195'],['#70cbff','112,203,255'],['#b29dff','178,157,255'],['#f2c777','242,199,119'],['#f29bb9','242,155,185']];
const media=window.matchMedia?.('(prefers-reduced-motion: reduce)');
const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function addCSS(){
  if(document.getElementById(STYLE_ID))return;
  const style=document.createElement('style');style.id=STYLE_ID;
  style.textContent=`
.spmJourneyCard.spmProfileCard{width:min(730px,100%);padding:25px 28px 24px;background:radial-gradient(ellipse at 50% 30%,#12383f 0,transparent 60%),linear-gradient(160deg,#0a252c,#04151c);border-color:#5ca49750}
.spmProfileCard h2{font-size:clamp(27px,4vw,36px);line-height:1.09;letter-spacing:-.04em;margin:13px 0 0;max-width:540px;color:#effbf5}
.spmProfileBuild{position:relative;margin:17px 0 14px;isolation:isolate}
.spmProfileToolbar{display:flex;align-items:center;justify-content:space-between;gap:10px;color:#92b8b8;font-size:10px;letter-spacing:.04em}
.spmProfileToolbar>span{display:flex;align-items:center;gap:7px}.spmProfileToolbar>span:before{content:'';width:5px;height:5px;border-radius:50%;background:#88e4c9;box-shadow:0 0 12px #88e4c9}
.spmProfilePause{flex:none;min-height:34px;min-width:80px;padding:7px 10px;border:1px solid #375a6066;border-radius:99px;background:#06232b9c;color:#bde0d7;font-size:10px;font-weight:750;cursor:pointer;touch-action:manipulation}
.spmProfilePause:focus-visible{outline:2px solid #91e8d2;outline-offset:3px}
.spmProfileCore{height:113px;position:relative;margin:2px 0 7px;background:radial-gradient(ellipse at center,#83e9cd12,transparent 62%)}
.spmProfileCore svg{display:block;width:100%;height:100%;overflow:visible}
.spmProfilePathBase{fill:none;stroke:var(--signal-color);stroke-width:1;opacity:.2}
.spmProfilePathLive{fill:none;stroke:var(--signal-color);stroke-width:2;stroke-linecap:round;stroke-dasharray:3 18;animation:spmProfileTravel 3s linear infinite;animation-delay:calc(var(--row)*-.42s);opacity:.88}
.spmProfileNode{fill:var(--signal-color);animation:spmProfileGlow 2.6s ease-in-out infinite;animation-delay:calc(var(--row)*-.38s)}
.spmProfileHalo{fill:none;stroke:#84e6cd;stroke-width:1;transform-box:fill-box;transform-origin:center;animation:spmProfileHalo 3.6s ease-out infinite}
.spmProfileHalo.outer{animation-delay:-1.8s}
.spmProfileCore text{font-family:system-ui,-apple-system,Segoe UI,sans-serif;font-weight:900;font-size:27px;letter-spacing:-2px;fill:#edfff6}
.spmProfileChannels{display:grid;gap:0;margin:0;padding:0;list-style:none}
.spmProfileChannel{padding:10px 0 11px;border-bottom:1px solid #56818324}
.spmProfileChannel:last-child{border-bottom:0}
.spmProfileChannelHead{display:flex;align-items:center;gap:8px;margin-bottom:8px;font-size:12px;font-weight:750;color:#d5e9e7;line-height:1.2}
.spmProfileChannelHead:before{content:'';width:5px;height:5px;border-radius:50%;background:var(--signal-color);box-shadow:0 0 11px rgba(var(--signal-rgb),.48)}
.spmProfileChannelHead:after{content:'';height:1px;flex:1;margin-left:5px;background:linear-gradient(90deg,rgba(var(--signal-rgb),.22),transparent)}
.spmProfileEqualizer{display:grid;grid-template-columns:repeat(32,minmax(0,1fr));align-items:end;gap:4px;height:31px;overflow:hidden}
.spmProfileEqualizer i{display:block;height:100%;min-width:0;border-radius:3px 3px 1px 1px;transform-origin:bottom;transform:scaleY(var(--mid));background:linear-gradient(0deg,rgba(var(--signal-rgb),.24),var(--signal-color));box-shadow:0 0 9px rgba(var(--signal-rgb),.22);animation:spmProfileBars var(--speed) ease-in-out infinite;animation-delay:var(--delay)}
.spmProfileBuild[data-motion=paused] *,.spmProfileBuild[data-motion=paused] *:before,.spmProfileBuild[data-motion=paused] *:after{animation-play-state:paused!important}
.spmProfileCard>p.spmJMini{font-size:12px!important;line-height:1.5!important;margin:10px 0 0!important;color:#acd0c9!important;font-weight:650!important}
.spmProfileCard>p[hidden]{display:none!important}
.spmProfileCard .spmJActions{margin-top:17px}
.spmProfileCard .spmJBtn.pri{min-height:48px;padding:13px 18px;font-size:15px;border-radius:15px;box-shadow:0 5px 26px #70d6bb14}
@keyframes spmProfileTravel{to{stroke-dashoffset:-126}}
@keyframes spmProfileGlow{0%,100%{opacity:.45}50%{opacity:1}}
@keyframes spmProfileHalo{0%{opacity:.45;transform:scale(.9)}100%{opacity:0;transform:scale(1.36)}}
@keyframes spmProfileBars{0%,100%{transform:scaleY(var(--low));opacity:.48}35%{transform:scaleY(var(--high));opacity:1}70%{transform:scaleY(var(--mid));opacity:.72}}
@media(max-width:620px){
 .spmJourneyCard.spmProfileCard{padding:21px 18px 19px;border-radius:24px}
 .spmProfileCard h2{font-size:28px;margin-top:11px;max-width:360px}
 .spmProfileBuild{margin:13px 0 9px}.spmProfileCore{height:83px;margin:1px 0 4px}
 .spmProfileToolbar{font-size:9px}.spmProfilePause{min-height:32px;min-width:76px;padding:6px 8px;font-size:9px}
 .spmProfileChannel{padding:8px 0 9px}.spmProfileChannelHead{font-size:11px;margin-bottom:6px}
 .spmProfileEqualizer{height:26px;gap:3px}.spmProfileEqualizer i{border-radius:2px 2px 1px 1px}
 .spmProfileCard>p.spmJMini{font-size:11px!important}.spmProfileCard .spmJActions{margin-top:15px}
}
`;
  document.head.appendChild(style);
}
function setMotion(build,paused){
  build.dataset.motion=paused?'paused':'active';
  const button=build.querySelector('.spmProfilePause'),en=build.dataset.language==='en';
  button.setAttribute('aria-pressed',String(paused));
  button.setAttribute('aria-label',paused?(en?'Resume animation':'Reanudar animación'):(en?'Pause animation':'Pausar animación'));
  button.textContent=paused?(en?'▶ Resume':'▶ Reanudar'):(en?'Ⅱ Pause':'Ⅱ Pausar');
}
function enhance(grid){
  const card=grid.closest('.spmJourneyCard');if(!card)return;
  const names=[...grid.querySelectorAll('.spmJSignal')].map(node=>node.textContent.trim());
  if(names.length!==5)return;
  const en=names[0]==='Physical response';
  addCSS();card.classList.add('spmProfileCard');
  const build=document.createElement('div');build.className='spmProfileBuild';build.dataset.language=en?'en':'es';
  const paths=names.map((_,n)=>{const y=16+n*24;return `<g style="--signal-color:${COLORS[n][0]};--row:${n}"><path class="spmProfilePathBase" d="M34 ${y} C122 ${y} 162 64 218 64 M302 64 C358 64 398 ${y} 486 ${y}"/><path class="spmProfilePathLive" d="M34 ${y} C122 ${y} 162 64 218 64 M302 64 C358 64 398 ${y} 486 ${y}"/><circle class="spmProfileNode" cx="34" cy="${y}" r="3"/><circle class="spmProfileNode" cx="486" cy="${y}" r="3"/></g>`}).join('');
  const channels=names.map((name,row)=>`<li class="spmProfileChannel" style="--signal-color:${COLORS[row][0]};--signal-rgb:${COLORS[row][1]}"><div class="spmProfileChannelHead">${escape(name)}</div><div class="spmProfileEqualizer" aria-hidden="true">${Array.from({length:32},(_,bar)=>{const seed=(bar*7+row*13)%23;return `<i style="--low:${(.12+(seed%5)*.06).toFixed(2)};--mid:${(.38+(seed%7)*.07).toFixed(2)};--high:${(.68+(seed%8)*.04).toFixed(2)};--speed:${(1.8+(seed%9)*.18).toFixed(2)}s;--delay:-${((bar*11+row*17)%37/10).toFixed(1)}s"></i>`}).join('')}</div></li>`).join('');
  build.innerHTML=`<div class="spmProfileToolbar"><span>${en?'Connecting your responses':'Conectando tus respuestas'}</span><button class="spmProfilePause" type="button"></button></div><div class="spmProfileCore" aria-hidden="true"><svg viewBox="0 0 520 128" preserveAspectRatio="xMidYMid meet">${paths}<circle class="spmProfileHalo" cx="260" cy="64" r="45"/><circle class="spmProfileHalo outer" cx="260" cy="64" r="45"/><rect x="218" y="34" width="84" height="60" rx="19" fill="#09252d" stroke="#8cdec577"/><text x="259" y="73" text-anchor="middle">SPM</text></svg></div><ul class="spmProfileChannels" aria-label="${en?'Profile areas being connected':'Áreas del perfil que se están conectando'}">${channels}</ul>`;
  grid.replaceWith(build);
  setMotion(build,!!media?.matches);
  build.querySelector('.spmProfilePause').addEventListener('click',()=>setMotion(build,build.dataset.motion!=='paused'));
  const caption=card.querySelector('.spmJMini');
  if(caption){caption.textContent=en?'Every response connects another piece of your profile.':'Cada respuesta conecta una pieza de tu perfil.';const detail=caption.nextElementSibling;if(detail?.tagName==='P')detail.hidden=true;}
  const heading=card.querySelector('h2');if(heading){heading.id='spmProfileBuildHeading';card.closest('.spmJourney')?.setAttribute('aria-labelledby',heading.id);}
}
function mount(){document.querySelectorAll('.spmJourneyCard .spmJSignalGrid').forEach(enhance)}
new MutationObserver(mount).observe(document.documentElement,{childList:true,subtree:true});
media?.addEventListener?.('change',event=>document.querySelectorAll('.spmProfileBuild').forEach(build=>setMotion(build,event.matches)));
mount();
})();
