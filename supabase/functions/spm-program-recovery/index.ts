import {admin,cors,json,userFor,bodyFor,uuid} from '../_shared/runtime.ts';
import '../_shared/assessment-policy.js';
import questions from '../_shared/question-catalog.json' with {type:'json'};
const policy=(globalThis as any).SPM_ASSESSMENT_POLICY;
Deno.serve(async(req:Request)=>{
 const headers=cors(req);if(!headers)return json({error:'origin_not_allowed'},403);
 if(req.method==='OPTIONS')return new Response(null,{status:204,headers});
 if(req.method!=='POST')return json({error:'method_not_allowed'},405,headers);
 try{
  const db=admin(),user=await userFor(req,db);if(!user)return json({error:'sign_in_required'},401,headers);
  const body=await bodyFor(req);if(!uuid(body.planId))return json({error:'invalid_plan'},400,headers);
  const {data:plan,error:planError}=await db.from('plans').select('*').eq('id',body.planId).eq('user_id',user.id).single();
  if(planError||!plan)return json({error:'plan_not_found'},404,headers);
  const [a,m]=await Promise.all([
   db.from('assessments').select('*').eq('id',plan.assessment_id).eq('user_id',user.id).single(),
   db.from('performance_maps').select('*').eq('id',plan.performance_map_id).eq('user_id',user.id).eq('assessment_id',plan.assessment_id).single()
  ]);
  if(a.error||m.error)return json({error:'restore_support_required'},409,headers);
  let answers;
  try{answers=policy.fillMissing(questions,a.data.motives,a.data.answers,body.answers);}catch{return json({error:'answers_changed_or_invalid'},409,headers);}
  const missing=policy.missing(questions,a.data.motives,answers);
  if(missing.length)return json({error:'answers_incomplete',missing:missing.map((q:any)=>q.id)},422,headers);
  const computed=policy.score(questions,a.data.motives,answers),map={...computed,...policy.preserveSafety(computed,m.data)};
  const {error}=await db.rpc('spm_complete_missing_answers',{p_user_id:user.id,p_plan_id:plan.id,p_expected_answers:a.data.answers,p_answers:answers,p_map:map});
  if(error)return json({error:'save_conflict',retryable:true},409,headers);
  return json({saved:true,day:plan.current_day,safetyLevel:map.safety_level},200,headers);
 }catch{return json({error:'temporarily_unavailable',retryable:true},503,headers);}
});
