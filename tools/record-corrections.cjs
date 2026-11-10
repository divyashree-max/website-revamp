const {chromium}=require('@playwright/test'),fs=require('node:fs');
(async()=>{
 const b=await chromium.launch({channel:'msedge',headless:true});const context=await b.newContext({viewport:{width:1440,height:900},recordVideo:{dir:'evidence/video',size:{width:1440,height:900}}});
 const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
 await page.goto('http://127.0.0.1:5173/?camera=locked');await page.waitForFunction(()=>window.craftechDiagnostics?.().rigAnimation,{},{timeout:60000});
 await page.waitForTimeout(21000);const final=await page.evaluate(()=>window.craftechDiagnostics()),video=page.video();
 await context.close();fs.copyFileSync(await video.path(),'evidence/corrected-locked-loop.webm');fs.writeFileSync('evidence/corrected-recording.json',JSON.stringify({errors,final},null,2));
 console.log(JSON.stringify({errors,iteration:final.iteration,time:final.time,meanFrameMs:final.meanFrameMs}));await b.close();
})().catch(e=>{console.error(e);process.exit(1)});
