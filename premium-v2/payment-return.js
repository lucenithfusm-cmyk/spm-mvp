(()=>{
'use strict';
const db=window.supabase.createClient('https://jogirmziqjlsttbbarcx.supabase.co','sb_publishable_jXmxa5K6ThK9C8DPIxmVVQ_mbuLWVaf');
const params=new URLSearchParams(location.search),order=params.get('order'),transaction=params.get('id');
const $=s=>document.querySelector(s);let busy=false;
function show(title,message){$('h1').textContent=title;$('#paymentMessage').textContent=message;$('#paymentActions').replaceChildren();}
function link(label,href){const a=document.createElement('a');a.className='button';a.textContent=label;a.href=href;$('#paymentActions').append(a);}
function retry(){const b=document.createElement('button');b.textContent='Volver a comprobar el pago';b.onclick=check;$('#paymentActions').append(b);}
function login(){
 show('Continúa con tu cuenta SPM.','Inicia sesión con el correo que utilizaste antes del pago. Así recuperaremos la confirmación y tu evaluación. No necesitas pagar otra vez.');
 const form=document.createElement('form');form.innerHTML='<label for="returnEmail">Correo electrónico</label><input id="returnEmail" type="email" autocomplete="email" required><label for="returnPassword">Contraseña</label><input id="returnPassword" type="password" autocomplete="current-password" required><button type="submit">Entrar y comprobar mi pago</button><p role="status"></p>';
 form.onsubmit=async e=>{e.preventDefault();const b=form.querySelector('button');b.disabled=true;try{const {error}=await db.auth.signInWithPassword({email:$('#returnEmail').value.trim(),password:$('#returnPassword').value});$('#returnPassword').value='';if(error)throw error;await check();}catch{form.querySelector('[role=status]').textContent='No pudimos ingresar. Revisa tus datos o recupera tu contraseña.';}finally{b.disabled=false;}};
 $('#paymentActions').append(form);const forgot=document.createElement('button');forgot.className='secondary';forgot.textContent='Recuperar mi contraseña';forgot.onclick=async()=>{const email=$('#returnEmail').value.trim();if(!email){form.querySelector('[role=status]').textContent='Escribe primero tu correo electrónico.';return;}forgot.disabled=true;const {error}=await db.auth.resetPasswordForEmail(email,{redirectTo:new URL('live.html',location.href).href});form.querySelector('[role=status]').textContent=error?'No se pudo enviar. Inténtalo de nuevo.':'Revisa tu correo para recuperar tu cuenta. Tu pago se conserva.';forgot.disabled=false;};$('#paymentActions').append(forgot);
}
async function check(){
 if(busy)return;busy=true;$('#paymentActions').querySelectorAll('button').forEach(b=>b.disabled=true);
 try{
  if(!order||!/^[0-9a-f-]{36}$/i.test(order)){show('Recupera tu acceso.','Este enlace no incluye una compra válida. Entra con tu cuenta para consultar tu programa.');link('Entrar a mi cuenta','live.html');return;}
  const {data}=await db.auth.getSession();if(!data.session){login();return;}
  const result=await window.SPM_PAYMENTS.status(db,order,transaction);
  $('#paymentReference').textContent='Referencia: '+result.reference;
  if(result.status==='APPROVED'&&result.environment==='prod'&&result.planId){window.SPM_PROGRAM_ENTRY?.remember();show('Tu programa está listo.','Confirmamos tu pago de $149.000 COP. Te damos la bienvenida: conoce tu Performance Map, tus áreas de trabajo y el primer día de tu ruta.');link('Ver mi bienvenida y evaluación','live.html?welcome=1');}
  else if(result.status==='APPROVED'&&result.environment==='test'){show('Pago de prueba aprobado.','La transacción se registró en el entorno de pruebas. No se cobró dinero real ni se activó un programa comercial.');link('Volver a la evaluación','free-assessment.html');}
  else if(['DECLINED','ERROR','VOIDED','EXPIRED'].includes(result.status)){show(result.status==='VOIDED'?'El pago fue anulado.':'El pago no quedó aprobado.','Tu evaluación se conserva. Puedes volver al cierre comercial y revisar el estado antes de iniciar un nuevo intento.');link('Volver a mi evaluación guardada','free-assessment.html');retry();}
  else{show('El pago sigue pendiente.','Aún no recibimos una aprobación. No pagues de nuevo: puedes cerrar esta pantalla y volver a comprobar el estado desde este mismo enlace.');retry();}
 }catch(error){if(error.message==='sign_in_required'){login();return;}show('Vamos a recuperar la confirmación.','No pudimos consultar el pago en este momento. Conserva este enlace y la referencia de Wompi. Reintenta sin realizar otro pago.');retry();link('Entrar a mi cuenta','live.html');}
 finally{busy=false;$('#paymentActions').querySelectorAll('button').forEach(b=>b.disabled=false);}
}
check();
})();
