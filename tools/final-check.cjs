const {chromium}=require('@playwright/test');
const fs=require('node:fs');

(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 const page=await browser.newPage({viewport:{width:1440,height:810}});
 const errors=[],warnings=[],views=[];
 page.on('pageerror',e=>errors.push(e.message));
 page.on('console',m=>{if(m.type()==='error')errors.push(m.text());if(m.type()==='warning')warnings.push(m.text())});
 page.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`)});
 // Even an explicit debug URL must not expose development controls in production.
 await page.goto('http://127.0.0.1:4173/?debug=1&t=3.85');
 await page.waitForFunction(()=>window.craftechDiagnostics?.().hero);
 await page.getByRole('button',{name:'Pause motion'}).click();
 await page.screenshot({path:'evidence/production-hero.png'});
 const production=await page.evaluate(()=>window.craftechDiagnostics());
 const debugVisible=await page.locator('#development-controls').count();
 for(const [width,height] of [[320,568],[1024,768],[1920,1080],[844,390]]){
  await page.setViewportSize({width,height});
  await page.getByRole('button',{name:'Replay intro'}).click();
  await page.waitForTimeout(150);
  await page.screenshot({path:`evidence/${width}-opening.png`});
  await page.getByRole('button',{name:'Skip intro'}).click();
  await page.screenshot({path:`evidence/${width}-hero.png`});
  const view=await page.evaluate(()=>({width:innerWidth,height:innerHeight,overflow:document.documentElement.scrollWidth>innerWidth,hero:window.craftechDiagnostics().hero,buttons:[...document.querySelectorAll('.controls button:not([hidden])')].map(b=>{const r=b.getBoundingClientRect();return {label:b.textContent.trim(),width:r.width,height:r.height,within:r.left>=0&&r.right<=innerWidth&&r.top>=0&&r.bottom<=innerHeight}})}));
  views.push(view);
 }
 const report={production,debugVisible,views,errors,warnings};
 fs.writeFileSync('evidence/production-check.json',JSON.stringify(report,null,2));
 console.log(JSON.stringify(report));
 await browser.close();
 if(errors.length||debugVisible||views.some(v=>v.overflow||!v.hero||v.buttons.some(b=>!b.within||b.height<44)))process.exitCode=1;
})().catch(e=>{console.error(e);process.exit(1)});
