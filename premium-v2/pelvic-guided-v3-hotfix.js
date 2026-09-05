(()=>{
'use strict';
if(!document.querySelector('script[data-spm-pelvic-v2]')){
  const s=document.createElement('script');
  s.src='pelvic-module-rebuild-v2.js';
  s.defer=true;
  s.dataset.spmPelvicV2='1';
  document.head.appendChild(s);
}
})();