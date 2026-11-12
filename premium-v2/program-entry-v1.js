(()=>{
'use strict';
// This flag only remembers where to enter. It never grants program access.
const KEY='spm_program_return_v1';
const remembered=()=>{try{return localStorage.getItem(KEY)==='1'}catch{return false}};
function remember(){try{localStorage.setItem(KEY,'1')}catch{}}
function forget(){try{localStorage.removeItem(KEY)}catch{}}
async function destination(db){
 const hint=remembered();let signedIn=false;
 try{
  const {data,error}=await db.auth.getSession();
  if(!data?.session?.user)return hint?'live.html':null;
  if(error)return 'live.html';
  signedIn=true;const userId=data.session.user.id;
  // RLS verifies ownership and active entitlement; do not read patient answers here.
  const result=await db.from('spm_program_access').select('plan_id').eq('user_id',userId).eq('status','active').abortSignal(AbortSignal.timeout(6000)).limit(1);
  if(result.error)return 'live.html';
  if(result.data?.length){remember();return 'live.html'}
  forget();return null;
 }catch{return hint||signedIn?'live.html':null}
}
window.SPM_PROGRAM_ENTRY={remember,destination,async redirect(db){const next=await destination(db);if(!next)return false;location.replace(next);return true}};
})();
