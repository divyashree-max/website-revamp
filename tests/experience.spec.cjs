const {test,expect}=require('@playwright/test');
const fs=require('node:fs');
const snapshot=p=>p.evaluate(()=>window.craftechDiagnostics());
async function ready(p,debug=false){await p.addInitScript(()=>sessionStorage.removeItem('craftech360-intro-complete'));await p.goto(debug?'/?debug=1&t=0':'/');await p.waitForFunction(()=>window.craftechDiagnostics?.().rigAnimation&&!window.craftechDiagnostics().failed&&document.querySelector('#experience').hasAttribute('data-ready'));if(debug)await p.waitForSelector('#development-controls[data-ready]');}
async function seek(p,t){await p.getByLabel('Development timeline time',{exact:true}).evaluate((el,t)=>{el.step='any';el.value=t;el.dispatchEvent(new Event('input',{bubbles:true}))},t);return snapshot(p);}
function errorsFrom(p){const errors=[];p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text())});p.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url())});return errors;}

test('complete shortened sequence plays through articulation, particles, direct solid restoration and homepage',async({page})=>{
 const errors=errorsFrom(page);await ready(page);const samples=[];for(let i=0;i<54;i++){samples.push(await snapshot(page));await page.waitForTimeout(500);}
 for(const stage of ['armPerformance','screenRotation','dissolve','swarm','gather','particleRobot','solidRestore','frontalSettle','brandHold','enterScreen','hero'])expect(samples.some(s=>s.state===stage),stage).toBeTruthy();
 const first=samples[0],last=samples.at(-1);expect(first.playbackRate).toBe(1.225);expect(first.playbackDuration).toBeCloseTo(27.5/1.225,6);expect(last.hero).toBeTruthy();expect(last.time).toBe(27.5);expect(last.iteration).toBe(1);expect(last.homepageReady).toBeTruthy();
 for(const s of samples){expect(s.modelTriangles).toBe(1276964);expect(s.baseMatrix).toEqual(first.baseMatrix);expect(s.rootPosition).toEqual(first.rootPosition);expect(s.floorMatrix).toEqual(first.floorMatrix);expect(s.screenLocalMatrix).toEqual(first.screenLocalMatrix);expect(s.screenRatio).toBeCloseTo(1,2);expect(s.screenBottom).toBeGreaterThan(.1);}
 expect(samples.some(s=>!s.solidVisible&&s.particles.alpha>.9)).toBeTruthy();expect(samples.some(s=>!s.solidVisible&&s.particles.particleRobotHold)).toBeTruthy();expect(errors).toEqual([]);
 fs.writeFileSync('evidence/sequence-live-check.json',JSON.stringify({errors,samples},null,2));
});

test('A6 rolls the front-facing physical display clockwise while A1–A5 hold still',async({page})=>{
 await ready(page,true);const front=await seek(page,6),samples=[];
 const dot=(a,b)=>a.reduce((sum,v,i)=>sum+v*b[i],0),cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
 const right=cross(front.lookDirection,front.screenUp);let lastAngle=0,unwrapped=0;
 for(let i=0;i<=80;i++){
  const state=await seek(page,6+5.2*i/80);samples.push(state);
  for(let k=0;k<3;k++){expect(state.camera[k]).toBeCloseTo(front.camera[k],10);expect(state.lookDirection[k]).toBeCloseTo(front.lookDirection[k],10);expect(state.screenNormal[k]).toBeCloseTo(front.screenNormal[k],5);expect(state.screenCenter[k]).toBeCloseTo(front.screenCenter[k],5);}
  expect(state.screenFacing).toBeGreaterThan(.999999);expect(state.proportionsUnchanged).toBeTruthy();
  for(let j=0;j<5;j++){const actual=state.joints[j],held=front.joints[j];expect(Math.abs(dot(actual.quaternion,held.quaternion))).toBeCloseTo(1,10);for(let k=0;k<3;k++)expect(actual.position[k]).toBeCloseTo(held.position[k],9);expect(actual.localPosition).toEqual(held.localPosition);expect(actual.localScale).toEqual(held.localScale);}
  expect(state.baseMatrix).toEqual(front.baseMatrix);expect(state.screenLocalMatrix).toEqual(front.screenLocalMatrix);
  const angle=Math.atan2(dot(state.screenUp,right),dot(state.screenUp,front.screenUp));let step=angle-lastAngle;if(step<-Math.PI)step+=Math.PI*2;if(step>Math.PI)step-=Math.PI*2;unwrapped+=step;lastAngle=angle;
  expect(step).toBeGreaterThan(-.00001);expect(unwrapped).toBeCloseTo(state.wristRevolution,4);
 }
 expect(unwrapped).toBeCloseTo(2*Math.PI,6);expect(dot(samples.at(-1).screenUp,front.screenUp)).toBeCloseTo(1,9);
 fs.writeFileSync('evidence/full-revolution-check.json',JSON.stringify({axis:'A6 local -Y, clockwise from display front',samples},null,2));
});

