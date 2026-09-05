(()=>{
'use strict';
if(window.SPM_SUPABASE_AUTH_SAFE)return;
window.SPM_SUPABASE_AUTH_SAFE=true;
const install=()=>{
  if(!window.supabase||typeof window.supabase.createClient!=='function')return false;
  if(window.supabase.createClient.__spmSafe)return true;
  const original=window.supabase.createClient.bind(window.supabase);
  const safeCreateClient=(...args)=>{
    const client=original(...args);
    const originalOnAuth=client.auth.onAuthStateChange.bind(client.auth);
    client.auth.onAuthStateChange=(callback)=>originalOnAuth((event,session)=>{
      // Do not run async Supabase/database work inside the auth callback.
      // Defer it to the next task to avoid locking the client.
      setTimeout(()=>{
        try{
          const result=callback(event,session);
          if(result&&typeof result.catch==='function')result.catch(err=>console.error('SPM auth callback',err));
        }catch(err){console.error('SPM auth callback',err)}
      },0);
    });
    return client;
  };
  safeCreateClient.__spmSafe=true;
  window.supabase.createClient=safeCreateClient;
  return true;
};
if(!install())window.addEventListener('load',install,{once:true});
})();