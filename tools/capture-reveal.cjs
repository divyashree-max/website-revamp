const {chromium}=require('@playwright/test'),fs=require('node:fs');
(async()=>{
 const b=await chromium.launch({channel:'msedge',headless:true});const context=await b.newContext({viewport:{width:1440,height:900}}),page=await context.newPage();const errors=[],warnings=[],stages=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());if(m.type()==='warning')warnings.push(m.text())});
 await page.goto('http://127.0.0.1:5173/?debug=1&t=.25');await page.waitForSelector('#development-controls[data-ready]',{timeout:60000});
 for(const [name,time] of [['opening',.25],['orbit',1.2],['joint-detail',2.25],['particles',3.85],['solid-resolution',4.6],['screen-brand',5.85],['screen-entry',7.1],['hero',7.75]]){
  await page.getByLabel('Development timeline time',{exact:true}).evaluate((el,v)=>{el.value=v;el.dispatchEvent(new Event('input',{bubbles:true}))},time);
  await page.screenshot({path:`evidence/reveal-${name}.png`});stages.push({name,...await page.evaluate(()=>window.craftechDiagnostics())});
 }
 fs.writeFileSync('evidence/reveal-stages.json',JSON.stringify({errors,warnings,stages},null,2));console.log(JSON.stringify({errors,warnings,first:stages[0]},null,2));
 await context.close();const videoContext=await b.newContext({viewport:{width:1440,height:900},recordVideo:{dir:'evidence/video',size:{width:1440,height:900}}});const live=await videoContext.newPage();await live.goto('http://127.0.0.1:5173');await live.waitForFunction(()=>window.craftechDiagnostics?.().hero,{},{timeout:60000});await live.waitForTimeout(400);const video=live.video();await videoContext.close();fs.copyFileSync(await video.path(),'evidence/reveal-continuous.webm');await b.close();
})().catch(e=>{console.error(e);process.exit(1)});
