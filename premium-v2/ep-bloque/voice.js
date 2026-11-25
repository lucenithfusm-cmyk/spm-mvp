// Fragmentos de la ruta EP y del seguimiento intermedio, adaptados a los controles visibles.
const EP_DAY_VOICE={
 4:'Durante cinco minutos, lleva la atención a la respiración, al contacto o a una sensación. Toca una de las tres imágenes para escuchar cómo hacerlo. Cuando estés cómodo, pulsa Iniciar práctica.',
 7:'Piensa en una situación concreta de esta semana. Elige la frase que mejor describe tu experiencia y después valora el cambio que percibiste.',
 9:'Reconocer cómo sube tu excitación te ayuda a identificar tu propio ritmo. Primero marca tu excitación del cero al diez. Después toca la imagen que corresponde a tu firmeza.',
 13:'La confianza mejora cuando se apoya en experiencias concretas. Recuerda una respuesta corporal, una habilidad aprendida o una situación que manejaste mejor. Marca los avances que reconoces.',
 14:'Revisión intermedia del control eyaculatorio. Recuerda cómo te fue esta última semana. Registra el tiempo aproximado solo si hubo una experiencia naturalmente evaluable. Después indica cómo te has sentido en general.',
 18:'Piensa en cómo te gustaría hablar con tu pareja sobre el ritmo, las pausas y lo que te resulta agradable. Elige una frase para escuchar un ejemplo que puedas decir con tus propias palabras.',
 20:'Diseña un plan breve para una experiencia que surja de forma natural. Elige una prioridad que dependa de ti y después indica qué tan preparado te sientes para ponerla en práctica.',
 25:'Un día difícil no borra lo que has aprendido. Reconoce qué situaciones suelen dificultarte el control. Después elige la estrategia que te haya servido en una ocasión concreta.',
 27:'En este ensayo tú eliges cómo combinar ritmo, pausa y atención. Marca tu objetivo y después indica qué tan preparado te sientes hoy.'
};
const EP_CHOICE_VOICE={
 focus:['Siéntate cómodo y afloja los hombros. Deja entrar y salir el aire sin forzarlo. Nota un movimiento del pecho o del abdomen. Si te distraes, vuelve a la siguiente respiración.',
 'Apoya una mano sobre tu antebrazo. Percibe la temperatura de la piel y la presión de tu mano. Quédate unos instantes con esa sensación.',
 'Elige una sensación que notes ahora, como calor, suavidad o el peso del cuerpo sobre el asiento. Si empiezas a evaluar cómo lo haces, vuelve a esa sensación.'],
 EHS:['EHS uno. El pene aumenta de tamaño y se mantiene blando.','EHS dos. Hay cierta rigidez, pero es insuficiente para la penetración.','EHS tres. La erección permite la penetración, aunque todavía no alcanza la firmeza completa.','EHS cuatro. La erección es completamente firme y rígida.'],
 semana:['Recuerda un momento en el que notaste el cambio, aunque fuera pequeño.','Piensa en la señal que reconociste antes que otras veces.','Recuerda qué te ayudó a bajar la presión en ese momento.','Elige mentalmente una habilidad que quieras repetir la próxima semana.'],
 avances:['Recuerda una ocasión en la que pudiste elegir cuándo bajar el ritmo.','Piensa en una situación en la que sentiste menos presión.','Recuerda qué sensación pudiste disfrutar con más calma.','Piensa en un momento en el que pudiste comunicarte con tu pareja.'],
 comunicacion:['Puedes decir: me ayuda que empecemos despacio. ¿Qué te gusta a ti?','Puedes decir: quiero bajar un poco el ritmo. Me gusta estar así contigo.','Pueden acordar una señal para hacer una pausa o cambiar el ritmo.'],
 prioridad:['Elige un momento con privacidad y tiempo suficiente.','Cuando notes que evalúas el resultado, vuelve al contacto que estás sintiendo.','Antes del encuentro, comparte algo concreto que te ayuda a sentir comodidad.','Escoge una técnica que ya conozcas y recuerda cuándo te ha servido.'],
 situaciones:['Recuerda qué señal te permite reconocer el cansancio o la tensión.','Observa cómo te sientes en los días en que descansas menos.','Piensa en cómo ha sido tu experiencia después de consumir alcohol.','Identifica la primera frase de presión que suele aparecer en tu mente.'],
 estrategia:['Recuerda una respiración que te haya ayudado a recuperar la calma.','Recuerda la práctica de piso pélvico que ya has aprendido y cuándo te resultó útil.','Elige una sensación agradable a la que puedas volver si aparece presión.'],
 objetivo:['Durante el ensayo observa cuándo te conviene mantener el ritmo o hacer una pausa.','Elige una sensación agradable o un momento de conexión al que quieras prestar atención.','Recuerda una situación que manejaste bien y la habilidad que usaste.']
};
const EP_SCALES={
 progreso:['Sin cambio','Leve avance','Avance moderado','Avance claro','Muy buen avance'],
 confianza:['Muy baja','Baja','Moderada','Alta','Muy alta'],
 experiencia:['Sin cambios','Cambio leve','Cambio moderado','Buen avance','Avance muy claro'],
 comodidad:['Nada cómodo','Poco cómodo','Algo cómodo','Cómodo','Muy cómodo'],
 preparacion:['Nada preparado','Poco preparado','Moderadamente preparado','Preparado','Muy preparado']
};
function epChoiceSpeech(key,value,index){
 if(EP_CHOICE_VOICE[key])return EP_CHOICE_VOICE[key][index];
 if(EP_SCALES[key])return EP_SCALES[key][index]+'. '+({progreso:'Compara cómo te sentías al comenzar la semana con cómo te sientes hoy.',confianza:'Piensa en la experiencia concreta que respalda tu respuesta.',experiencia:'Ten en cuenta el control, la tranquilidad y la satisfacción que has percibido.',comodidad:'Puedes empezar con una frase corta y elegir un momento tranquilo.',preparacion:'Puedes ajustar el plan a cómo te sientes hoy.'})[key];
 if(key==='IELT')return ['Menos de un minuto.','Entre uno y dos minutos.','Entre dos y cinco minutos.','Más de cinco minutos.'][index]+' Es una estimación de tiempo. Tu experiencia global se registra por separado.';
 if(key==='excitacion')return 'Nivel '+value+' de diez. '+(value===0?'Observa cómo se siente tu cuerpo en reposo.':value<4?'Observa las primeras señales de excitación.':value<8?'Presta atención a cómo cambia la intensidad y a qué ritmo te resulta cómodo.':'La excitación es alta. Reconoce si necesitas bajar el ritmo o hacer una pausa.');
}
