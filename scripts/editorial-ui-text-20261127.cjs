/* Spanish UI prose from reviewed source files. Templates keep placeholders;
 * interpolation code is not counted as editorial content. No CSS, selectors,
 * media paths or English branches of the existing bilingual helpers. */
const ts=require('../labs/desire/node_modules/typescript');
const {JSDOM}=require('../scripts/qa/node_modules/jsdom');
const {parse}=require('./audit-editorial-corpus-20261127.cjs');
function visibleText(node){const walker=node.ownerDocument.createTreeWalker(node,4),parts=[];while(walker.nextNode())parts.push(walker.currentNode.textContent);return parts.join(' ').replace(/\s+/g,' ').trim();}
function uiText(file,source){
 if(file.endsWith('.html')){
  const dom=new JSDOM(source),doc=dom.window.document,out={'page.title':doc.title};
  doc.querySelectorAll('script,style,svg').forEach(n=>n.remove());
  const selectors='section[id],main,nav,#guestScreen,#authScreen';
  const blocks=[...doc.body.querySelectorAll(selectors)].filter(n=>!n.querySelector(selectors));
  (blocks.length?blocks:[doc.body]).forEach((n,i)=>{const text=visibleText(n);if(text)out[(n.id||n.tagName.toLowerCase()+i)+'.visible_text']=text;});
  dom.window.close();return out;
 }
 const sf=ts.createSourceFile(file,source,ts.ScriptTarget.Latest,true,file.endsWith('.tsx')?ts.ScriptKind.TSX:ts.ScriptKind.JS),english=[],templates=new Map();
 const range=n=>{if(n)english.push([n.getStart(sf),n.end]);};
 function visit(n){
  if(ts.isJsxAttribute(n)&&(/^(?:className|style|preserveAspectRatio|viewBox|d|id)$/.test(n.name.getText(sf))||/^data-/.test(n.name.getText(sf))))range(n.initializer);
  if(ts.isCallExpression(n)&&/^(?:t|tx|guestText)$/.test(n.expression.getText(sf)))range(n.arguments[1]);
  if(ts.isConditionalExpression(n)&&/(?:\b(?:isEn|en|english)\b|[Ee]nglish\(|===?\s*['"]en['"])/.test(n.condition.getText(sf)))range(n.whenTrue);
  if(ts.isVariableDeclaration(n)&&n.name.getText(sf)==='en')range(n.initializer);
  if(ts.isPropertyAssignment(n)&&/^(?:en|['"]en['"]|\w+_en)$/.test(n.name.getText(sf)))range(n.initializer);
  if(ts.isVariableDeclaration(n)&&n.name.getText(sf)==='motiveDefs'&&n.initializer&&ts.isArrayLiteralExpression(n.initializer))for(const row of n.initializer.elements)if(ts.isArrayLiteralExpression(row))range(row.elements[2]);
  if(file.endsWith('guest-entry-v1.js')&&ts.isVariableDeclaration(n)&&['priorities','returnMessages','labels'].includes(n.name.getText(sf))&&n.initializer&&ts.isObjectLiteralExpression(n.initializer))for(const p of n.initializer.properties)if(ts.isPropertyAssignment(p)&&ts.isArrayLiteralExpression(p.initializer))p.initializer.elements.forEach((v,i)=>{if(i%2===1)range(v);});
  if(ts.isTemplateExpression(n))templates.set(n.getStart(sf),n.head.text+n.templateSpans.map((s,i)=>'{{'+i+'}}'+s.literal.text).join(''));
  ts.forEachChild(n,visit);
 }
 visit(sf);
 const out={};
 for(const item of parse(file,source)){
  const pos=item.line&&item.column?sf.getPositionOfLineAndCharacter(item.line-1,item.column-1):null;
  if(pos!==null&&english.some(([a,b])=>pos>=a&&pos<b)||/\.en\.|_en(?:\.|#)|showEnglish\(\)/.test(item.key))continue;
  if(/\.uid#|\.observer\.(?:rootMargin|threshold)#|BreathingLab\(\)\.save#/.test(item.key))continue;
  if(file.endsWith('commercial-journey-v1.js')&&/\.screens\.\[\d+\]\.\[2\]/.test(item.key))continue;
  let text=pos!==null&&templates.has(pos)?templates.get(pos):item.text;
  if(/(?:\buse strict\b|prefers-reduced-motion|^(?:\.|#|--)[\w-]+|^[\w-]+: ?\{)/.test(text)&&!/<(?:p|h[1-6]|button|label|span|main|section)\b/.test(text))continue;
  if(/<[a-z][a-z\d-]*(?:\s|>|\/)/i.test(text)){
   const fragment=JSDOM.fragment(text);
   fragment.querySelectorAll('style,script,svg').forEach(n=>n.remove());
   text=visibleText(fragment);
  }
  text=text.replace(/\s+/g,' ').trim();
  if((text.match(/\{\{\d+\}\}/g)||[]).length>5)continue;
  const staticText=text.replace(/\{\{\d+\}\}/g,'').replace(/[{}$`]/g,'').trim();
  if(/^(?:Escape|Enter|Tab|Home|End|Arrow(?:Up|Down|Left|Right))$/.test(staticText)||/^["'\s]*(?:data-[a-z-]+|maxlength|value|placeholder|class|aria-[a-z-]+)=/.test(staticText))continue;
  if(!/[A-Za-zÀ-ÿ]{2}/.test(staticText)||/^["']?<\w+\s+class=/.test(staticText)||/(?:background-image:url|class=|data-scene=|aria-hidden=)/.test(staticText))continue;
  if(/^(?:https?:|data:|\/|assets\/|[\w-]+\.[jc]ss?$)/.test(staticText))continue;
  if(/^(?:spm[\w-]+\s*)+$/.test(staticText)||/^(?:body|html|document)\s*[>.#[ ]/.test(staticText))continue;
  if(/^(?:secondary|on|notice\b|\[data-)/.test(staticText))continue;
  out[item.key]=text;
 }
 return out;
}
module.exports={uiText};
if(require.main===module){const fs=require('node:fs');const file=process.argv[2];console.log(JSON.stringify(uiText(file,fs.readFileSync(file,'utf8')),null,2));}
