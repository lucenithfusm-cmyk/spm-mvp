const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const fin=require('../public-web/admin/ledger-core.js');

function sale(id,amount,status='approved',extras={}){
 return {provider_payment_id:id,amount_gross_cop:amount,payment_status:status,created_at:'2026-10-08T12:00:00Z',
 purchased_at:'2026-10-08T12:00:00Z',refund_cop:0,fee_cop:0,withholding_cop:0,...extras};
}
function move(category,amount,date='2026-10-08'){
 return {category,amount_cop:amount,movement_date:date};
}
test('SPM sales: 149000 COP sale, refund, fee and pending do not inflate revenue',()=>{
 const x=fin.summarize([
  sale('a',149000,'approved',{fee_cop:4700}),
  sale('b',149000,'refunded',{refund_cop:149000,fee_cop:4700}),
  sale('c',149000,'pending'),sale('d',149000,'declined')
 ],[],{},2026);
 assert.equal(x.count,2);
 assert.equal(x.gross,298000);
 assert.equal(x.refunds,149000);
 assert.equal(x.netSales,149000);
 assert.equal(x.processorFees,9400);
});
test('cash reconciliation separates provider deposits, operational expenses, personal draws and contributions',()=>{
 const x=fin.summarize([sale('a',149000,'approved',{fee_cop:5000})],[
  move('wompi_payout',144000),move('business_expense',20000),
  move('owner_draw',30000),move('owner_contribution',10000),
  move('bank_fee',1000)
 ],{reserve_refund_pct:10,reserve_growth_pct:20,withdrawal_target_cop:50000},2026);
 assert.equal(x.gross,149000);
 assert.equal(x.bankCash,103000);
 assert.equal(x.withdrawals,30000);
 assert.equal(x.expenses,20000);
 assert.equal(x.refundReserve,10300);
 assert.equal(x.growthReserve,20600);
 assert.equal(x.availableAfterReserves,72100);
 assert.equal(x.payoutNotReconciled,0);
});
test('Colombian year boundary uses Bogota date, not UTC',()=>{
 assert.equal(fin.colombiaYear('2026-01-01T02:00:00Z'),2025);
 assert.equal(fin.colombiaYear('2026-01-01T05:00:00Z'),2026);
 const x=fin.summarize([sale('a',2000,'approved',{purchased_at:'2026-01-01T02:00:00Z'})],[],{},2026);
 assert.equal(x.gross,0);
});
test('bank transfers and reserves never alter gross sales',()=>{
 const x=fin.summarize([],[move('owner_contribution',200000),move('wompi_payout',100000)],{reserve_refund_pct:10,reserve_growth_pct:25},2026);
 assert.equal(x.gross,0);
 assert.equal(x.bankCash,300000);
 assert.equal(x.availableAfterReserves,195000);
});
test('CSV protects formula injection and preserves Spanish characters',()=>{
 const c=fin.csv([{date:'2026-10-08',type:'retiro',ref:'=HYPERLINK("x")',amount:500,description:'+uno; ñ'}]);
 assert.match(c,/"'=HYPERLINK/);
 assert.match(c,/"'\+uno; ñ"/);
 assert.ok(c.startsWith('\uFEFF'));
});
test('migration forbids client-side finance-sale inserts and disallows self-registration of finance admins',()=>{
 const sql=fs.readFileSync(path.join(__dirname,'../internal-finance/sql/001_finance_ledger_v1.sql'),'utf8');
 assert.match(sql,/REVOKE ALL ON public\.spm_finance_admins FROM anon, authenticated;/);
 assert.match(sql,/GRANT SELECT ON public\.spm_finance_sales TO authenticated;/);
 assert.doesNotMatch(sql,/GRANT [^;]*INSERT[^;]*spm_finance_sales/);
 assert.match(sql,/spm_is_finance_admin\(\)/);
 assert.match(sql,/CHECK\(reserve_refund_pct \+ reserve_growth_pct <= 100\)/);
});

test('private finance is outside the public SPM navigation and has independent authorization',()=>{
 const web=fs.readFileSync(path.join(__dirname,'../public-web/index.html'),'utf8');
 const admin=fs.readFileSync(path.join(__dirname,'../public-web/admin/index.html'),'utf8');
 assert.doesNotMatch(web,/href\s*=\s*["'][^"']*\/admin\//i);
 assert.doesNotMatch(web,/spm_finance_sales|spm_finance_movements/);
 assert.match(admin,/noindex,nofollow,noarchive/);
 assert.match(admin,/spm_is_finance_admin/);
 assert.match(admin,/signInWithPassword/);
 assert.match(admin,/id="dashboard" data-hide/);
});
