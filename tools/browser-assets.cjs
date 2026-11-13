/** Optional localhost asset transport for browser QA when loopback is blocked. */
const fs=require('node:fs/promises'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.jpg':'image/jpeg','.ttf':'font/ttf','.mp4':'video/mp4','.json':'application/json','.glb':'model/gltf-binary'};
exports.serveLocalAssets=async page=>page.route('http://127.0.0.1:5173/**',async route=>{
 const url=new URL(route.request().url()),file=path.resolve(root,'.'+(url.pathname==='/'?'/index.html':decodeURIComponent(url.pathname)));
 if(!file.startsWith(root+path.sep))return route.fulfill({status:403,body:''});
 try{let body=await fs.readFile(file),status=200;const headers={'content-type':types[path.extname(file)]||'application/octet-stream','accept-ranges':'bytes'};
 const range=route.request().headers().range?.match(/^bytes=(\d+)-(\d*)$/);if(range){const start=Number(range[1]),end=Math.min(range[2]?Number(range[2]):body.length-1,body.length-1);headers['content-range']=`bytes ${start}-${end}/${body.length}`;body=body.subarray(start,end+1);status=206}
 await route.fulfill({status,headers,body});}catch{await route.fulfill({status:404,body:'Not found'})}
});