test('recognisable particles restore directly to solid with no line drawing or later arm gestures',async({page})=>{
 await ready(page,true);const first=await seek(page,11.5),leaving=await seek(page,12.5),swarm=await seek(page,14.2),shape=await seek(page,18.3),hold=await seek(page,18.8),fill=await seek(page,20),solid=await seek(page,21),front=await seek(page,23),entry=await seek(page,26);
 expect(leaving.dissolve).toBeGreaterThan(.3);expect(leaving.particles.alpha).toBeGreaterThan(.9);expect(swarm.solidVisible).toBeFalsy();
 for(const state of [shape,hold]){expect(state.solidVisible).toBeFalsy();expect(state.particles.particleRobotHold).toBeTruthy();expect(state.particles.surfaceReturn).toBe(1);for(const count of Object.values(state.particles.coverage))expect(count).toBeGreaterThan(1000);}
 expect(fill.solidVisible).toBeTruthy();expect(fill.particles.fill).toBeCloseTo(.5,8);expect(fill.particles.alpha).toBeCloseTo(.5,8);expect(solid.dissolve).toBe(0);expect(solid.particles.alpha).toBe(0);
 for(const state of [leaving,swarm,shape,hold,fill,solid,front,entry]){expect(state.joints).toEqual(first.joints);expect(state.screenCenter).toEqual(first.screenCenter);expect(state.proportionsUnchanged).toBeTruthy();expect(state.particles.contourSegments).toBe(0);expect(state.particles.lineDrawing).toBeFalsy();}
 expect(solid.screenIllumination).toBe(1);expect(front.screenIllumination).toBe(1);expect(entry.screenIllumination).toBeLessThan(1);
 await page.addStyleTag({content:'#development-controls{display:none!important}'});await seek(page,18.5);await page.screenshot({path:'evidence/direct-verified-particles.png'});await seek(page,21);await page.screenshot({path:'evidence/direct-verified-solid.png'});
});

test('approved opening leads to one direct final alignment after particle reconstruction',async({page})=>{
 await ready(page,true);const detail=await seek(page,0),wide=await seek(page,2.8),performance=await seek(page,6),dissolve=await seek(page,13),particle=await seek(page,18.5),solid=await seek(page,21),front=await seek(page,23);
 const distance=(a,b)=>Math.hypot(...a.map((v,i)=>v-b[i]));expect(distance(detail.camera,wide.camera)).toBeGreaterThan(3);expect(distance(wide.camera,performance.camera)).toBeGreaterThan(.6);expect(distance(performance.camera,dissolve.camera)).toBeGreaterThan(.8);expect(distance(particle.camera,solid.camera)).toBeLessThan(.000001);
 const axis=front.camera.map((v,i)=>v-solid.camera[i]),length=distance(front.camera,solid.camera);expect(length).toBeGreaterThan(.2);
 for(const t of [21.2,21.6,22,22.4,22.8]){const state=await seek(page,t),offset=state.camera.map((v,i)=>v-solid.camera[i]),u=offset.reduce((sum,v,i)=>sum+v*axis[i],0)/(length*length);expect(u).toBeGreaterThanOrEqual(0);expect(u).toBeLessThanOrEqual(1);expect(distance(state.camera,solid.camera.map((v,i)=>v+axis[i]*u))).toBeLessThan(.000001);}
 for(const state of [detail,wide,performance,dissolve,particle,solid,front]){expect(state.proportionsUnchanged).toBeTruthy();expect(state.cable.corrected).toBeTruthy();expect(state.baseMatrix).toEqual(detail.baseMatrix);for(const joint of state.joints){const source=detail.joints.find(j=>j.name===joint.name);expect(joint.localPosition).toEqual(source.localPosition);expect(joint.localScale).toEqual(source.localScale);expect(joint.linkLength).toBeCloseTo(source.linkLength,8);}}
 fs.writeFileSync('evidence/direct-camera-proportions.json',JSON.stringify({detail,wide,performance,dissolve,particle,solid,front},null,2));
});

