const {chromium}=require('@playwright/test'),fs=require('node:fs');
(async()=>{const b=await chromium.launch({channel:'msedge',headless:true}),p=await b.newPage({viewport:{width:1440,height:900}}),errors=[];
 p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text())});p.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url())});
 await p.goto('http://127.0.0.1:5173/?debug=1&t=0');await p.waitForSelector('#development-controls[data-ready]');await p.addStyleTag({content:'#development-controls{display:none!important}'});
 const stages=[];for(const t of [0,3.3,5,5.9,6.8,8.5,9.8,10.7,11.7,13,14,15.4,16,17.5,18.5,20.5,22,24,24.999,25]){
  await p.getByLabel('Development timeline time',{exact:true}).evaluate((el,t)=>{el.step='any';el.value=t;el.dispatchEvent(new Event('input',{bubbles:true}))},t);
  await p.screenshot({path:`evidence/sequence-${t}.png`});stages.push(await p.evaluate(()=>window.craftechDiagnostics()));
 }
 fs.writeFileSync('evidence/sequence-stages.json',JSON.stringify({errors,stages},null,2));
 await p.setViewportSize({width:1920,height:1600});await p.setContent('<body style="margin:0;background:#141414;color:white;font:12px sans-serif"><div style="display:grid;grid-template-columns:repeat(4,1fr)">'+stages.map(s=>`<div>${s.time}s<img style="width:100%" src="data:image/png;base64,${fs.readFileSync(`evidence/sequence-${s.time}.png`).toString('base64')}"></div>`).join('')+'</div></body>');await p.screenshot({path:'evidence/sequence-contact.png'});
 console.log(JSON.stringify({errors,stages:stages.map(s=>({t:s.time,facing:s.screenFacing,spin:s.wristRevolution,solid:s.solidVisible,dissolve:s.dissolve,trace:s.particles.trace,fill:s.particles.fill,center:s.screenCenterNDC.slice(0,2)}))}));await b.close();
})().catch(e=>{console.error(e);process.exit(1)});
