/* SPM Finance Core — COP amounts are integer pesos. No tax determination. */
(function(root,factory){
 const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;
 else root.SPM_FINANCE_CORE=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 const VALID=new Set(['approved','partially_refunded','refunded']);
 const fmt=new Intl.NumberFormat('es-CO',{style:'currency',currency:'COP',maximumFractionDigits:0});
 const n=x=>{const z=Number(x);return Number.isSafeInteger(z)&&z>=0?z:0};
 function colombiaYear(x){
  if(!x)return null;const t=new Date(x);if(!Number.isFinite(t.getTime()))return null;
  return Number(new Intl.DateTimeFormat('en-US',{timeZone:'America/Bogota',year:'numeric'}).format(t));
 }
 function movementYear(x){return x?Number(String(x).slice(0,4)):null;}
 function summarize(sales=[],movements=[],settings={},year=new Date().getFullYear()){
  const orders=sales.filter(s=>VALID.has(s.payment_status)&&colombiaYear(s.purchased_at||s.created_at)===Number(year));
  const gross=orders.reduce((v,s)=>v+n(s.amount_gross_cop),0);
  const refunds=orders.reduce((v,s)=>v+n(s.refund_cop),0);
  const processorFees=orders.reduce((v,s)=>v+n(s.fee_cop),0);
  const withholdings=orders.reduce((v,s)=>v+n(s.withholding_cop),0);
  const moves=movements.filter(m=>movementYear(m.movement_date)===Number(year));
  const sums={};
  for(const m of moves){sums[m.category]=(sums[m.category]||0)+n(m.amount_cop);}
  const entries=k=>sums[k]||0;
  const payouts=entries('wompi_payout');
  const contributions=entries('owner_contribution');
  const expenses=entries('business_expense');
  const bankFees=entries('bank_fee');
  const withdrawals=entries('owner_draw');
  const bankRefunds=entries('refund_from_bank');
  const bankCash=payouts+contributions+entries('correction_credit')-expenses-bankFees-withdrawals-bankRefunds-entries('correction_debit');
  // This is an allocation plan from available cash, NOT a booked cost.
  const refundReserve=Math.max(0,Math.floor(Math.max(0,bankCash)*Math.min(100,Math.max(0,Number(settings.reserve_refund_pct)||0))/100));
  const growthReserve=Math.max(0,Math.floor(Math.max(0,bankCash)*Math.min(100,Math.max(0,Number(settings.reserve_growth_pct)||0))/100));
  return {year:Number(year),count:orders.length,gross,refunds,netSales:gross-refunds,
   processorFees,withholdings,payouts,contributions,expenses,bankFees,withdrawals,bankRefunds,
   bankCash,refundReserve,growthReserve,availableAfterReserves:bankCash-refundReserve-growthReserve,
   payoutNotReconciled:gross-refunds-processorFees-withholdings-payouts,
   withdrawalTarget:n(settings.withdrawal_target_cop)};
 }
 function csv(rows){
  const headers=['Fecha','Tipo','Referencia','Monto COP','Descripción'];
  const safe=v=>{let s=String(v??'').replace(/[\r\n]/g,' ');if(/^[=+\-@\t]/.test(s.trimStart()))s="'"+s;return '"'+s.replace(/"/g,'""')+'"'};
  return '\uFEFF'+[headers,...rows.map(r=>[r.date,r.type,r.ref,r.amount,r.description])].map(row=>row.map(safe).join(';')).join('\r\n');
 }
 return {summarize,fmt:(value)=>fmt.format(Number(value)||0),colombiaYear,csv};
});