test('frontal pose is finished, centered and level before a straight screen-axis entry',async({page})=>{
 await ready(page,true);const front=await seek(page,23),samples=[];
 for(const t of [23.5,24,25,26.5,27.49])samples.push(await seek(page,t));
 for(const s of samples){expect(s.joints).toEqual(front.joints);expect(s.screenFacing).toBeGreaterThan(.999999);expect(s.screenLevel).toBeGreaterThan(.999999);expect(Math.abs(s.screenCenterNDC[0])).toBeLessThan(.00001);expect(Math.abs(s.screenCenterNDC[1])).toBeLessThan(.00001);expect(s.screenCenter).toEqual(front.screenCenter);}
 const distances=samples.map(s=>Math.hypot(...s.camera.map((v,i)=>v-s.screenCenter[i])));expect(distances[0]).toBeCloseTo(distances[1],9);expect(distances.at(-1)).toBeLessThan(distances[1]);
 for(const s of samples){const v=s.camera.map((x,i)=>x-s.screenCenter[i]),d=Math.hypot(...v);expect(v.every((x,i)=>Math.abs(x/d-s.screenNormal[i])<.000001)).toBeTruthy();}
 await page.addStyleTag({content:'.controls,.hero-note,#development-controls{display:none!important}'});await seek(page,27.499);const physical=await page.screenshot();await seek(page,27.5);const homepage=await page.screenshot();
 fs.writeFileSync('evidence/handoff-physical.png',physical);fs.writeFileSync('evidence/handoff-homepage.png',homepage);
 const mae=await page.evaluate(async([a,b])=>{const images=await Promise.all([a,b].map(src=>new Promise(r=>{const i=new Image();i.onload=()=>r(i);i.src='data:image/png;base64,'+src})));const c=document.createElement('canvas');c.width=images[0].width;c.height=images[0].height;const ctx=c.getContext('2d');ctx.drawImage(images[0],0,0);const x=Math.floor(c.width*.15),y=Math.floor(c.height*.2),w=Math.floor(c.width*.7),h=Math.floor(c.height*.6),one=ctx.getImageData(x,y,w,h).data;ctx.drawImage(images[1],0,0);const two=ctx.getImageData(x,y,w,h).data;let sum=0;for(let i=0;i<one.length;i+=4)sum+=Math.abs(one[i]-two[i])+Math.abs(one[i+1]-two[i+1])+Math.abs(one[i+2]-two[i+2]);return sum/(w*h*3)},[physical.toString('base64'),homepage.toString('base64')]);
 fs.writeFileSync('evidence/handoff-check.json',JSON.stringify({centralImageMeanAbsoluteChannelDifference:mae},null,2));expect(mae).toBeLessThan(.3);
});

