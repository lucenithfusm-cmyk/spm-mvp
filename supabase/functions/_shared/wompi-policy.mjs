export const AMOUNT=14900000;
export const CURRENCY='COP';
export const ENVIRONMENTS=new Set(['test','prod']);
export const TERMINAL=new Set(['APPROVED','DECLINED','VOIDED','ERROR']);
export async function sha256(value){return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value)))).map(n=>n.toString(16).padStart(2,'0')).join('');}
function equalHex(a,b){if(!/^[a-f0-9]{64}$/i.test(a||'')||!/^[a-f0-9]{64}$/i.test(b||''))return false;let difference=0;for(let i=0;i<64;i++)difference|=a.toLowerCase().charCodeAt(i)^b.toLowerCase().charCodeAt(i);return difference===0;}
export async function verifyEvent(event,environment,secret){
 if(!secret||!ENVIRONMENTS.has(environment)||event?.environment!==environment||event?.event!=='transaction.updated'||!Number.isSafeInteger(event.timestamp))return false;
 const properties=event.signature?.properties;if(!Array.isArray(properties)||!properties.length||properties.length>30)return false;
 let values='';
 for(const path of properties){
  if(typeof path!=='string'||!/^transaction\.[a-z0-9_.]+$/i.test(path))return false;
  let value=event.data;
  for(const key of path.split('.')){if(['__proto__','constructor','prototype'].includes(key)||!value||!Object.hasOwn(value,key))return false;value=value[key];}
  if(!['string','number','boolean'].includes(typeof value))return false;values+=String(value);
 }
 return equalHex(await sha256(values+event.timestamp+secret),event.signature.checksum);
}
export function validTransaction(order,transaction,environment){
 return ENVIRONMENTS.has(environment)&&order.environment===environment&&order.reference===transaction?.reference&&transaction.currency===CURRENCY&&transaction.amount_in_cents===AMOUNT&&order.amount_in_cents===AMOUNT&&order.currency===CURRENCY&&typeof transaction.id==='string'&&/^[a-zA-Z0-9-]{5,100}$/.test(transaction.id)&&(TERMINAL.has(transaction.status)||transaction.status==='PENDING');
}
export async function checkoutURL(order,publicKey,integritySecret,redirectURL){
 if(!publicKey?.startsWith(`pub_${order.environment}_`)||!integritySecret||!ENVIRONMENTS.has(order.environment))throw Error('Payment configuration unavailable');
 const url=new URL('https://checkout.wompi.co/p/');
 const signature=await sha256(order.reference+AMOUNT+CURRENCY+order.expires_at+integritySecret);
 for(const [key,value] of Object.entries({'public-key':publicKey,'currency':CURRENCY,'amount-in-cents':String(AMOUNT),'reference':order.reference,'signature:integrity':signature,'expiration-time':order.expires_at,'redirect-url':redirectURL}))url.searchParams.set(key,value);
 return url.toString();
}
