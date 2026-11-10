const {chromium}=require('@playwright/test'),fs=require('node:fs');
(async()=>{const b=await chromium.launch({channel:'msedge',headless:true}),p=await b.newPage({viewport:{width:1440,height:900}}),errors=[];
 p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text())});p.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url())});
 await p.goto((process.env.SITE_URL||'http://127.0.0.1:4173')+'/?debug=1&t=0');await p.waitForFunction(()=>window.craftechDiagnostics?.().hero,{},{timeout:60000});const state=await p.evaluate(()=>window.craftechDiagnostics()),debugControls=await p.locator('#development-controls').count();await p.screenshot({path:'evidence/sequence-production-homepage.png'});
 fs.writeFileSync('evidence/sequence-production.json',JSON.stringify({errors,debugControls,state},null,2));console.log(JSON.stringify({errors,debugControls,time:state.time,hero:state.hero,homepageReady:state.homepageReady}));await b.close();
})().catch(e=>{console.error(e);process.exit(1)});
