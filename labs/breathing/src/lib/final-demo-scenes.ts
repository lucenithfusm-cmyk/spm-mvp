// Published FINAL_TRANSCRIPT, split without rewriting the approved words.
// Frames are extracted from the original approved video; they illustrate each
// sentence. The scene waits for the person's next action, never a breath timer.
export const FINAL_DEMO_SCENES = [
 {at: 2, text: 'La respiración diafragmática es una técnica fundamental para reducir la tensión, regular la activación corporal y mejorar la conciencia y el control de tu cuerpo.'},
 {at: 12, text: 'Pon una mano en el pecho y otra en el abdomen.'},
 {at: 18, text: 'Inhala lentamente.'},
 {at: 24, text: 'Exhala lentamente.'},
 {at: 30, text: 'Nunca fuerces el aire.'},
 {at: 32, text: 'Respira normal.'},
].map((scene, index) => ({...scene, image: `./media/device-demo/scene-${index + 1}.jpg`}));
export const FINAL_TRANSCRIPT = FINAL_DEMO_SCENES.map(scene => scene.text).join(' ');
