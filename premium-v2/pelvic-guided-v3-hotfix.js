(()=>{
'use strict';
if(!window.SPM_PELVIC_V2&&!document.querySelector('script[data-spm-pelvic-v2]')){
  const s=document.createElement('script');
  s.src='pelvic-module-rebuild-v2.js?v=20261114-pelvic-ux4';
  s.defer=true;
  s.dataset.spmPelvicV2='1';
  document.head.appendChild(s);
}
})();
