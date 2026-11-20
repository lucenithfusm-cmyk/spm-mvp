/* SPM Deseo · Semana 3 · narración breve por pantalla y control.
 * Conserva las instrucciones clínicas del paquete y del currículo existente.
 * Las elecciones nunca añaden la guía general. La voz sigue siendo del dispositivo.
 */
(function(root,factory){
 'use strict';
 const narration=factory();
 if(typeof module==='object'&&module.exports)module.exports=narration;
 if(root)root.SPM_DESIRE_WEEK3_NARRATION=narration;
})(typeof window!=='undefined'?window:null,function(){
 'use strict';
 const ladder={
  'ladder-0':'Puedes elegir un abrazo o simplemente estar juntos.',
  'ladder-1':'Elige una caricia agradable y acuerda el contacto si lo compartes.',
  'ladder-2':'Amplía sólo si hoy hay comodidad e interés mutuo; puedes volver a una opción más sencilla.',
  'ladder-3':'Una experiencia más amplia sigue siendo una elección: requiere comodidad y acuerdo, y puedes cambiar de idea.'
 };
 return {
  d15_01:{
   'audio-guide':'Hoy puedes elegir qué tipo de cercanía te apetece. Si quieres, registra la presión que sientes antes de empezar. No hay un peldaño al que debas llegar.'
  },
  d15_02:{
   'audio-guide':'Marca la opción que te resulte cómoda e imagina cómo sería en la práctica. Si participas con tu pareja, acuerden lo que ambos quieren.',
   ...ladder
  },
  d15_03:{
   'audio-guide':'Puedes quedarte en tu elección o volver a una más sencilla. Ampliar requiere comodidad e interés mutuo en ese momento. El cronómetro es opcional.'
  },
  d15_04:{
   'audio-guide':'Si quieres, registra la presión al terminar y anota qué elegiste y cómo te sentiste. Marca Realicé la actividad sólo si la realizaste; después guarda tu experiencia.'
  },
  d15_02a:{
   'audio-guide':'Según tu registro actual, algunos peldaños están en pausa. Puedes elegir Cercanía o Contacto sensual, de acuerdo con lo que hoy te resulte cómodo.',
   'ladder-0':ladder['ladder-0'],
   'ladder-1':ladder['ladder-1']
  },
  d15_02b:{
   'audio-guide':'Por ahora está disponible Cercanía. Puedes compartir un abrazo o estar juntos, si ambos quieren. Los demás peldaños continúan en pausa según la indicación de tu programa.',
   'ladder-0':ladder['ladder-0']
  },
  d16_01:{
   'audio-guide':'Esta práctica explora el contacto no genital. Elige la modalidad individual o en pareja y, si quieres, registra tu disfrute antes de empezar. Puedes ajustar el contacto o parar.',
   'triad-0-0':'Reconoce la calidez o frescura de la piel durante el contacto.',
   'triad-0-1':'Presta atención a cómo se siente la piel bajo los dedos.',
   'triad-0-2':'Nota si el contacto es más suave o más firme. Ajusta la intensidad según tu comodidad.',
   'variant-solo':'Explora por ti mismo las zonas que alcances con comodidad, manteniendo el contacto fuera de los genitales.',
   'variant-partner':'Acuerden turnos: una persona toca y la otra recibe. Cambien cuando ambos quieran y expresen si prefieren ajustar el contacto o parar.'
  },
  d16_02:{
   'audio-guide':'Toca una zona para escuchar su indicación. Ajusta el contacto según tus sensaciones y mantén la exploración fuera de los genitales. Puedes cambiar de zona o parar.',
   'sensate1_phases-sensate1_phases_1':'Comienza con contacto suave en las manos y los brazos. Nota la temperatura y la textura; ajusta la presión a tu comodidad.',
   'sensate1_phases-sensate1_phases_2':'Lleva la atención a los hombros y al cuello. Explora sólo donde alcances cómodamente y expresa si prefieres ajustar el contacto.',
   'sensate1_phases-sensate1_phases_3':'Explora la espalda sólo en las zonas que alcances con comodidad. Si estás con tu pareja, acuerden dónde y cómo tocar.',
   'sensate1_phases-sensate1_phases_4':'Deja las manos en reposo y observa cómo te sientes, respirando con naturalidad.'
  },
  d16_03:{
   'audio-guide':'Si quieres, valora tu disfrute al terminar y anota qué contacto fue agradable o qué adaptarías.'
  },
  d16_04:{
   'audio-guide':'Puedes valorar tu comodidad con un número. Por separado, responde Sí, No o N/A a La fase I me resultó cómoda. Confirma la actividad sólo si la realizaste.'
  },
  d17_01:{
   'audio-guide':'Elige un contacto que te resulte agradable, como una caricia en manos, brazos o espalda. Si lo compartes, acuerden primero qué contacto quieren.'
  },
  d17_02:{
   'audio-guide':'Prueba una variación pequeña y observa qué cambia en la sensación. Los botones te permiten escuchar una propuesta; tú decides cómo explorarla.',
   'rhythm_cues-slower':'Prueba una caricia más lenta y nota cómo se siente.',
   'rhythm_cues-pause':'Haz una pausa en el contacto para observar tus sensaciones.',
   'rhythm_cues-vary':'Cambia un detalle pequeño del ritmo, sólo si te resulta cómodo.'
  },
  d17_03:{
   'audio-guide':'Puedes mantener lo que te gusta o volver a un contacto más sencillo. Amplía sólo si hay interés y comodidad; si aparece presión, reduce el ritmo.',
   'rhythm_actions-maintain':'Quédate en el ritmo que te resulta agradable.',
   'rhythm_actions-simple':'Vuelve a una caricia conocida y cómoda.',
   'rhythm_actions-pause':'Puedes descansar y retomar cuando quieras.'
  },
  d17_04:{
   'audio-guide':'Recuerda qué ritmo y qué pausas te resultaron agradables. Puedes valorar tu disfrute y anotarlo en Tu reflexión. Confirma la actividad sólo si la realizaste.'
  },
  d18_01:{
   'audio-guide':'Elige un momento tranquilo, fuera de una situación íntima. Decide si quieres conversar con tu pareja o preparar tus ideas por escrito.',
   'communication_route-solo':'Puedes escribir para ti lo que te gusta, lo que prefieres evitar y lo que quisieras comunicar.',
   'communication_route-partner':'Comparte tus preferencias y escucha las de tu pareja; sólo acuerden algo que ambos quieran.'
  },
  d18_02:{
   'audio-guide':'Completa dos frases: a mí me gusta y hoy prefiero evitar. Usa un ejemplo concreto, como un tipo de caricia, un ritmo o una forma de hablar.'
  },
  d18_03:{
   'audio-guide':'Pregunta qué prefiere la otra persona y escucha su respuesta. Anota lo que quieran recordar. Pueden acordar algo que ambos deseen o quedarse sólo en la conversación; cualquiera puede pedir parar.'
  },
  d18_04:{
   'audio-guide':'Observa cómo te sentiste al expresar o escribir lo que quieres. Puedes valorar tu cercanía actual y anotar algo que quieras recordar. Confirma la actividad sólo si la realizaste.'
  },
  d18_03a:{
   'audio-guide':'Escribe para ti qué te ayuda, qué prefieres evitar y qué te gustaría comunicar. Puedes completar esta experiencia a solas, sin compartir el texto.'
  },
  d19_01:{
   'audio-guide':'Esta fase parte de una fase I registrada como cómoda. Confirma si hoy quieres ampliar o elige repetir la fase I.'
  },
  d19_02:{
   'audio-guide':'Elige la modalidad y, si quieres, registra tu disfrute antes de empezar. Si lo haces en pareja, acuerden el contacto y cualquier cambio.',
   'variant-solo':'Puedes explorar por ti mismo y volver al contacto conocido cuando lo prefieras.',
   'variant-partner':'Acuerden qué zona quieren explorar antes de ampliar. Cualquiera puede pedir volver al contacto anterior o parar.'
  },
  d19_03:{
   'audio-guide':'Elige un paso para escuchar la guía. Puedes pausar, volver al contacto conocido o terminar. La práctica se centra en sensaciones, sin buscar una erección ni un orgasmo.',
   'sensate2_phases-sensate2_phases_1':'Empieza con el contacto no genital que ya conoces y observa cómo se siente hoy.',
   'sensate2_phases-sensate2_phases_2':'Si te apetece, añade poco a poco una zona que quieras explorar. Nota la temperatura, la textura y la presión. En pareja, acuerden cada cambio.',
   'sensate2_phases-sensate2_phases_3':'Haz una pausa y nota cómo estás. Puedes regresar a la zona anterior o mantener una opción más sencilla.',
   'sensate2_phases-sensate2_phases_4':'Termina cuando prefieras y recuerda qué contacto resultó cómodo o qué te gustaría adaptar.'
  },
  d19_04:{
   'audio-guide':'Puedes registrar el disfrute y la comodidad de esta experiencia y una observación para recordar. Confirma la actividad sólo si la realizaste.'
  },
  d19_00a:{
   'audio-guide':'Puedes continuar con la fase I para explorar qué contacto te resulta cómodo.'
  },
  d20_01:{
   'audio-guide':'Hoy puedes preparar un contexto con detalles que te hayan ayudado a conectar. Si quieres, registra tu deseo antes de empezar.'
  },
  d20_02:{
   'audio-guide':'Elige dos o tres detalles para esta experiencia. Si quieres revisar tus preferencias, abre Mis condiciones y rutina previa.',
   'context_details-time':'Reserva un momento en el que puedas ir a tu ritmo.',
   'context_details-privacy':'Elige un espacio donde puedas estar a gusto y evitar interrupciones.',
   'context_details-rest':'Ten en cuenta cómo te sientes de descanso antes de preparar la experiencia.',
   'context_details-ambience':'Ajusta la luz y la temperatura a tu gusto.',
   'context_details-screens':'Aparta las pantallas y las notificaciones que puedan distraerte.',
   'context_details-worries':'Busca un momento en el que puedas dejar a un lado las preocupaciones pendientes.'
  },
  d20_03:{
   'audio-guide':'Cada botón acompaña una parte de la experiencia. Sigue tu ritmo; el cronómetro es opcional y puedes detenerte cuando quieras.',
   'steps-0-0':'Prepara los detalles que elegiste: el lugar, el tiempo y el ambiente.',
   'steps-0-1':'Elige una experiencia sencilla que te apetezca. Si la compartes, acuerden la propuesta.',
   'steps-0-2':'Nota qué ayuda, qué distrae y qué cambiarías. Puedes ajustar un detalle durante la experiencia.'
  },
  d20_04:{
   'audio-guide':'Describe brevemente tu contexto favorable. Si quieres, valora tu deseo al terminar y anota qué te ayudó o qué cambiarías. Confirma la actividad sólo si la realizaste.'
  },
  d21_01:{
   'audio-guide':'Hoy revisarás lo vivido para elegir tu siguiente paso. Puedes consultar tus sesiones o partir del recuerdo de una experiencia de esta semana.',
   'triad-0-0':'Revisa lo que anotaste sobre tus experiencias.',
   'triad-0-1':'Identifica algo que te resultó agradable y algo que quieras adaptar.',
   'triad-0-2':'Escoge una práctica o un detalle que te gustaría mantener.'
  },
  d21_02:{
   'audio-guide':'Toca un día para consultar las sesiones que hayas registrado. Observa qué práctica realizaste y cómo te sentiste; después vuelve a tu reflexión.'
  },
  d21_03:{
   'audio-guide':'Escribe algo que te sirvió y algo que quieras adaptar. Si te ayuda, consulta Tu lista de excitación o Detalles por canal; son recursos opcionales.'
  },
  d21_04:{
   'audio-guide':'Elige una práctica o un detalle que quieras llevar a la semana cuatro. Puedes valorar tu interés de hoy y guardar tu reflexión. Confirma la actividad sólo si la realizaste.'
  },
  d21_02a:{
   'audio-guide':'Aún no hay sesiones registradas. Puedes continuar con el recuerdo de una experiencia de esta semana.'
  }
 };
});
