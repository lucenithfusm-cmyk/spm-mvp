(()=>{'use strict';if(window.SPM_ACTIVITY_PHOTOS_V1)return;window.SPM_ACTIVITY_PHOTOS_V1=true;
const base='https://commons.wikimedia.org/wiki/Special:Redirect/file/';
const src=(name)=>base+encodeURIComponent(name)+'?width=960';
const PHOTO={
 walk:src('Walking_in_Park.jpg'),
 jog:src('Man_running_on_rural_path.jpg'),
 bike:src('Man_riding_bicycle_(Unsplash).jpg'),
 swim:src('Man_in_a_swimming_pool_(Unsplash).jpg'),
 dance:src('A_man_dancing_at_a_wedding.jpg'),
 strength:src('Attractive_man_lifting_dumbbell_weight_for_exercise_in_fitness_gym.jpg'),
 mobility:src('Stretching_before_a_run_(Unsplash).jpg')
};
const label={walk:['Caminata / caminadora','Walking / treadmill'],jog:['Trote','Jogging'],bike:['Bicicleta','Cycling'],swim:['Natación','Swimming'],dance:['Baile','Dance'],strength:['Fuerza funcional','Functional strength'],mobility:['Movilidad y recuperación','Mobility and recovery']};
const lang=()=>window.SPM_LANGUAGE?.get?.()||window.SPM_LANG||'es';
function imageFor(id){const im=document.createElement('img');im.className='spm-activity-photo';im.src=PHOTO[id]||PHOTO.walk;im.alt=(label[id]||['Actividad física','Physical activity'])[lang()==='en'?1:0];im.loading='lazy';im.decoding='async';im.referrerPolicy='no-referrer';return im;}
function upgrade(){document.querySelectorAll('.sr-dialog [data-activity]').forEach(card=>{const id=card.dataset.activity;if(!PHOTO[id])return;let im=card.querySelector('.spm-activity-photo');if(!im){const old=card.querySelector('.spm-motion-avatar,svg');im=imageFor(id);if(old)old.replaceWith(im);else card.prepend(im);}else{im.src=PHOTO[id];im.alt=(label[id]||['Actividad física','Physical activity'])[lang()==='en'?1:0];}card.classList.add('spm-activity-photo-card');});}
const style=document.createElement('style');style.id='spmActivityPhotosV1CSS';style.textContent=`.spm-activity-photo{display:block;width:100%;height:158px;object-fit:cover;object-position:center;border-radius:17px;margin:0 0 11px;background:#10252b;box-shadow:0 12px 26px rgba(0,0,0,.28);filter:saturate(.9) contrast(1.04)}.spm-activity-photo-card[data-activity="strength"] .spm-activity-photo{object-position:center 42%}.spm-activity-photo-card[data-activity="swim"] .spm-activity-photo{object-position:center 48%}.spm-activity-photo-card[data-activity="mobility"] .spm-activity-photo{object-position:center 58%}@media(max-width:430px){.spm-activity-photo{height:145px}}`;document.head.appendChild(style);
document.addEventListener('click',e=>{if(e.target.closest('[data-sr-open="movement"],[data-activity]'))setTimeout(upgrade,0);},true);new MutationObserver(()=>requestAnimationFrame(upgrade)).observe(document.documentElement,{childList:true,subtree:true});window.addEventListener('spm:languagechange',()=>setTimeout(upgrade,0));setTimeout(upgrade,0);setTimeout(upgrade,300);})();