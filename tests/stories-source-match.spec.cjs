const {test,expect}=require('@playwright/test');
const ids=['infocomm','dell','elecrama','gafx'],times=[1.52,2.27,3.02,3.77];
async function ready(p){await p.goto('/?debug=1');await p.waitForFunction(()=>window.craftechDiagnostics?.().rigAnimation);if(!await p.evaluate(()=>craftechDiagnostics().hero))await p.locator('#skip').click();await p.waitForFunction(()=>!document.querySelector('#studio-sequence').hidden);await at(p,.1)}
async function at(p,t){await p.evaluate(t=>scrollTo({top:document.querySelector('#stories-section').getBoundingClientRect().top+scrollY+t*innerHeight,behavior:'instant'}),t);await p.waitForFunction(t=>Math.abs(storiesDiagnostics().scroll-t)<.01,t,{timeout:6000}).catch(async e=>{throw new Error(JSON.stringify({requested:t,actual:await p.evaluate(()=>({scroll:storiesDiagnostics().scroll,y:scrollY,modal:storiesDiagnostics().playerOpen,rect:document.querySelector("#stories-section").getBoundingClientRect().top,height:innerHeight,overflow:document.documentElement.style.overflow}))}))});return p.evaluate(()=>storiesDiagnostics())}
function arrangement(d){return d.layout.cards.map(c=>({u:c.u,x:c.x,y:c.y,z:c.z,yaw:c.yaw,pitch:c.pitch,roll:c.roll,bounds:c.bounds}))}
test('four equal physical 4:5 bowed surfaces, source neighbors, foreground crossing and continuous native travel',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await ready(page);
 expect(await page.locator('.story-card').count()).toBe(4);expect(await page.locator('.stories-surface').count()).toBe(1);
 const d=await at(page,2.27);expect(d.active).toBe('dell');expect(d.surface.rendererCount).toBe(1);
 for(const c of d.layout.cards){expect(c.width/c.height).toBeCloseTo(.8,6);expect(c.width).toBe(d.layout.cards[0].width)}
 // Approved source-derived trajectory centers remain unchanged; alignment moves along it.
 for(const [i,cx,cy] of [[0,.845,.337],[1,.605,.441],[2,.268,.625]]){
  const c=d.layout.cards[i],r=await page.locator('.story-card').nth(i).locator('.story-open').boundingBox();
  expect(Math.abs((r.x+r.width/2)/1440-cx)).toBeLessThan(.035);expect(Math.abs((r.y+r.height/2)/900-cy)).toBeLessThan(.035);
  expect(c.hitOutline.length).toBeGreaterThan(0);
 }
 const hit=await page.evaluate(()=>{const c=storiesDiagnostics().layout.cards[1],x=c.projectedCenter[0]*innerWidth,y=c.projectedCenter[1]*innerHeight;return document.elementFromPoint(x,y)?.closest('.story-card')?.dataset.story});expect(hit).toBe('dell');
 let prior;for(const t of [.1,.5,1.25,2.5,3.75,4.5,5.44]){const s=await at(page,t);if(prior)expect((s.distance-prior.distance)/(s.scroll-prior.scroll)).toBeCloseTo(1/3,5);prior=s}
 expect((await at(page,5.44)).layout.cards.every(c=>!c.hitOutline?.length)).toBeTruthy();expect(errors).toEqual([]);
});
test('forward reverse fast jumps, actual wheel/keyboard, selectors and resize preserve deterministic compositions',async({page})=>{
 await ready(page);const samples=[];for(const p of [0,.1,.25,.5,.75,.9,1]){const d=await at(page,p*5.44);samples.push(arrangement(d))}
 for(const p of [1,.9,.75,.5,.25,.1,0]){const d=await at(page,p*5.44);expect(arrangement(d)).toEqual(samples[[0,.1,.25,.5,.75,.9,1].indexOf(p)])}
 await at(page,2.27);const y=await page.evaluate(()=>scrollY);await page.mouse.move(1400,200);await page.mouse.wheel(0,180);await page.waitForFunction(y=>scrollY>y+100,y);await page.keyboard.press('PageUp');await page.waitForFunction(y=>scrollY<y,y);await page.evaluate(()=>new Promise(resolve=>{let last=scrollY,stable=0;function tick(){stable=scrollY===last?stable+1:0;last=scrollY;if(stable>=8)resolve();else requestAnimationFrame(tick)}requestAnimationFrame(tick)}));
 for(const [w,h]of [[1500,708],[1024,768],[768,900],[390,844],[320,667]]){await page.setViewportSize({width:w,height:h});for(let i=0;i<4;i++){const d=await at(page,times[i]);expect(d.active).toBe(ids[i]);expect(d.layout.cards[i].hitOutline.length).toBeGreaterThan(0);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy()}}
 await page.locator('.stories-project-menu summary').click();await page.locator('.stories-choices button').nth(1).click();await expect(page.locator('[data-story=dell] .story-open')).toBeFocused();expect((await page.evaluate(()=>storiesDiagnostics())).active).toBe('dell');
 await page.reload();await page.waitForFunction(()=>window.craftechDiagnostics?.().rigAnimation);if(!await page.evaluate(()=>craftechDiagnostics().hero))await page.locator('#skip').click();await page.waitForFunction(()=>!document.querySelector('#studio-sequence').hidden);await at(page,2.27);expect((await page.evaluate(()=>storiesDiagnostics())).active).toBe('dell');
});
test('each true hovered card has the approved cursor, name and correctly mapped muted story player',async({page})=>{
 await ready(page);const labels=['PLAY INFOCOMM STORY','PLAY DELL FORUM STORY','PLAY ELECRAMA STORY','PLAY GAFX STORY'];
 for(let i=0;i<4;i++){await at(page,times[i]);const card=page.locator('.story-card').nth(i),open=card.locator('.story-open');await open.hover();await expect(page.locator('.cursor-label.is-current')).toHaveText(labels[i]);await expect(card.locator('h3')).toHaveCSS('opacity','1');await open.click();await expect(page.locator('.story-player')).toBeVisible();await page.waitForFunction(()=>document.querySelector('.story-player video').readyState>=2);expect(await page.locator('.story-player video').evaluate((v,id)=>v.muted&&v.controls&&v.currentSrc.includes(id+'-installation'),ids[i])).toBeTruthy();expect((await page.evaluate(()=>storiesDiagnostics())).media.videos.every(v=>v.paused)).toBeTruthy();await page.keyboard.press('Escape');await expect(open).toBeFocused()}
 expect(await page.locator('.context-cursor').count()).toBe(1);
});
test('modal focus/audio/scroll lock and exact return preserve a deliberate prior pause',async({page})=>{
 await ready(page);await at(page,2.27);await page.locator('.stories-pause').click();const before=await page.evaluate(()=>({y:scrollY,d:storiesDiagnostics()}));const open=page.locator('[data-story=dell] .story-open');await open.focus();await page.keyboard.press('Enter');await page.locator('.story-sound').click();expect(await page.locator('.story-player video').evaluate(v=>v.muted)).toBeFalsy();
 for(let i=0;i<8;i++){await page.keyboard.press('Tab');expect(await page.evaluate(()=>!!document.activeElement.closest('.story-player'))).toBeTruthy()}
 await page.mouse.wheel(0,700);await page.waitForTimeout(100);expect(await page.evaluate(()=>scrollY)).toBe(before.y);expect(arrangement(await page.evaluate(()=>storiesDiagnostics()))).toEqual(arrangement(before.d));await page.keyboard.press('Escape');await expect(open).toBeFocused();expect(arrangement(await page.evaluate(()=>storiesDiagnostics()))).toEqual(arrangement(before.d));expect((await page.evaluate(()=>storiesDiagnostics())).media.videos.every(v=>v.paused)).toBeTruthy();await open.click();expect(await page.locator('.story-player video').evaluate(v=>v.muted)).toBeTruthy();await page.getByRole('button',{name:'Close story',exact:true}).click();await page.locator('.stories-pause').click();await page.waitForFunction(()=>!storiesDiagnostics().media.videos[1].paused);
});
test('idle video plays, trimmed loops and hidden/offscreen media pause without changing geometry',async({page})=>{
 await ready(page);for(let i=0;i<4;i++){const before=await at(page,times[i]);await page.waitForFunction(i=>storiesDiagnostics().media.videos[i].ready>=2&&!storiesDiagnostics().media.videos[i].paused,i);const v=page.locator('.story-card').nth(i).locator('video');expect(await v.evaluate(v=>v.duration)).toBeCloseTo([10.5,15.5,15,5][i],1);const t=await v.evaluate(v=>v.currentTime);await page.waitForTimeout(220);expect(await v.evaluate(v=>v.currentTime)).toBeGreaterThan(t);expect(arrangement(await page.evaluate(()=>storiesDiagnostics()))).toEqual(arrangement(before));await v.evaluate(v=>v.currentTime=v.duration-.12);await page.waitForFunction(i=>storiesDiagnostics().media.videos[i].time<1,i)}
 await at(page,5.49);expect((await page.evaluate(()=>storiesDiagnostics())).media.videos.every(v=>v.paused)).toBeTruthy();await at(page,2.27);await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});document.dispatchEvent(new Event('visibilitychange'))});await page.waitForTimeout(50);expect((await page.evaluate(()=>storiesDiagnostics())).media.videos.every(v=>v.paused)).toBeTruthy();
});
test('touch names and native activation; reduced-motion equivalents and blocked autoplay fallback',async({browser})=>{
 for(const reduced of [false,true]){const ctx=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true,reducedMotion:reduced?'reduce':'no-preference'}),p=await ctx.newPage();await ready(p);for(let i=0;i<4;i++){if(reduced)await p.locator('.story-card').nth(i).scrollIntoViewIfNeeded();else await at(p,times[i]);await expect(p.locator('.story-card').nth(i).locator('h3')).toHaveCSS('opacity','1');await p.locator('.story-card').nth(i).locator('.story-open').tap();await expect(p.locator('.story-player')).toBeVisible();await p.getByRole('button',{name:'Close story',exact:true}).tap()}
 if(reduced){expect(await p.locator('.stories-pin').evaluate(e=>getComputedStyle(e).position)).toBe('relative');expect((await p.evaluate(()=>storiesDiagnostics())).media.videos.every(v=>v.paused)).toBeTruthy()}await ctx.close()}
 const ctx=await browser.newContext(),p=await ctx.newPage();await p.addInitScript(()=>HTMLMediaElement.prototype.play=function(){return Promise.reject(new DOMException('Blocked','NotAllowedError'))});await ready(p);await at(p,1.52);await p.locator('[data-story=infocomm] .story-open').click();await expect(p.locator('.story-player-status')).toHaveText('Press Play to watch this story.');await p.keyboard.press('Escape');await ctx.close();
});




