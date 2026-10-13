// Byte-range responses are required to test real HTML video seeking.
// Run from repository root: node tests/support/static-server.cjs
const http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const root=process.cwd();
http.createServer((req,res)=>{
 try{
  const file=path.resolve(root,'.'+decodeURIComponent(req.url.split('?')[0]));
  if(!file.startsWith(root+path.sep))throw Error();
  const st=fs.statSync(file);if(!st.isFile())throw Error();
  let start=0,end=st.size-1,status=200;
  const m=/^bytes=(\d+)-(\d*)$/.exec(req.headers.range||'');
  if(m){start=+m[1];end=m[2]?Math.min(+m[2],end):end;status=206;}
  if(start>end){res.writeHead(416,{'Content-Range':`bytes */${st.size}`});res.end();return;}
  const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.mp4':'video/mp4','.webm':'video/webm','.mp3':'audio/mpeg','.jpg':'image/jpeg','.png':'image/png'};
  res.writeHead(status,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Accept-Ranges':'bytes','Content-Length':end-start+1,...(status===206?{'Content-Range':`bytes ${start}-${end}/${st.size}`}:{})});
  if(req.method==='HEAD')res.end();else fs.createReadStream(file,{start,end}).pipe(res);
 }catch{res.writeHead(404);res.end();}
}).listen(4173,'127.0.0.1');