test('Skip reaches ready homepage from every transformation; keyboard Replay is usable',async({page})=>{
 await ready(page,true);for(const t of [0,8.6,14.2,18.7,20,23,26]){await seek(page,t);await page.getByRole('button',{name:'Skip intro'}).click();expect((await snapshot(page)).hero).toBeTruthy();await expect(page.getByRole('button',{name:'Replay intro'})).toBeFocused();}
 await page.getByRole('button',{name:'Replay intro'}).press('Enter');expect((await snapshot(page)).hero).toBeFalsy();await expect(page.getByRole('button',{name:'Skip intro'})).toBeFocused();await page.keyboard.press('Enter');expect((await snapshot(page)).hero).toBeTruthy();
});

test('homepage waits for actual logo readiness at the settled presentation',async({page})=>{
 let release;const gate=new Promise(r=>release=r);await page.route('**/craftech360-logo.png',async r=>{await gate;await r.continue()});
 await page.goto('/?debug=1&t=23.99',{waitUntil:'domcontentloaded'});await page.waitForSelector('#development-controls[data-ready]');await page.getByRole('button',{name:'Play',exact:true}).click();await page.waitForFunction(()=>window.craftechDiagnostics().waiting);
 const held=await snapshot(page);expect(held.homepageReady).toBeFalsy();expect(held.hero).toBeFalsy();expect(held.screenFacing).toBeGreaterThan(.999999);await page.waitForTimeout(300);expect((await snapshot(page)).time).toBe(24);expect((await snapshot(page)).joints).toEqual(held.joints);
 release();await page.waitForFunction(()=>window.craftechDiagnostics().hero);expect((await snapshot(page)).homepageReady).toBeTruthy();
});

test('early Skip waits for model readiness rather than claiming an unloaded homepage',async({page})=>{
 let release;const gate=new Promise(r=>release=r);await page.route('**/kuka-display.web.glb',async r=>{await gate;await r.continue()});await page.goto('/',{waitUntil:'domcontentloaded'});await page.getByRole('button',{name:'Skip intro'}).click();await expect(page.getByRole('button',{name:'Skip intro'})).toBeDisabled();expect((await snapshot(page)).state).toBe('loading');release();await page.waitForFunction(()=>window.craftechDiagnostics().hero);await expect(page.getByRole('button',{name:'Replay intro'})).toBeEnabled();
});

test('once-per-visit completion survives reload while explicit Replay remains available',async({page})=>{
 await page.goto('/');await page.waitForFunction(()=>window.craftechDiagnostics?.().rigAnimation);await page.getByRole('button',{name:'Skip intro'}).click();await page.reload();await page.waitForFunction(()=>window.craftechDiagnostics?.().rigAnimation);expect((await snapshot(page)).hero).toBeTruthy();expect((await snapshot(page)).time).toBe(27.5);await page.getByRole('button',{name:'Replay intro'}).click();expect((await snapshot(page)).hero).toBeFalsy();
});

test('reduced motion uses a static homepage and reacts to preference changes',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await ready(page);const first=await snapshot(page);expect(first.hero).toBeTruthy();expect(first.paused).toBeTruthy();await page.mouse.move(1000,600);await page.waitForTimeout(180);expect((await snapshot(page)).phase).toBe(first.phase);expect((await snapshot(page)).pointer).toEqual([0,0]);
 await page.emulateMedia({reducedMotion:'no-preference'});await page.getByRole('button',{name:'Replay intro'}).click();await page.waitForTimeout(200);expect((await snapshot(page)).hero).toBeFalsy();await page.emulateMedia({reducedMotion:'reduce'});await page.waitForFunction(()=>window.craftechDiagnostics().hero&&window.craftechDiagnostics().paused);await page.screenshot({path:'evidence/sequence-reduced-motion.png'});
});

