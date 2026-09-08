(()=>{
'use strict';
if(window.SPM_SIGNUP_HOTFIX_V1)return;
window.SPM_SIGNUP_HOTFIX_V1=true;

const SB_URL='https://jogirmziqjlsttbbarcx.supabase.co';
const SB_KEY='sb_publishable_jXmxa5K6ThK9C8DPIxmVVQ_mbuLWVaf';

function install(){
  const signupBtn=document.getElementById('signupBtn');
  const emailEl=document.getElementById('email');
  const passwordEl=document.getElementById('password');
  const status=document.getElementById('authStatus');
  if(!signupBtn||!emailEl||!passwordEl||!window.supabase?.createClient)return false;

  const db=window.supabase.createClient(SB_URL,SB_KEY);
  const show=(text,kind='good')=>{
    if(!status)return;
    status.className='notice '+kind;
    status.textContent=text;
    status.hidden=false;
  };

  signupBtn.type='button';
  signupBtn.onclick=async(ev)=>{
    ev?.preventDefault?.();
    ev?.stopPropagation?.();
    const email=emailEl.value.trim();
    const password=passwordEl.value;
    if(!email||password.length<6){
      show('Ingresa un correo válido y una contraseña de al menos 6 caracteres.','warn');
      return;
    }

    const original=signupBtn.textContent;
    signupBtn.disabled=true;
    signupBtn.textContent='Creando cuenta…';
    show('Estamos creando tu nueva cuenta de SPM…','good');

    try{
      const {data,error}=await db.auth.signUp({
        email,
        password,
        options:{emailRedirectTo:window.location.href}
      });
      if(error){
        show('No pudimos crear la cuenta: '+error.message,'danger');
        return;
      }
      if(data?.session){
        show('Cuenta creada correctamente. Preparando tu evaluación inicial…','good');
        setTimeout(()=>window.location.reload(),350);
        return;
      }
      show('Cuenta creada. Revisa tu correo para confirmar el registro y luego vuelve a SPM para ingresar.','good');
    }catch(err){
      console.error('SPM signup hotfix',err);
      show('No pudimos completar el registro. Verifica tu conexión e inténtalo nuevamente.','danger');
    }finally{
      signupBtn.disabled=false;
      signupBtn.textContent=original;
    }
  };
  return true;
}

if(document.readyState==='loading'){
  document.addEventListener('DOMContentLoaded',()=>setTimeout(install,0),{once:true});
}else{
  setTimeout(install,0);
}
})();