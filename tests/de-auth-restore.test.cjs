const fs=require('fs'),assert=require('assert'),path=require('path');const root=path.join(__dirname,'..','premium-v2'),app=fs.readFileSync(path.join(root,'app-live.js'),'utf8'),live=fs.readFileSync(path.join(root,'live.html'),'utf8');
assert(!app.includes(".eq('status','active')"),'restore must not require active status');
assert(app.includes("function rankPlans(plans)"),'plan ranking missing');
assert(app.includes("document.documentElement.dataset.spmRestoreState='loading'"),'restore loading state missing');
assert(app.includes("window.SPM_RESTORED_CONTEXT"),'shared restored context missing');
assert(live.includes('id="appBoot"'),'restore gate markup missing');
assert(!live.includes('restore-rescue-v1.js'),'competing restore-rescue must not load');
assert.doesNotThrow(()=>new Function(app),'app-live.js parses');
console.log('DE auth restore static QA OK');