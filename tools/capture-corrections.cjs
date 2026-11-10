const {chromium}=require('@playwright/test'),fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 const context=await browser.newContext({viewport:{width:1440,height:900}}),page=await context.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});page.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url())});
 await page.goto('http://127.0.0.1:5173/?debug=1&camera=locked&t=0');await page.waitForSelector('#development-controls[data-ready]',{timeout:60000});
 const stages=[];
 for(const time of [0,3,5.2,6.8,8.3,11,13,16,18]){
  await page.getByLabel('Development timeline time',{exact:true}).evaluate((el,v)=>{el.value=v;el.dispatchEvent(new Event('input',{bubbles:true}))},time);
  await page.screenshot({path:`evidence/corrected-${time}.png`});stages.push(await page.evaluate(()=>window.craftechDiagnostics()));
 }
 fs.writeFileSync('evidence/corrected-stages.json',JSON.stringify({errors,stages},null,2));
 await page.setViewportSize({width:1440,height:1080});await page.setContent('<body style="margin:0;background:#111;color:white;font:14px sans-serif"><div style="display:grid;grid-template-columns:repeat(3,1fr)">'+stages.map(s=>`<div>${s.time}s<img style="width:100%" src="data:image/png;base64,${fs.readFileSync(`evidence/corrected-${s.time}.png`).toString('base64')}"></div>`).join('')+'</div></body>');await page.screenshot({path:'evidence/corrected-contact.png'});
 console.log(JSON.stringify({errors,stages:stages.map(s=>({time:s.time,center:s.screenCenter,normal:s.screenNormal,bottom:s.screenBottom,mean:s.meanFrameMs}))}));await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