test('mobile and tablet framing survives every mechanical pose and mid-intro resize',async({page})=>{
 await page.setViewportSize({width:320,height:844});await ready(page,true);
 for(const viewport of [{width:320,height:844},{width:768,height:1024},{width:844,height:390}]){await page.setViewportSize(viewport);for(const t of [2.8,6,7.4,8.6,10,11.2,18.5,20.5,23]){const s=await seek(page,t);for(const [x,y]of s.screenCorners){expect(Math.abs(x)).toBeLessThan(1);expect(Math.abs(y)).toBeLessThan(1);}}await page.screenshot({path:`evidence/sequence-${viewport.width}-presentation.png`});}
 await page.setViewportSize({width:390,height:844});await seek(page,27.5);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();await expect(page.getByRole('button',{name:'Replay intro'})).toBeInViewport();await expect(page.getByRole('button',{name:'Pause motion'})).toBeInViewport();await page.screenshot({path:'evidence/sequence-mobile-homepage.png'});
});

test('ambient pause, bounded pointer and touch input remain usable',async({browser,page})=>{
 await ready(page);await page.getByRole('button',{name:'Skip intro'}).click();await page.mouse.move(1000,700);await page.waitForTimeout(250);expect(Math.abs((await snapshot(page)).pointer[0])).toBeGreaterThan(.1);await page.getByRole('button',{name:'Pause motion'}).click();const stopped=await snapshot(page);await page.waitForTimeout(200);expect((await snapshot(page)).phase).toBe(stopped.phase);await page.getByRole('button',{name:'Resume motion'}).click();await page.waitForTimeout(100);expect((await snapshot(page)).phase).toBeGreaterThan(stopped.phase);
 const ctx=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true}),touch=await ctx.newPage();await ready(touch);await touch.getByRole('button',{name:'Skip intro'}).tap();await touch.touchscreen.tap(300,500);await touch.waitForTimeout(200);expect(Math.abs((await snapshot(touch)).pointer[0])).toBeGreaterThan(.1);expect(await touch.locator('#scene').evaluate(e=>getComputedStyle(e).touchAction)).toBe('pan-y');await ctx.close();
});

test('missing critical assets and lost WebGL reach a usable fallback',async({browser})=>{
 for(const asset of ['kuka-display.web.glb','robot-reveal.bin','craftech360-logo.png']){const ctx=await browser.newContext(),p=await ctx.newPage();await p.route('**/'+asset,r=>r.abort());await p.goto('/');await expect(p.locator('#fallback')).toBeVisible();expect((await snapshot(p)).failed).toBeTruthy();await expect(p.locator('#loading-note')).toBeHidden();await ctx.close();}
 const ctx=await browser.newContext(),p=await ctx.newPage();await ready(p);await p.evaluate(()=>document.querySelector('#scene').dispatchEvent(new Event('webglcontextlost',{cancelable:true})));await expect(p.locator('#fallback')).toBeVisible();await ctx.close();
});

test('hidden-tab lifecycle pauses the master timeline and resumes without duplicate motion',async({page})=>{
 await ready(page);await page.waitForTimeout(200);await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});document.dispatchEvent(new Event('visibilitychange'))});const s=await snapshot(page);await page.waitForTimeout(250);expect((await snapshot(page)).time).toBe(s.time);expect((await snapshot(page)).phase).toBe(s.phase);await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>false});document.dispatchEvent(new Event('visibilitychange'))});await page.waitForTimeout(150);expect((await snapshot(page)).time).toBeGreaterThan(s.time);
});

test('records actual frame intervals during the moving particle reconstruction',async({page})=>{
 await ready(page,true);await seek(page,14);await page.getByRole('button',{name:'Play',exact:true}).click();const result=await page.evaluate(()=>new Promise(resolve=>{const samples=[];let last=performance.now(),start=last;function tick(now){samples.push(now-last);last=now;if(now-start<1600)requestAnimationFrame(tick);else{const values=samples.slice(1).sort((a,b)=>a-b);resolve({frames:values.length,medianMs:values[Math.floor(values.length*.5)],p95Ms:values[Math.floor(values.length*.95)],over33ms:values.filter(v=>v>33.4).length})}}requestAnimationFrame(tick)}));
 fs.writeFileSync('evidence/sequence-performance.json',JSON.stringify({environment:'Local headless Microsoft Edge 1440x900; browser rAF intervals, not a GPU benchmark.',...result},null,2));expect(result.frames).toBeGreaterThan(0);
});

