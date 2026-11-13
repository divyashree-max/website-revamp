const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const refs = 'C:/Users/CFT 02/OneDrive/Desktop/website revamp/';
const referenceFiles = [
  refs+'motiondesignerspro_ssspin.io_1793787043.mp4', refs+'movement and rotation.mp4',
  'C:/Users/CFT 02/Downloads/installtion.mp4', refs+'TAGG9212.MP4', refs+'TAGG9330.MP4', refs+'TAGG9333.MP4', refs+'TAGG9328.MP4',
];
referenceFiles.push(refs+'From Klickpin.com- Discover Cozy fall outfit ideas for a polished look people will notice with enough variety to inspire your next creative step-p.mp4');
const mime = {'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.jpg':'image/jpeg','.glb':'model/gltf-binary','.png':'image/png','.jpeg':'image/jpeg','.ttf':'font/ttf','.mp4':'video/mp4','.json':'application/json'};
http.createServer((req,res)=>{
 let name; try{name=decodeURIComponent(new URL(req.url,'http://localhost').pathname)}catch{res.writeHead(400).end();return;}
 let file;
 if(/^\/reference\/\d$/.test(name)) file=referenceFiles[Number(name.split('/').pop())];
 else { file=path.resolve(root, name==='/'?'index.html':'.'+name); if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}}
 fs.stat(file||'',(err,stat)=>{
  if(err||!stat.isFile()){res.writeHead(404).end('Not found');return;}
  const headers={'Content-Type':mime[path.extname(file).toLowerCase()]||'application/octet-stream','Cache-Control':'no-cache','Accept-Ranges':'bytes'};
  if(req.headers.range){const m=/bytes=(\d+)-(\d*)/.exec(req.headers.range);if(!m){res.writeHead(416).end();return;}const start=Number(m[1]),end=Math.min(m[2]?Number(m[2]):stat.size-1,stat.size-1);if(start>end){res.writeHead(416).end();return;}res.writeHead(206,{...headers,'Content-Range':`bytes ${start}-${end}/${stat.size}`,'Content-Length':end-start+1});fs.createReadStream(file,{start,end}).pipe(res);}
  else{res.writeHead(200,{...headers,'Content-Length':stat.size});fs.createReadStream(file).pipe(res);}
 });
}).listen(5173,'127.0.0.1',()=>console.log('Craftech360: http://localhost:5173'));
