const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.join(__dirname,'..'),context={window:{}};vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(root,'premium-v2/engine.js'),'utf8'),context);
const health=fs.readFileSync(path.join(root,'premium-v2/health-intake-v2.js'),'utf8');
vm.runInContext(health.slice(0,health.indexOf('const byPrompt='))+'})();',context);
const file=path.join(root,'supabase/functions/_shared/question-catalog.json');
const output=JSON.stringify(context.window.ENGINE.assessment.questions,null,2)+'\n';
if(process.argv.includes('--check')){if(fs.readFileSync(file,'utf8')!==output)throw Error('Assessment catalog is stale');}
else fs.writeFileSync(file,output);
