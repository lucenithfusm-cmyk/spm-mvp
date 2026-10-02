(()=>{
'use strict';
const TIPS={
 nutrition:[
  {id:'nut.01',title:'Arma un plato más completo',body:'Hoy intenta incluir una fuente de proteína que ya toleres junto con una porción generosa de vegetales. Puede ser pescado, pollo, huevo, leguminosas, tofu u otra opción compatible con tu alimentación.',cta:'Abrir Nutrición SPM'},
  {id:'nut.02',title:'Añade color al plato',body:'Incluye hoy al menos dos tipos de vegetales o frutas de colores diferentes. La meta es variedad, no perfección.',cta:'Abrir Nutrición SPM'},
  {id:'nut.03',title:'Cambia una bebida',body:'Si hoy tomas una bebida azucarada, prueba reemplazar una por agua, agua con gas sin azúcar o una bebida sin azúcar que toleres.',cta:'Abrir Nutrición SPM'},
  {id:'nut.04',title:'Incluye una fuente cardioprotectora',body:'Elige hoy una opción como leguminosas, frutos secos, pescado, aceite de oliva o vegetales variados, siempre que sea compatible con tus indicaciones médicas.',cta:'Abrir Nutrición SPM'},
  {id:'nut.05',title:'Haz una comida más predecible',body:'Evita llegar con hambre extrema. Si puedes, organiza una comida principal con proteína, vegetales y una porción de carbohidrato que te resulte adecuada.',cta:'Abrir Nutrición SPM'},
  {id:'nut.06',title:'Menos ultraprocesado, más comida real',body:'Elige hoy una preparación sencilla hecha con alimentos reconocibles en lugar de uno de tus ultraprocesados habituales.',cta:'Abrir Nutrición SPM'},
  {id:'nut.07',title:'Observa cómo comes',body:'Come hoy una comida sin pantalla y un poco más despacio. SPM busca hábitos sostenibles, no reglas rígidas.',cta:'Abrir Nutrición SPM'},
  {id:'nut.08',title:'Planifica una opción fácil',body:'Deja lista una opción simple para mañana: fruta, yogur natural, frutos secos, huevos, leguminosas u otra alternativa adecuada para ti.',cta:'Abrir Nutrición SPM'},
  {id:'nut.09',title:'No busques un “afrodisíaco”',body:'Hoy enfócate en patrón y consistencia: alimentos variados, proteína suficiente para tus necesidades, vegetales y buena hidratación.',cta:'Abrir Nutrición SPM'},
  {id:'nut.10',title:'Revisa una sola mejora',body:'Elige una cosa de tu alimentación que puedas sostener esta semana. Una mejora pequeña y repetible vale más que una dieta extrema.',cta:'Abrir Nutrición SPM'}
 ],
 movement:[
  {id:'mov.01',title:'Camina con intención',body:'Si es seguro para ti, realiza hoy 20–30 minutos de caminata a un ritmo que te haga respirar un poco más rápido sin impedirte hablar.',cta:'Abrir Movimiento SPM'},
  {id:'mov.02',title:'Rompe el tiempo sentado',body:'Cada cierto tiempo, levántate unos minutos, camina o cambia de posición. No necesitas que todo el movimiento ocurra en una sola sesión.',cta:'Abrir Movimiento SPM'},
  {id:'mov.03',title:'Suma movimiento cotidiano',body:'Hoy elige una oportunidad concreta: caminar una distancia corta, usar escaleras si son seguras para ti o hacer una vuelta adicional.',cta:'Abrir Movimiento SPM'},
  {id:'mov.04',title:'Movilidad breve',body:'Dedica 5–10 minutos a movilidad suave de cuello, hombros, columna, caderas y tobillos, sin llevar ninguna zona al dolor.',cta:'Abrir Movimiento SPM'},
  {id:'mov.05',title:'Un poco más de ritmo',body:'En una parte de tu caminata habitual, aumenta el ritmo durante unos minutos y vuelve luego a un paso cómodo.',cta:'Abrir Movimiento SPM'},
  {id:'mov.06',title:'Fuerza funcional',body:'Si tu condición física lo permite, practica una rutina breve con movimientos básicos como sentarte y levantarte de una silla, empujar una pared o elevar talones.',cta:'Abrir Movimiento SPM'},
  {id:'mov.07',title:'Muévete después de una comida',body:'Una caminata suave después de una comida puede ser una forma práctica de sumar actividad sin convertirla en un entrenamiento formal.',cta:'Abrir Movimiento SPM'},
  {id:'mov.08',title:'Hazlo fácil de repetir',body:'Elige hoy un tipo de movimiento que realmente podrías repetir varias veces por semana. SPM prioriza adherencia sobre intensidad.',cta:'Abrir Movimiento SPM'},
  {id:'mov.09',title:'Observa tu energía',body:'Después de moverte, registra mentalmente cómo quedó tu energía. La actividad debe adaptarse a tu tolerancia, no agotarte por obligación.',cta:'Abrir Movimiento SPM'}
 ],
 sleep:[
  {id:'slp.01',sleepTipId:'sl-horario-01',title:'Protege tu hora de despertar',body:'Intenta mantener mañana una hora de despertar similar a la habitual. La regularidad ayuda a ordenar el ritmo de sueño.',cta:'Abrir Sueño SPM'},
  {id:'slp.02',sleepTipId:'sl-pantallas-01',title:'Baja la estimulación esta noche',body:'Si puedes, reduce pantallas y luz intensa durante la última 1–2 horas antes de dormir y cambia a una actividad más tranquila.',cta:'Abrir Sueño SPM'},
  {id:'slp.03',sleepTipId:'sl-habitacion-01',title:'Prepara la habitación',body:'Haz hoy un ajuste sencillo: menos luz, menos ruido, una temperatura cómoda o retirar una distracción del dormitorio.',cta:'Abrir Sueño SPM'},
  {id:'slp.04',sleepTipId:'sl-rutina-01',title:'Crea una rutina de cierre',body:'Reserva 30–60 minutos para una secuencia tranquila y repetible: higiene, lectura, música suave, estiramiento o ducha tibia.',cta:'Abrir Sueño SPM'},
  {id:'slp.05',sleepTipId:'sl-cafeina-01',title:'Revisa la cafeína',body:'Si sueles tomar café, té energizante o bebidas estimulantes tarde, prueba adelantar hoy la última toma y observa si cambia tu descanso.',cta:'Abrir Sueño SPM'},
  {id:'slp.06',sleepTipId:'sl-alcohol-01',title:'No uses alcohol para dormir',body:'El alcohol puede dar sueño al inicio pero fragmentar el descanso. Evita usarlo como estrategia para conciliar el sueño.',cta:'Abrir Sueño SPM'},
  {id:'slp.07',sleepTipId:'sl-cena-01',title:'Cena con margen',body:'Si es posible, evita acostarte inmediatamente después de una comida muy abundante. Deja algo de tiempo para que el cuerpo se acomode.',cta:'Abrir Sueño SPM'},
  {id:'slp.08',sleepTipId:'sl-movimiento-02',title:'Luz natural al comenzar el día',body:'Busca algunos minutos de luz natural durante la mañana cuando sea posible. Es una señal útil para tu ritmo de sueño-vigilia.',cta:'Abrir Sueño SPM'},
  {id:'slp.09',sleepTipId:'sl-despertares-02',title:'Si no puedes dormir, evita pelear con el sueño',body:'Si llevas un buen rato despierto y frustrado, sal de la cama un momento, realiza una actividad tranquila con poca luz y vuelve cuando aparezca sueño.',cta:'Abrir Sueño SPM'}
 ]
};
const ORDER=['nutrition','movement','sleep'];
const META={
 nutrition:{label:'Nutrición',resourceId:'wellness.nutrition'},
 movement:{label:'Movimiento',resourceId:'wellness.movement'},
 sleep:{label:'Sueño',resourceId:'wellness.sleep'}
};
function day(){return Number(window.SPM_CURRENT_DAY||document.documentElement.dataset.spmCurrentDay||1)||1}
function tipFor(d=day()){
 const cat=ORDER[(d-1)%3],round=Math.floor((d-1)/3),list=TIPS[cat],tip=list[round%list.length];
 return {...tip,category:cat,label:META[cat].label,resourceId:META[cat].resourceId,day:d};
}
function render(){
 const hero=document.getElementById('spmTodayHero');if(!hero)return;
 const tip=tipFor();let box=document.getElementById('spmWellnessTip');
 if(!box){box=document.createElement('section');box.id='spmWellnessTip';box.className='spm-wellness-tip';hero.appendChild(box)}
 box.innerHTML='<div class="spm-wellness-kicker">RECOMENDACIÓN DE BIENESTAR · '+tip.label.toUpperCase()+'</div><h3>'+tip.title+'</h3><p>'+tip.body+'</p><div class="spm-wellness-actions"><span>Consejo breve · '+tip.label+' reaparece cada 3 días</span><div class="spm-wellness-buttons"><button type="button" class="btn sec" id="spmWellnessOpen">'+tip.cta+'</button><button type="button" class="btn sec" id="spmWellnessLibrary">Biblioteca Bienestar</button></div></div>';
 const btn=document.getElementById('spmWellnessOpen');
 if(btn)btn.onclick=()=>{if(tip.category==='nutrition'&&window.SPM_RESOURCES?.open)return window.SPM_RESOURCES.open('nutrition',tip.day,{origin:'dailyPlan'});if(tip.category==='movement'&&window.SPM_RESOURCES?.open)return window.SPM_RESOURCES.open('movement',tip.day,{origin:'dailyPlan'});if(tip.category==='sleep'&&window.SPM_SLEEP_LIBRARY_V1?.open)return window.SPM_SLEEP_LIBRARY_V1.open({origin:'dailyPlan',tip:tip.sleepTipId});window.dispatchEvent(new CustomEvent('spm:open-wellness-library',{detail:{resourceId:tip.resourceId,origin:'dailyPlan',day:tip.day}}));};document.getElementById('spmWellnessLibrary')?.addEventListener('click',()=>window.SPM_WELLNESS_LIBRARY_V1?.open?.({origin:'dailyPlan'}));
 try{localStorage.setItem('spm_wellness_tip_today_v1',JSON.stringify({...tip,shownAt:new Date().toISOString()}))}catch(_){}
}
document.addEventListener('click',e=>{if(e.target.closest('#navPlan,#goPlan,.phaseBtn,.doneBtn'))setTimeout(render,280)});
document.addEventListener('DOMContentLoaded',()=>setTimeout(render,1400),{once:true});
setTimeout(render,2200);
const css=document.createElement('style');css.textContent='.spm-wellness-tip{margin-top:12px;padding:14px 15px;border:1px solid rgba(240,199,118,.24);border-radius:15px;background:linear-gradient(145deg,rgba(240,199,118,.07),rgba(255,255,255,.02))}.spm-wellness-kicker{font-size:10px;font-weight:950;letter-spacing:.12em;color:#f0c776}.spm-wellness-tip h3{margin:5px 0}.spm-wellness-tip p{margin:0;color:var(--muted);line-height:1.5}.spm-wellness-actions{display:flex;gap:10px;justify-content:space-between;align-items:center;margin-top:11px}.spm-wellness-actions span{font-size:11px;color:#b8c9c6}.spm-wellness-buttons{display:flex;gap:8px;flex-wrap:wrap}.spm-wellness-actions .btn{white-space:nowrap}@media(max-width:650px){.spm-wellness-actions{align-items:stretch;flex-direction:column}.spm-wellness-actions .btn{width:100%}}';document.head.appendChild(css);
window.SPM_WELLNESS_DAILY_TIP_V1={tipFor,TIPS,ORDER,render};
})();