export const RECIPE_SHA256='1e732d27a659e7af9232fb7140634d120023875d13c79bb1ad5cfabb78e5fdb3';
export const SUBJECT='Tu detalle de bienvenida a SPM';
export const MESSAGE='Qué bueno que ya formas parte de SPM.\n\nComo uno de nuestros primeros 50 compradores, recibes de obsequio el Recetario SPM con 12 preparaciones prácticas. Lo encontrarás adjunto a este correo.\n\nElige una opción que disfrutes y adáptala a tus necesidades y restricciones alimentarias. Un paso cada día, a tu ritmo.\n\nEquipo SPM Digital Wellness';
export function canRetry(firstAttempt,now=Date.now()){
 return !firstAttempt||now-Date.parse(firstAttempt)<23*60*60*1000;
}
export function payload(gift,content){
 if(!gift.id||!gift.sender||!gift.recipient||!content)throw Error('Incomplete gift');
 return {from:gift.sender,to:[gift.recipient],subject:SUBJECT,text:MESSAGE,attachments:[{filename:'Recetario_SPM.pdf',content}]};
}
export async function sendGift(gift,content,key,fetcher=fetch){
 if(!canRetry(gift.first_attempt_at))return {state:'review',reason:'idempotency_window_expired'};
 try{
  const response=await fetcher('https://api.resend.com/emails',{method:'POST',headers:{Authorization:'Bearer '+key,'Content-Type':'application/json','Idempotency-Key':'spm-launch-recipe-v1/'+gift.id},body:JSON.stringify(payload(gift,content)),signal:AbortSignal.timeout(12000)});
  if(!response.ok)return {state:response.status===429||response.status>=500?'pending':'review',reason:'provider_'+response.status};
  const result=await response.json();
  return typeof result.id==='string'?{state:'accepted',providerId:result.id}:{state:'pending',reason:'missing_provider_id'};
 }catch{return {state:'pending',reason:'provider_uncertain'};}
}
