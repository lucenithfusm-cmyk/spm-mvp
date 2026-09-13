/* Synthetic, browser-local backend for tests only. Never included in staging. */
(()=>{
 const user={id:'00000000-0000-4000-8000-000000000001',email:'synthetic@example.invalid'};
 const tables=JSON.parse(localStorage.getItem('spm-test-db')||'{}');
 const persist=()=>localStorage.setItem('spm-test-db',JSON.stringify(tables));
 class Query{
  constructor(table){this.table=table;this.filters=[];this.mode='read';this.singleRow=false;this.cap=Infinity;}
  select(cols,opts){this.opts=opts;return this;}eq(k,v){this.filters.push(r=>r[k]===v);return this;}neq(k,v){this.filters.push(r=>r[k]!==v);return this;}
  like(k,v){this.filters.push(r=>String(r[k]||'').startsWith(v.replace(/%$/,'')));return this;}
  order(){return this;}limit(n){this.cap=n;return this;}maybeSingle(){this.singleRow=true;return this;}single(){this.singleRow=true;return this;}
  insert(data){this.mode='insert';this.payload=data;return this;}upsert(data){this.mode='insert';this.payload=data;return this;}update(data){this.mode='update';this.payload=data;return this;}
  then(resolve,reject){return Promise.resolve().then(()=>{
   const table=tables[this.table]??=[];let data;
   if(this.mode==='insert'){data=[].concat(this.payload).map(r=>({id:crypto.randomUUID(),created_at:new Date().toISOString(),...r}));table.push(...data);persist();}
   else {data=table.filter(r=>this.filters.every(f=>f(r)));if(this.mode==='update'){data.forEach(r=>Object.assign(r,this.payload));persist();}}
   return {data:this.opts?.head?null:this.singleRow?(data[0]||null):data.slice(0,this.cap),count:data.length,error:null};
  }).then(resolve,reject);}
 }
 const client={from:t=>new Query(t),auth:{getSession:async()=>({data:{session:{user}},error:null}),getUser:async()=>({data:{user},error:null}),onAuthStateChange:()=>({data:{subscription:{unsubscribe(){}}}}),signOut:async()=>({error:null})}};
 window.supabase={createClient:()=>client};
})();
