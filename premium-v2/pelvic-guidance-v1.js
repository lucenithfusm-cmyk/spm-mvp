(()=>{'use strict';
// Recorded Lenny guidance shared by the daily cards; viewing never records a practice.
const daily={
  "script": "Hoy vamos a reconocer, relajar y coordinar el piso pélvico. Abre la práctica guiada y elige una postura cómoda, con la espalda y los pies apoyados, o recostado con las rodillas dobladas. Primero, mira la zona señalada en la imagen. Después, afloja la mandíbula, el abdomen y los glúteos. Respira con comodidad, sin retener el aire ni empujar hacia abajo. Sigue la guía para observar el movimiento de tu respiración y permitir que la zona pélvica se suelte, sin apretarla. No necesitas sentir un movimiento grande ni lograr una respuesta sexual. Cuando hayas practicado, registra lo que notaste, aunque te haya costado percibir la zona. Si aparece dolor o aumenta la tensión, detente y regístralo. Puedes realizar esta práctica cuando esté programada, a tu ritmo.",
  "audioSrc": "/premium-v2/assets/audio/pelvic/pelvic-lab-daily-20261113.mp3"
};
const strength={
  "script": "Esta es tu sesión de contracción y fuerza del piso pélvico, disponible cuando corresponde a tu pauta. Abre el entrenamiento y sigue las repeticiones y los descansos que aparecen en pantalla. El gesto es cerrar y elevar suavemente hacia dentro, como si quisieras evitar la salida de un gas. Respira con normalidad, sin apretar los glúteos ni empujar con el abdomen. Después de cada contracción, suelta por completo antes de continuar. No practiques interrumpiendo el chorro de orina. Si aparece dolor, aumenta la tensión o no consigues relajar, detén la sesión y registra lo ocurrido. Este entrenamiento tiene dos sesiones por semana en tu recorrido. El Pelvic Floor Lab semanal te acompaña por separado con conciencia, relajación y coordinación. En cada paso encontrarás una bocina. Presiónala cuando quieras escuchar la explicación de la actividad y sus recomendaciones.",
  "audioSrc": "https://resource2.heygen.ai/text_to_speech/f27f0d2de72d470e919ed331523331ef/84854979e66846989bc6c5855f53268f/id=049c3b0342624a02ad96e5e7ba9d1f46.mp3"
};
// Lenny: propósito + instrucciones completas; reproducir dentro de Respira y suelta, nunca en Hoy.
const first={
  "script": "Vamos a hacer esta primera práctica de «Respira y suelta» para reconocer y liberar tensión en el cuerpo, y ayudarte a respirar con mayor calma. Siéntate con la espalda apoyada y los pies en el suelo, o recuéstate en una posición cómoda. Primero, observa las tres zonas de la pantalla: mandíbula, hombros y abdomen. Afloja cada una con suavidad, sin forzar. Después, pulsa «Continuar» para abrir la guía de respiración. Pulsa «Iniciar» y deja entrar y salir el aire con comodidad, sin retenerlo. Usa el movimiento de la guía como apoyo; respira a tu propio ritmo. Si te distraes, vuelve a notar el apoyo de tu cuerpo y el paso del aire. No necesitas comprobar una erección ni sentir un cambio inmediato. Cuando hayas practicado, registra cómo te sentiste. Si aparece mareo o incomodidad, detente y vuelve a respirar con naturalidad.",
  "audioSrc": "https://resource2.heygen.ai/text_to_speech/f27f0d2de72d470e919ed331523331ef/050c403a43e047c796f8a6257ed2533e/id=5fd474d6009e426ab17b4512e72cce25.mp3"
};
window.SPM_PELVIC_GUIDANCE={definition:intent=>({...((intent==='scheduled')?strength:daily)}),firstPractice:()=>({...first})};
})();
