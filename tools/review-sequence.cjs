const {chromium}=require('@playwright/test');const fs=require('node:fs');
(async()=>{
 const b=await chromium.launch({channel:'msedge',headless:true});
 const p=await b.newPage({viewport:{width:1920,height:1280}});
 await p.setContent('<style>body{margin:0}video{display:none}</style><video muted src="http://127.0.0.1:5173/evidence/complete-sequence.webm"></video>');
 await p.evaluate(async()=>{
  const v=document.querySelector('video');if(v.readyState<1)await new Promise((r,j)=>{v.onloadedmetadata=r;v.onerror=j});
  const c=document.createElement('canvas');c.width=1920;c.height=1280;document.body.append(c);const ctx=c.getContext('2d');ctx.fillStyle='#171717';ctx.fillRect(0,0,c.width,c.height);
  for(let i=0;i<16;i++){v.currentTime=v.duration*(.025+i*.062);await new Promise(r=>v.onseeked=r);const x=i%4*480,y=Math.floor(i/4)*320;ctx.drawImage(v,x,y,480,300);ctx.fillStyle='#eee';ctx.font='12px sans-serif';ctx.fillText(v.currentTime.toFixed(2)+'s',x+12,y+314);}
 });
 await p.locator('canvas').screenshot({path:'evidence/complete-sequence-contact.png'});await b.close();
})().catch(e=>{console.error(e);process.exit(1)});

