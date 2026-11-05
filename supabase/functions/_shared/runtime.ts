import { createClient } from 'npm:@supabase/supabase-js@2';
export const env=(name:string)=>Deno.env.get(name)||'';
export const admin=()=>createClient(env('SUPABASE_URL'),env('SUPABASE_SERVICE_ROLE_KEY'),{auth:{persistSession:false,autoRefreshToken:false}});
export function cors(req:Request){
 const origin=req.headers.get('origin')||'';
 const allowed=env('SPM_ALLOWED_ORIGINS').split(',').map(x=>x.trim()).filter(Boolean);
 return origin&&allowed.includes(origin)?{'Access-Control-Allow-Origin':origin,'Access-Control-Allow-Headers':'authorization, x-client-info, apikey, content-type','Access-Control-Allow-Methods':'GET, POST, OPTIONS','Vary':'Origin'}:null;
}
export const json=(value:unknown,status=200,headers:Record<string,string>={})=>new Response(JSON.stringify(value),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store',...headers}});
export async function userFor(req:Request,db:ReturnType<typeof admin>){
 const header=req.headers.get('authorization')||'';
 if(!header.startsWith('Bearer '))return null;
 const {data,error}=await db.auth.getUser(header.slice(7));return error?null:data.user;
}
export async function bodyFor(req:Request){
 if(Number(req.headers.get('content-length'))>64000)throw Error('Body too large');
 const body=await req.text();if(body.length>64000)throw Error('Body too large');return JSON.parse(body);
}
export const uuid=(v:unknown)=>typeof v==='string'&&/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);
