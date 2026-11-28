/* Read-only extraction of named data expressions; never fetches assets or executes UI controllers. */
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const ts=require('../labs/desire/node_modules/typescript');
const root=path.resolve(__dirname,'..');
function extract(file,names,source){
 source=source??fs.readFileSync(path.join(root,file),'utf8');
 if(file.endsWith('.html'))source=[...source.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)].map(x=>x[1]).join('\n');
 const ast=ts.createSourceFile(file,source,ts.ScriptTarget.Latest,true,file.endsWith('.tsx')?ts.ScriptKind.TSX:ts.ScriptKind.TS);
 const declarations=[],assignments=[];
 function walk(n){
  if(ts.isVariableDeclaration(n)&&n.initializer&&ts.isIdentifier(n.name))declarations.push([n.name.text,n.initializer]);
  if(ts.isBinaryExpression(n)&&n.operatorToken.kind===ts.SyntaxKind.EqualsToken&&/^window\./.test(n.left.getText(ast)))assignments.push([n.left.getText(ast),n.right]);
  ts.forEachChild(n,walk);
 }
 walk(ast);
 const sandbox={window:{},p:(es,en)=>({es,en}),t:(es)=>es,console:{log(){},warn(){}}};
 const context=vm.createContext(sandbox),values={},errors={};
 // Only evaluate requested expressions and literal/function dependencies. UI expressions
 // that require DOM, storage, timers or network have no capabilities in this context.
 for(const [name,node]of [...declarations,...assignments]){
  if(!names.includes(name)&&!ts.isStringLiteralLike(node)&&!ts.isNumericLiteral(node)&&!ts.isObjectLiteralExpression(node)&&!ts.isArrayLiteralExpression(node)&&!ts.isArrowFunction(node)&&!ts.isFunctionExpression(node))continue;
  try{
   const compiled=ts.transpileModule('globalThis.__packet = ('+node.getText(ast)+');',{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}}).outputText;
   vm.runInContext(compiled,context,{timeout:150});
   const value=sandbox.__packet;
   if(name.startsWith('window.'))sandbox.window[name.slice(7)]=value;else sandbox[name]=value;
   if(names.includes(name))values[name]={line:ast.getLineAndCharacterOfPosition(node.getStart(ast)).line+1,value:JSON.parse(JSON.stringify(value))};
  }catch(e){if(names.includes(name))errors[name]=String(e.message);}
 }
 for(const name of names)if(!values[name]&&!errors[name])errors[name]='Named expression not found';
 return{file,values,errors};
}
module.exports={extract,root};
if(require.main===module){const[file,...names]=process.argv.slice(2);process.stdout.write(JSON.stringify(extract(file,names),null,2)+'\n');}
