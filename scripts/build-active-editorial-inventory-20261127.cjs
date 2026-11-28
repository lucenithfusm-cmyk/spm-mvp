#!/usr/bin/env node
/* Reviewed Spanish source corpus. Content identities come from the runtime agenda export.
 * Text packets are shared by reference: repeated assignments do not duplicate a script.
 */
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),cp=require('node:child_process'),crypto=require('node:crypto');
const {extract,root}=require('./editorial-source-data-20261127.cjs');
const {parse:parseSource}=require('./audit-editorial-corpus-20261127.cjs');
const {uiText}=require('./editorial-ui-text-20261127.cjs');
const ts=require('../labs/desire/node_modules/typescript');
const {JSDOM}=require('../labs/desire/node_modules/jsdom');
const base='c27bbbba0292513b898d0684a30a95cd1e4e6449',out=path.join(root,'docs/qa/editorial-20261127');
const read=(file,old=false)=>old?(()=>{try{return cp.execFileSync('git',['show',base+':'+file],{cwd:root,encoding:'utf8',maxBuffer:30e6,stdio:['ignore','pipe','ignore']});}catch{return '';}})():fs.readFileSync(path.join(root,file),'utf8');
const sha=x=>crypto.createHash('sha256').update(x).digest('hex');
const agendaContext={window:{}};vm.runInNewContext(read('premium-v2/agenda-manifest-20261127.js'),agendaContext);
const manifest=agendaContext.window.SPM_AGENDA_MANIFEST;
const assignments=[],contents=new Map();
for(const[route,days]of Object.entries(manifest.routes))for(const[day,entry]of Object.entries(days))for(const a of [entry.primary,entry.support,...entry.explanations,...entry.resources].filter(Boolean)){
 const row={route,day:Number(day),role:a.role,assignment_id:a.assignmentId,content_id:a.contentId,title:a.title,kind:a.kind,optional:a.optional,source_day:a.sourceDay,source_route:a.sourceRoute};assignments.push(row);
 if(!contents.has(a.contentId))contents.set(a.contentId,{...a,appearances:[],source_packets:[]});contents.get(a.contentId).appearances.push(row);
}
function runtime(files,global,old=false){
 const dom=new JSDOM('<html><head></head><body></body></html>',{runScripts:'outside-only',url:'https://spm.test/premium-v2/live.html'}),w=dom.window;
 w.setTimeout=()=>0;w.setInterval=()=>0;w.requestAnimationFrame=()=>0;
 w.MutationObserver=class{observe(){}disconnect(){}};w.IntersectionObserver=class{observe(){}unobserve(){}disconnect(){}};
 try{for(const file of files)vm.runInContext(read(file,old),dom.getInternalVMContext(),{timeout:2500,filename:file});return JSON.parse(JSON.stringify(w[global]));}finally{w.close();}
}
function data(file,names,old=false){const result=extract(file,names,read(file,old));if(Object.keys(result.errors).length)throw Error(file+': '+JSON.stringify(result.errors));return Object.fromEntries(Object.entries(result.values).map(([k,v])=>[k,v.value]));}
function commonJS(file,old=false,typescript=false){const module={exports:{}};const source=read(file,old);vm.runInNewContext(typescript?ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText:source,{module,exports:module.exports},{timeout:2500,filename:file});return module.exports;}
function assignmentData(file,key,old=false){const c={window:{}};vm.runInNewContext(read(file,old),c,{timeout:2500});return c.window[key];}
const excludedKeys=new Set(['en','id','key','type','phase','route','kind','metric','audioId','audioSrc','url','src','image','img','file','filename','poster','path','color','clinicalKey','ctaAction','target','action','resourceLinks','resources','practiceId','practice','category','state','origin','icon','source','when','checkpoint','mode','cueSet']);
function textLeaves(value,prefix='',result={}){
 if(typeof value==='string'){
  if(value.length>1&&value.length<15000&&!/^(?:https?:|data:|assets\/|\/premium-v2\/|\.?\.?\/)/.test(value)&&!/(?:\.webp|\.png|\.jpg|\.mp3|\.mp4|\.js|\.css)$/.test(value)&&!/^[@#]?[a-z\d_.:-]+$/.test(value)&&/[A-Za-zÀ-ÿ]/.test(value))result[prefix]=value;
 }else if(value&&typeof value==='object')for(const[k,v]of Object.entries(value)){
  // "practice" and "action" are prose in curricular/habit packets; retain prose values.
  if(/_en$/.test(k)||excludedKeys.has(k)&&!(['practice','action'].includes(k)&&typeof v==='string'&&/\s/.test(v)))continue;
  textLeaves(v,prefix?(prefix+'.'+k):k,result);
 }
 return result;
}
const packets=[],unitTexts=[],errors=[],supplementalUnits=[];
const familyContext={
 onboarding:{objective:'Explicar el recorrido y recoger el punto de partida sin diagnóstico, resultado prometido ni obligación de pareja.',action:'Responder según experiencia; consultar orientación y controles disponibles. La pausa pública y los derechos de compra existentes se respetan.',record:'assessment.answers y motivos con sus IDs/escalas/pesos originales; borrador de invitado y recibo autenticado son estados distintos; no crear una práctica por consultar la orientación.',close:'Continuar o guardar según el paso real; la aprobación de pago la confirma el servidor. Las revisiones14/28 son voluntarias.',modality:'Individual; la conexión y el disfrute pueden ser individuales o compartidos.'},
 continuity:{objective:'Describir actividad, registro y cierre disponibles sin atribuir realización, mejoría o guardado no confirmado.',action:'Consultar indicación y elegir la acción explícita del control; respetar restricciones de seguridad.',record:'Identidad de plan/jornada/asignación y datos realmente registrados; cero, no evaluable y ausente conservan significado.',close:'Sólo confirmación de guardado/cierre de la operación real; una consulta o una guía no completa una práctica.',modality:'Individual; acompañamiento o pareja sólo donde la fuente lo contempla.'},
 erection:{objective:'Reconocer contextos/respuesta y elegir una decisión o práctica según la sesión aprobada.',action:'Seguir las pantallas de la sesión asignada; escuchar no acredita práctica.',record:'erectionPracticeVersion; erectionLesson; campos específicos de la sesión; ansiedad/confianza opcionales. DE01 distingue EHS0/No evaluable/omisión y atención realizada/omitida.',close:'Guardar en la pantalla de registro; retorno a Hoy. El cierre diario es independiente.',modality:'Individual; referencias a pareja solo si hubo experiencia o acuerdo.'},
 desire:{objective:'Explorar interés, preferencias, contexto y continuidad sin exigir deseo ni mejoría.',action:'Fuente del día; preparación individual o compartida cuando el guion lo ofrece.',record:'State/Program de Deseo; Session.metricKey y before/after/extra separados; reflexión opcional; confirmación real de actividad.',close:'Guardar y continuar; no equiparar una sesión de laboratorio con cierre del día.',modality:'Individual o en pareja según práctica y elección; no atribuir a la pareja preferencias no expresadas.'},
 confidence:{objective:'Reflexionar sobre contexto, atención y confianza, incluyendo ausencia de cambios.',action:'Elegir/registrar según campos visibles. Formularios alternativos y recursos conservan escalas propias.',record:'confidenceDay; answers específicos. Confianza13 admite sin cambios/no valorable; Confianza24 Otra respuesta; no convertir esos textos en cero.',close:'Guardar y continuar o Continuar, según pantalla; el dato guardado no prueba una práctica física.',modality:'Individual; puede preparar comunicación sin compartirla.'},
 connection:{objective:'Reconocer satisfacción, placer, ritmo, comunicación y prioridades sin presuponer relación ni mejoría.',action:'Guía y formulario propios de cada día; mapa13 ofrece modalidad antes de respuestas.',record:'connectionDay; answers. Dimensiones0–10, null/No aplica y ausencia separados; comparación1/28 solo cuatro dimensiones equivalentes.',close:'Finalizar abre registro; Guardar y finalizar o Finalizar actividad confirma la persistencia. Guardar y volver del mapa13 no es cierre total.',modality:'Individual/En pareja/No aplica según unidad; no inferir pareja de un campo escrito.'},
 sensate:{objective:'Atención a sensaciones y contacto con libertad para pausar; conservar técnica y requisitos originales.',action:'Seguir fases aprobadas y modalidad disponible. I1/I2 individuales; I3/I4/I5 enseñan contacto compartido voluntario; II ofrece individual/pareja.',record:'practiceId/phase; presencia/presión/disfrute/comodidad y notas propios; no homologar escalas ni inferir realización de audio.',close:'Guardar registro explícitamente; apertura/escucha/temporizador no prueban realización.',modality:'Según fase existente. No se crea una técnica individual nueva para I3–I5.'},
 recovery:{objective:'Elegir una respuesta para un escenario concreto de recuperación.',action:'Leer/escuchar cuatro intervenciones y abrir Practicar y guardar mi respuesta.',record:'Escenario propio y respuesta ensayada. No sustituir historia por otra de tema parecido.',close:'Guardar respuesta explícitamente; historia finalizada no equivale a práctica completada.',modality:'Reflexión individual de una situación recordada o ensayo; contacto compartido solo por acuerdo.'},
 ejaculation:{objective:'Reconocer excitación y practicar técnica aprobada sin garantizar tiempo/control.',action:'Stop–Squeeze, Start/Stop o combinada según asignación. Dosis y zonas conservadas; microvideo no reinterpretado.',record:'Paradas/ciclos reales y percepción de control; cronómetro opcional; molestias y campos propios de cada técnica.',close:'Guardar sesión tras indicar lo realizado. Guía reproducida o tiempo transcurrido no acredita práctica.',modality:'Práctica individual según fuente; no añadir técnica o contacto no presente.'},
 breathing:{objective:'Usar la guía existente de respiración y observar comodidad sin prometer un efecto por duración.',action:'Abrir variante asignada; patrón4/6 o4/2/6 y límites existentes conservados.',record:'Registro de sesión/tiempo real y comodidad. Voz de fin dice guía terminada, no práctica realizada.',close:'Ya realicé la práctica; Registrar, después Guardar registro. Final del audio no guarda por sí solo.',modality:'Individual.'},
 pelvic:{objective:'Distinguir conciencia/relajación semanal y fuerza condicionada a preparación clínica.',action:'Guía Percibe/Respira/Suelta o fuerza programada, según fuente; no mezclar ambas.',record:'pf-results/pf-checkins y registro semanal; tensión, liberación, molestias; respetar red flags y sesiones de fuerza separadas.',close:'Confirmación explícita y retorno al plan; el laboratorio no crea otro calendario.',modality:'Individual; posturas aprobadas con apoyo.'},
 wellness:{objective:'Consultar un hábito o preparación elegida, sin convertirlo en una deuda ni tratamiento de un síntoma sexual.',action:'Ficha/receta/pasos existentes; cantidades y cuidados conservados.',record:'Registro voluntario de acción cuando exista. Descargar Recetario no registra práctica.',close:'Volver a Hoy o cerrar recurso. Regalo de12 recetas mantiene descarga independiente.',modality:'Individual; compatible con preferencias e indicaciones personales según texto existente.'},
 checkpoint:{objective:'Observar respuestas disponibles, con evaluación voluntaria y escalas sin cambios.',action:'Responder0–4/No evaluable si se desea; acceder al informe aunque falten evaluaciones.',record:'Siete dimensiones de seguimiento, notas opcionales; no mezclar con baselineConfianza/CN/labs0–10.',close:'Guardar evaluación o volver sin completar. Informe con disponibilidad real; ninguna falta equivale a cero.',modality:'Individual; no provocar experiencia nueva para responder.'},
 resource:{objective:'Consultar información o reflexión a elección.',action:'Seguir la ficha fuente; no se añade obligación diaria.',record:'Propio de cada recurso; datos ausentes no se imputan como cero ni mejoría.',close:'Cerrar o guardar explícitamente según recurso.',modality:'Según recurso.'}
};
function packet(id,file,names,family,contentIds=[],select=x=>x,options={}){
 try{
  const get=old=>options.runtime?options.runtime(old):options.cjs?commonJS(file,old,options.ts):options.global?assignmentData(file,options.global,old):data(file,names,old);
  const before=select(get(true)),after=select(get(false)),b=textLeaves(before),a=textLeaves(after);
  const textIds=[];
  for(const[key,text]of Object.entries(a)){
   const tid=id+'::'+key;textIds.push(tid);
   unitTexts.push({id:tid,packet:id,file,key,language:'es',surface:/guide|guides|narration|script|audio|voices|cue|TEXT/i.test(key)?'guion_o_cue_fuente':/title|heading/i.test(key)?'titulo':/steps|prep|purpose|practice/i.test(key)?'instruccion_o_practica':'texto_fuente',assignment_scope_ref:'source_packets['+id+'].content_ids → content_units[].appearances',audio_inventory_ref:'../spm-voice-20261127-inventory.json; un literal no demuestra una intervención hablada',before:b[key]??null,after:text,status:b[key]===text?'reviewed_unchanged':'changed_reviewed',reason:b[key]===text?'Leído y conservado; mantiene técnica, dosis, escala y opciones de la fuente.':'Corrección editorial/funcional según anexo02; véase change-log y trazabilidad E01–E13.',source_kind:options.sourceKind||'data_or_script',...familyContext[family],remaining_verification:options.pending||'Inspección visual final de controles/arte y escucha física en dispositivo; no acreditadas por extracción de texto.'});
  }
  packets.push({id,file,names,source_sha256:sha(read(file)),family,scope:options.scope||'spanish_source_text_reviewed',text_ids:textIds,content_ids:contentIds,mirrors:options.mirrors||[],notes:options.notes||'',pending:options.pending||'Arte aprobado y ejecución real no se certifican con revisión del texto fuente.'});
  for(const cid of contentIds){const c=contents.get(cid);if(c&&!c.source_packets.includes(id))c.source_packets.push(id);}
 }catch(e){errors.push({packet:id,file,error:String(e.message)});}
}
const allIds=prefix=>[...contents.keys()].filter(k=>k.startsWith(prefix));
const pick=(obj,key)=>({[key]:obj[key]});
for(let n=1;n<=10;n++){
 const keys={1:['LABELS','TEXT','EXPLAIN','STEPS','OUTCOME_LABELS'],2:['CONTEXTS','RESPONSES','CONDITIONS','ASPECTS','PLANS','NARRATION','CONTEXT_CUES'],3:['AREAS','ANCHORS','STEPS','GUIDE'],4:['SENSES','RESULTS','GUIDES','STEPS','SENSE_AUDIO'],5:['GUIDES','FAC','INHIB','ADJUST'],6:['GUIDE','OPTIONS'],7:['GUIDES','ADVANCES','CONFIDENCE','ACTIONS','LABELS'],8:['GUIDES','FAVORABLE','UNFAVORABLE','STRATEGIES'],9:['GUIDES','STEPS','STRATEGIES'],10:['GUIDES','SIGNALS','STRATEGIES']}[n];
 packet('de'+n,'premium-v2/erection-day'+n+'-touch-v1.js',keys,'erection',['erection:lesson:'+n]);
}
packet('de-catalogue-fallback','premium-v2/erection-practice-v1.js',['scripts','definitions'],'erection',allIds('erection:'),x=>x,{notes:'Fallback DE01 actualizado y probado. El fallback1–5 usa número de sesión separado del día de calendario;6–10 rechazan el formulario genérico incompleto y abren sus controladores táctiles vigentes. No se inventaron campos clínicos para completar un fallback.'});
for(const day of [1,4,7,10,13,16,19,21,24,28]){
 const ids=['conexion-satisfaccion:content_day:'+day];
 packet('cn'+day+'-guide','premium-v2/conexion-satisfaccion/guiones.js',['window.SPM_CONNECTION_GUIDES'],'connection',ids,x=>({day,...x['window.SPM_CONNECTION_GUIDES'][day]}));
 packet('cn'+day+'-controls','premium-v2/conexion-satisfaccion/actividades.js',[],'connection',ids,x=>{const {guide,practice,...activity}=x.activities[day];return {day,activity,dimensions:[1,28].includes(day)?x.dimensions:undefined};},{runtime:old=>runtime(['premium-v2/conexion-satisfaccion/guiones.js','premium-v2/conexion-satisfaccion/actividades.js'],'SPM_CONNECTION_CONTENT',old),notes:'Export runtime de controles después de resolver funciones de campos y cues; las guías están en su paquete específico.'});
}
const confNew=[5,8,10,12,15,17,21,22,23,24,26];
for(const d of confNew)packet('confidence'+d,'premium-v2/confianza-nuevas/activities.js',['CONFIDENCE_ACTIVITIES'],'confidence',['confidence:content_day:'+d],x=>({day:d,...x.CONFIDENCE_ACTIVITIES[d]}));
packet('confidence1','premium-v2/confianza-nuevas/day1.js',['aspects','levels','habits'],'confidence',['confidence:content_day:1']);
for(const d of [4,7,9,13,14,18,20,25,27])packet('confidence-ep'+d,'premium-v2/ep-bloque/voice.js',['EP_DAY_VOICE'],'confidence',['confidence:content_day:'+d],x=>({day:d,guide:x.EP_DAY_VOICE[d]}));
packet('confidence-ep-controls','premium-v2/ep-bloque/voice.js',['EP_CHOICE_VOICE','EP_SCALES'],'confidence',allIds('confidence:'));
packet('confidence-pattern','premium-v2/ep-pattern.js',['groups'],'confidence',['confidence:content_day:2']);
packet('core-curriculum','premium-v2/modules.js',['window.SPM_MODULES'],'confidence',allIds('confidence:'),x=>x,{notes:'Currículo compartido de respaldo. La agenda resuelve a módulos específicos; no se asume que las28 fichas genéricas se muestran en cada ruta.'});
for(const[d,keys]of [[1,['FORM_AUDIO','FORM_STEPS','NARRATION','STIMULI']],[2,['FACILITATORS','PLANS','INFLUENCE','CONTEXT_FIELDS','GUIDE','INTRO']],[3,['CONNECTIONS','ACTIONS','GUIDE','PHASES']]])packet('desire'+d,'premium-v2/desire-day'+d+'-touch-v1.js',keys,'desire',['desire:content_day:'+d]);
for(let d=4;d<=7;d++)packet('desire'+d,'premium-v2/desire-week1-v1/index.html',['texts','ranks','regions','phases4'],'desire',['desire:content_day:'+d],x=>({guide:Object.fromEntries(Object.entries(x.texts).filter(([k])=>k.startsWith(d+'-'))),controls:d===4?x.phases4:d===6?x.regions:d===7?x.ranks:undefined}));
for(let d=8;d<=14;d++)packet('desire'+d,'premium-v2/desire-week2-v1/app.js',['NAMES','SPEECH','COVER_CHOICE_SPEECH','CHANNEL_SCRIPT'],'desire',['desire:content_day:'+d],x=>({title:x.NAMES[d],guide:x.SPEECH[d],choices:x.COVER_CHOICE_SPEECH[d],channel:d===9?x.CHANNEL_SCRIPT:undefined}));
for(let d=15;d<=21;d++){
 packet('desire'+d+'-screens','premium-v2/desire-week3-v1/screens.js',[],'desire',['desire:content_day:'+d],x=>x.filter(s=>s.day===d),{global:'SPM_WEEK3_SCREENS',mirrors:['premium-v2/desire-week3-v1/screens.json']});
 packet('desire'+d+'-voice','premium-v2/desire-week3-v1/narration.js',[],'desire',['desire:content_day:'+d],x=>Object.fromEntries(Object.entries(x).filter(([k])=>k.startsWith('d'+d+'_'))),{cjs:true});
}
for(let d=22;d<=28;d++)packet('desire'+d+'-screens','premium-v2/desire-week4-v1/screens.js',[],'desire',['desire:content_day:'+d],x=>x.filter(s=>s.day===d),{global:'SPM_WEEK4_SCREENS',mirrors:['premium-v2/desire-week4-v1/screens.json']});
packet('desire-library','premium-v2/desire-week4-v1/catalog.js',[],'desire',allIds('desire:'),x=>x,{global:'SPM_WEEK4_CATALOG',mirrors:['premium-v2/desire-week4-v1/catalog.json','labs/desire/src/lib/desire-curriculum.ts']});
packet('desire-curriculum','labs/desire/src/lib/desire-curriculum.ts',[],'desire',allIds('desire:'),x=>({curriculum:x.curriculum,extraPractices:x.extraPractices}),{cjs:true,ts:true,notes:'Se ejecuta módulo de datos TypeScript completo en memoria: incluye los parches de métrica local, campos y salidas; no solo inicializador AST.'});
packet('desire-resource-labels','labs/desire/src/lib/desire-data.ts',['screens','stimuliOpts','zoneOpts','healthOpts','barrierOpts','accelOpts','brakeOpts','partnerOpts','actionOpts','metricLabels','library'],'desire',allIds('desire:'),x=>x,{scope:'spanish_source_labels_reviewed',pending:'Las variantes dinámicas del laboratorio requieren recorrido real; extraer las etiquetas no prueba los estados de los formularios.'});
for(const component of ['DesireCycle','DesireLab']){
 const file='labs/desire/src/components/desire/'+component+'.tsx';
 packet('desire-'+component.toLowerCase()+'-prose',file,[],'desire',allIds('desire:'),x=>x,{runtime:old=>Object.fromEntries(parseSource(file,read(file,old)).filter(i=>!/(?:dz-|st-\$\{|String\(Math|@\/|\.\.\/)/.test(i.text)).filter(i=>i.kind!=='dynamic_template'||/[A-Za-zÀ-ÿ]{3}/.test(i.text.replace(/\$\{[^}]*\}/g,''))).map(i=>[i.key,i.text])),scope:'spanish_literal_and_jsx_prose_reviewed',notes:'Leídos textos fuente de pantallas y recursos de DesireCycle y DesireLab, incluidos guiones formSteps, modos individual/pareja, estados de guardado, métricas y cierre. Las interpolaciones se mantienen como plantilla fuente; no se inventan datos de usuario.',pending:'Recorrido de cada estado dinámico, comprobación visual en móvil y persistencia de cuenta real.'});
}
const sensateNames=['PHASES','LABELS','FOCUSI_INTROS','FOCUSI_PREP_S5','FOCUSI_PREP_S4','FOCUSI_PREP_S3','FOCUSI_PREP_LESSON','FOCUSI_HOMEWORK','FOCUSI_PREP','FOCUSI_CLOSE','FOCUSI_TITLES','INTRO','PREP','PREP_FOCUSII','FOCUSII_WELCOME','FOCUSII_WELCOME_DESIRE','CLOSING','CLOSING_FOCUSII','SPM_S1_CLINICAL_AUDIO','SPM_S2_VALUES','SPM_S2_TASKS','SPM_S3_CONCEPTS','SPM_S3_PREPARATION','SPM_S3_TASKS','SPM_S4_CONCEPTS','SPM_S4_PREPARATION','SPM_S4_TASKS','SPM_S5_CONCEPTS','SPM_S5_PREPARATION','SPM_S5_TASKS','SPM_F2_CONCEPTS'];
packet('sensate-approved','premium-v2/sensate-premium-v1.js',sensateNames,'sensate',allIds('sensate:'),x=>x,{pending:'Secuencia II día19 antes de I4/I5 días23/26 requiere decisión clínica. Textos/tiempos/fases conservados; no se infiere equivalencia con Sensate del labDeseo. Arte y escucha física pendientes.'});
for(const[variant,days]of [['squeeze',[1,3,5,22]],['startstop',[8,10,12,24]],['combined',[15,17,19,26]]])packet('ejaculation-'+variant,'premium-v2/ejaculatory-'+variant+'-v'+(variant==='startstop'?2:1)+'.js',['VOICES'],'ejaculation',days.map(d=>'ejaculation:scheduled_occurrence:'+d),x=>x,{notes:'Repetición intencional de una técnica, con nueva sesión y registro; no se elimina como duplicado.'});
for(const scenario of ['condom','before','during','early','urge','partner','next'])packet('recovery-'+scenario,'premium-v2/recovery-story-'+(['condom','before','during'].includes(scenario)?'premium-v4':'extra-v1')+'.js',['STORIES'],'recovery',['recovery:'+scenario],x=>({scenario,...x.STORIES[scenario]}));
packet('resource-content','premium-v2/spm-resources-content.js',['window.SPM_RESOURCE_CONTENT'],'resource',[...allIds('recovery:'),'confidence:content_day:6'],x=>x,{notes:'Comidas6, movimiento6, recuperación7, escalas y evidencia opcional. Pareses/en: inventario principal soloes; no se declara revisión integral de traducción.'});
const wellnessFiles=['premium-v2/nutrition-daily-cards-v1.js','premium-v2/sleep-library-v1.js','premium-v2/wellness-daily-tip-v1.js'];
for(const cat of ['nutrition','movement','sleep'])packet('wellness-'+cat,cat==='nutrition'?wellnessFiles[0]:cat==='sleep'?wellnessFiles[1]:wellnessFiles[2],[],'wellness',allIds(cat==='nutrition'?'wellness:nut.':cat==='sleep'?'wellness:slp.':'wellness:mov.'),x=>x,{runtime:old=>cat==='nutrition'?runtime(wellnessFiles,'SPM_NUTRITION_DAILY',old).cards:cat==='sleep'?runtime(wellnessFiles,'SPM_SLEEP_LIBRARY_V1',old).tips:runtime(wellnessFiles,'SPM_WELLNESS_DAILY_TIP_V1',old).TIPS.movement,notes:'Export runtime después de aplicar sustituciones a tarjetas y pasos; no se confunden array inicial y objeto efectivo.'});
packet('breathing-data','labs/breathing/src/lib/breath-data.ts',['screens','trainerLines','library','weekTask','weeks'],'breathing',allIds('breathing:'));
packet('breathing-final-demo','labs/breathing/src/lib/final-demo-scenes.ts',[],'breathing',allIds('breathing:'),x=>x,{runtime:old=>old?{script:data('labs/breathing/src/components/breath/DemoVideo.tsx',['FINAL_TRANSCRIPT'],true).FINAL_TRANSCRIPT}:{script:commonJS('labs/breathing/src/lib/final-demo-scenes.ts',false,true).FINAL_TRANSCRIPT},notes:'La transcripción publicada FINAL_TRANSCRIPT se conserva íntegra, dividida en seis frases en final-demo-scenes.ts. Voz estándar acompaña imágenes del original. Los cuatro videos de agenda carecen de transcripción completa localizada; este guion no se usa como sustituto de ellos.',pending:'Cotejo acústico original y prueba audible real del nuevo flujo de seis escenas.'});
for(const manifestFile of ['daily-instructions','practical-guidance','lenny'])packet('breathing-'+manifestFile,'labs/breathing/src/assets/audio/'+manifestFile+'-manifest.json',[],'breathing',allIds('breathing:'),x=>x,{runtime:old=>JSON.parse(read('labs/breathing/src/assets/audio/'+manifestFile+'-manifest.json',old)).entries.filter(x=>!/^screen\./.test(x.id)).map(({id,text})=>({id,text:!old&&id==='cue.done'?'Terminó la guía. Respira con naturalidad y registra solo lo que realizaste.':text})),notes:manifestFile==='lenny'?'Guiones históricos de cues con override efectivo de cue.done en breath-audio.ts: «Terminó la guía. Respira con naturalidad y registra solo lo que realizaste.»; el manifiesto histórico permanece intacto.':'Manifiesto histórico aporta el guion; audio actual usa voz estándar.'});
packet('pelvic-daily','labs/pelvic-floor/src/lib/pf-data.ts',['SCREENS','DAILY_PHASES','RED_FLAGS','ALARM_SIGNS','REEVAL_REASONS','PRACTICES','REC_LABEL','ROUTES','STAGES','OVERLOAD_SIGNS','LIBRARY'],'pelvic',allIds('pelvic-daily-lab:'),x=>x,{notes:'Guiones16 revisados. Catálogo de fuerza/dosis de fuente conservado; no se presupone que se renderiza en el laboratorio diario.'});
packet('pelvic-weekly','labs/pelvic-floor/public/pelvic-weekly-flow-v1.js',['titleByWeek','PHASES','NARRATIONS'],'pelvic',allIds('pelvic-daily-lab:'),x=>x,{mirrors:['premium-v2/pelvic-floor-lab/pelvic-weekly-flow-v1.js']});
packet('pelvic-guidance','premium-v2/pelvic-guidance-v1.js',['daily','strength','first'],'pelvic',[...allIds('pelvic-daily-lab:'),...allIds('pelvic-strength:')]);
packet('checkpoints','premium-v2/program-checkpoint-v1.js',['metrics','scaleLabels','narrations','message14','message28','closingTitle','closingParagraphs'],'checkpoint',allIds('program-checkpoint:'));
packet('checkpoints-touch','premium-v2/spm-checkpoint-touch-v1.js',['METRICS','GUIDES'],'checkpoint',['program-checkpoint:milestone:14','program-checkpoint:milestone:28']);
// Entry and continuity are real surfaces outside the 6×28 assignment matrix.
const onboardingFiles=[
 ['health-intake','premium-v2/health-intake-v2.js','Preguntas de salud y explicación condicional'],
 ['assessment-ui','premium-v2/assessment-app-v3.js','Motivos, evaluación y resultado inicial'],
 ['free-assessment-page','premium-v2/free-assessment.html','Estructura de entrada y orientación gratuita'],
 ['live-page','premium-v2/live.html','Acceso, mapa, jornada, registro voluntario e informe del programa'],
 ['insights','premium-v2/evaluation-refresh-v1.js','Cuatro intermedios de evaluación y controles de voz'],
 ['welcome','premium-v2/program-welcome-v1.js','Bienvenida al programa y seguimientos voluntarios'],
 ['guest-entry','premium-v2/guest-entry-v1.js','Borrador, privacidad, resultado, cuenta y estado de compra'],
 ['commercial-journey','premium-v2/commercial-journey-v1.js','Presentación del programa y narración conservada'],
 ['commercial-conversion','premium-v2/commercial-conversion-v1.js','Resultados de perfil y presentación comercial conservada'],
 ['commercial-offer','premium-v2/commercial-offer-v2.js','Controles de consulta de la presentación comercial'],
 ['commercial-profile','premium-v2/commercial-profile-visual-v1.js','Interacciones visuales del perfil'],
 ['commercial-price','premium-v2/commercial-price-v1.js','Precio y condiciones históricas conservadas'],
 ['program-entry','premium-v2/program-entry-v1.js','Redirección de acceso, sin texto propio'],
 ['language','premium-v2/spm-language-core-v1.js','Selección de idioma, sin texto propio'],
 ['payment-return','premium-v2/payment-return.js','Confirmación, pausa y recuperación de pago existente'],
 ['payment-return-page','premium-v2/payment-return.html','Página de retorno de pago'],
 ['program-paused','premium-v2/program-paused.html','Aviso público de pausa y conservación de compra/avance'],
 ['index','premium-v2/index.html','Entrada a la versión actual'],
 ['insight-recording-provenance','premium-v2/assets/spm-insight-audio-v1.js','Referencias de grabaciones históricas, no fuente de voz activa']
];
for(const[name,file,title]of onboardingFiles){
 const id='entry-'+name,cid='entry:'+name;
 packet(id,file,[],'onboarding',[cid],x=>x,{runtime:old=>uiText(file,read(file,old)),scope:'spanish_visible_and_spoken_source_reviewed',notes:'Entrada fuente verificada desde live.html/free-assessment.html. vercel.routes mantiene pausa en rutas públicas; no se habilitan pagos. La rama autenticada antigua de assessment-app-v3 no es el controlador actual de live.html. Elementos de arte y textos ingleses se separan de esta revisión española.',pending:name==='insights'?'Los cuatro PNG aprobados tienen textos de otro tema: ver insights-es-visual-review.json; no se declara resuelta la incongruencia por corregir voz/HTML.':'Verificación visual y audible real, y flujo de cuenta de prueba según superficie.'});
 supplementalUnits.push({content_id:cid,title,scope:'entry_or_orientation',routes:'Todas; antes de asignación o al recuperar acceso',days:[],source_packets:[id],...familyContext.onboarding});
}
packet('entry-effective-questions','premium-v2/engine.js',[],'onboarding',['entry:effective-questions'],x=>x,{runtime:old=>runtime(['premium-v2/engine.js','premium-v2/health-intake-v2.js'],'ENGINE',old).assessment,notes:'Export efectivo después de insertar HEALTH y retirar preguntas reemplazadas. Preguntas, opciones, IDs, pesos y escalas se conservaron; prompt_en/labels inglesas excluidos del corpus español.',pending:'e_loss presupone experiencia de penetración y no incluye No aplica en escala1–5; requiere decisión de política de evaluación sin imputar0 ni cambiar pesos por edición.'});
supplementalUnits.push({content_id:'entry:effective-questions',title:'Cuestionario efectivo tras aplicar preguntas de salud',scope:'assessment',routes:'Todas, según motivos y show_if',days:[],source_packets:['entry-effective-questions'],...familyContext.onboarding});
const labUiFiles=[['pelvic-ui','labs/pelvic-floor/src/components/PelvicLab.tsx','pelvic',allIds('pelvic-daily-lab:')],['breathing-ui','labs/breathing/src/components/BreathingLab.tsx','breathing',allIds('breathing:')],...['AnatomyGuide','BreathPacer','BreathPatternGuide','DailyBreathingJourney','DemoVideo','FinalDeviceDemo','PracticeBlock'].map(n=>['breathing-'+n,'labs/breathing/src/components/breath/'+n+'.tsx','breathing',allIds('breathing:')])];
for(const[id,file,family,ids]of labUiFiles)packet(id,file,[],family,ids,x=>x,{runtime:old=>uiText(file,read(file,old)),notes:'Prosa JSX y controles leídos, junto a guiones de datos ya inventariados. Las plantillas conservan marcadores de valores de usuario; no se cuentan estilos o rutas como contenido.',pending:'Inspección visual real por variante; escucha física y persistencia autenticada. No se modificaron técnica, dosis ni escalas.'});
const continuityPath=path.join(out,'continuity-review.json');
if(fs.existsSync(continuityPath)){
 const review=JSON.parse(fs.readFileSync(continuityPath,'utf8'));
 for(const p of review.packets||[])packet(p.id,p.file,[],'continuity',[],x=>x,{runtime:old=>old?p.before:p.after,scope:'spanish_active_continuity_source_reviewed',notes:p.reason||'Revisión de continuidad documentada por archivo/clave en continuity-review.json; exclusiones y estados de fuente explícitos.',pending:'QA visual real de microcápsulas y flujo autenticado; ver continuity-review.md.'});
 for(const unit of review.supplemental_units||[])supplementalUnits.push({...unit,content_id:unit.content_id||unit.id,source_packets:unit.source_packets||[unit.packet],...familyContext.continuity});
}
for(const c of contents.values()){
 c.review_status=c.kind==='video'?'pending_video_script_and_timeline':c.source_packets.length?'spanish_source_packets_reviewed; visual_and_runtime_scope_separate':'pending_source_link';
 c.content_id=c.contentId;
 c.family_context=familyContext[c.kind]||familyContext[c.family==='evaluation'?'checkpoint':c.kind==='connection'?'connection':'resource'];
 if(c.kind==='video')c.pending='Inventario de voz documenta fuente y disponibilidad. Guion/transcripción alineada y escucha de video siguen pendientes si no existe fuente; no se sintetiza contenido clínico nuevo.';
 delete c.appearances?.source_packets;
}
const summary={baseline:base,agenda_version:manifest.version,routes:Object.keys(manifest.routes).length,calendar_cells:Object.values(manifest.routes).reduce((n,d)=>n+Object.keys(d).length,0),assignment_occurrences:assignments.length,unique_content_ids:contents.size,linked_content_ids:[...contents.values()].filter(c=>c.source_packets.length).length,unlinked_content_ids:[...contents.values()].filter(c=>!c.source_packets.length).map(c=>({id:c.contentId,title:c.title,status:c.review_status})),supplemental_content_units:supplementalUnits.length,source_packets:packets.length,spanish_text_units:unitTexts.length,changed:unitTexts.filter(x=>x.status==='changed_reviewed').length,reviewed_unchanged:unitTexts.filter(x=>x.status==='reviewed_unchanged').length,extract_errors:errors};
fs.mkdirSync(out,{recursive:true});
fs.writeFileSync(path.join(out,'active-corpus.json'),JSON.stringify({summary,scope:'Principal inventory: runtime agenda identities + read Spanish data/scripts/JSX + entry/continuity outside the matrix. One shared source unit can appear on multiple routes/days. No declaration that every bitmap, video, visual runtime state or English translation was fully verified.',source_packets:packets,content_units:[...contents.values()],supplemental_units:supplementalUnits,assignments,text_units:unitTexts},null,2)+'\n');
fs.writeFileSync(path.join(out,'active-corpus-summary.json'),JSON.stringify(summary,null,2)+'\n');
const lines=['# Matriz de contenido efectivo · 27/11/2026','','La matriz procede del export de agenda. El texto completo antes/después y el objetivo/acción/registro/cierre están en `active-corpus.json`. Cada paquete es una fuente única, reutilizada por sus asignaciones. Estado «fuente revisada» no certifica arte, video, traducción inglesa ni ejecución real.','','| Identidad | Título | Apariciones | Paquetes de texto | Estado |','|---|---|---:|---|---|'];
for(const c of contents.values())lines.push(`| ${c.contentId} | ${c.title.replace(/\|/g,'/')} | ${c.appearances.length} | ${c.source_packets.join(', ')} | ${c.review_status} |`);
lines.push('','## Entrada, continuidad y recursos fuera de la matriz','','| Identidad | Título | Fuente |','|---|---|---|');
for(const c of supplementalUnits)lines.push(`| ${c.content_id} | ${String(c.title||c.content_id).replace(/\|/g,'/')} | ${c.source_packets.join(', ')} |`);
fs.writeFileSync(path.join(out,'active-corpus-matrix.md'),lines.join('\n')+'\n');
console.log(JSON.stringify(summary,null,2));
