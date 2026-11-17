const {test,expect}=require('@playwright/test'),approved=require('./fixtures/stories-approved-path.json');
async function ready(p){await p.goto('/?debug=1');await p.waitForFunction(()=>window.craftechDiagnostics?.().rigAnimation);if(!await p.evaluate(()=>craftechDiagnostics().hero))await p.locator('#skip').click();await p.waitForFunction(()=>!document.querySelector('#studio-sequence').hidden)}
async function at(p,t){await p.evaluate(t=>scrollTo({top:document.querySelector('#stories-section').getBoundingClientRect().top+scrollY+t*innerHeight,behavior:'instant'}),t);await p.waitForFunction(t=>Math.abs(storiesDiagnostics().scroll-t)<.01,t)}
async function travel(p,a,b){await at(p,a);return p.evaluate(async({a,b})=>{const top=document.querySelector('#stories-section').getBoundingClientRect().top+scrollY;let start;await new Promise(resolve=>{function tick(now){start??=now;const u=Math.min(1,(now-start)/650);scrollTo({top:top+(a+(b-a)*u)*innerHeight,behavior:'instant'});if(u<1)requestAnimationFrame(tick);else resolve()}requestAnimationFrame(tick)});return storiesDiagnostics()},{a,b})}
function poses(d){return d.layout.cards.map(c=>[c.x,c.y,c.z,c.yaw,c.pitch,c.roll,c.width,c.height,c.u])}
async function flat(p){await p.waitForFunction(()=>storiesDiagnostics().surface.cards.every(c=>c.bend===0&&c.flatness===0),{},{timeout:3500});return p.evaluate(()=>storiesDiagnostics())}

test('approved trajectory, spacing, lens and timing configuration remain unchanged',async()=>{const {layoutStoryOrbit}=await import('../src/stories-orbit.js'),{sampleStoryOrbit,STORY_COMPOSITION,STORY_ORBIT}=await import('../src/stories-config.js');expect(STORY_COMPOSITION).toEqual(approved.composition);expect(STORY_ORBIT).toEqual(approved.scroll);for(const t of [.3,1.52,2.27,2.72,3.77,4.5]){const layout=layoutStoryOrbit(1500,708,sampleStoryOrbit(t));for(const c of layout.cards){expect(c.width/c.height).toBeCloseTo(.8,8);expect(c.x).toBe((c.projectedCenter[0]-.5)*1500*(1-c.z/layout.perspective))}expect(layout.perspective).toBe(708*STORY_COMPOSITION.perspectiveRatio)}});

test('forward and reverse stops flatten actual geometry with unchanged poses and stable video UVs',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await ready(page);const saved=new Map();
 for(const [a,b]of [[.65,1.52],[1.52,2.72],[2.72,3.77],[3.77,2.72],[2.72,1.52]]){
  const moving=await travel(page,a,b);expect(Math.max(...moving.surface.cards.map(c=>c.bend))).toBeGreaterThan(.04);await page.waitForFunction(b=>Math.abs(storiesDiagnostics().scroll-b)<.01,b);
  const stopped=await page.evaluate(()=>storiesDiagnostics()),pose=poses(stopped),mesh=stopped.surface.cards.map(c=>[c.position,c.quaternion]);
  const samples=[];for(let i=0;i<6;i++){await page.waitForTimeout(100);samples.push(await page.evaluate(()=>storiesDiagnostics().surface.cards.map(c=>c.bend)))}
  for(let i=2;i<samples.length;i++)for(let j=0;j<4;j++)expect(samples[i][j]).toBeLessThanOrEqual(samples[i-1][j]+.0001);
  const rest=await flat(page);expect(poses(rest)).toEqual(pose);expect(rest.surface.cards.map(c=>[c.position,c.quaternion])).toEqual(mesh);
  if(saved.has(b))expect(poses(rest)).toEqual(saved.get(b));else saved.set(b,poses(rest));
  for(const c of rest.surface.cards){expect(c.flatness).toBe(0);expect(c.uvVersion).toBe(0)}
  for(let i=0;i<4;i++)if(stopped.media.videos[i].ready>=2)expect(rest.surface.cards[i].uvTransform).toEqual(stopped.surface.cards[i].uvTransform);
  const times=rest.media.videos.map(v=>v.time);await page.waitForTimeout(160);const idle=await page.evaluate(()=>storiesDiagnostics());expect(idle.media.videos.some((v,i)=>!v.paused&&v.time!==times[i])).toBeTruthy();
 }
 expect(errors).toEqual([]);
});

test('bend settles with films paused, resumes on reverse, and modal freezes the exact surfaces',async({page})=>{
 await ready(page);await at(page,1.52);await flat(page);await page.locator('.stories-pause').click();const moving=await travel(page,1.52,2.27);expect(moving.surface.cards.some(c=>c.bend>.04)).toBeTruthy();const paused=await flat(page);expect(paused.media.videos.every(v=>v.paused)).toBeTruthy();
 const reverse=await travel(page,2.27,1.52);expect(reverse.surface.cards.some(c=>c.bend>.04)).toBeTruthy();expect(reverse.surface.cards.some(c=>c.velocity[0]<0)).toBeTruthy();await page.locator('[data-story=infocomm] .story-open').click();const frozen=await page.evaluate(()=>storiesDiagnostics());await page.waitForTimeout(350);expect((await page.evaluate(()=>storiesDiagnostics())).surface.cards).toEqual(frozen.surface.cards);await page.keyboard.press('Escape');await flat(page);expect((await page.evaluate(()=>storiesDiagnostics())).media.videos.every(v=>v.paused)).toBeTruthy();
});

test('flat projected buttons retain matching hover/cursor/player actions on desktop and touch',async({page,browser})=>{
 await ready(page);for(const [i,t]of [1.52,2.27,3.02,3.77].entries()){await at(page,t);await flat(page);const open=page.locator('.story-card').nth(i).locator('.story-open');await open.hover();await expect(page.locator('.context-cursor')).toHaveAttribute('data-context','story-'+['infocomm','dell','elecrama','gafx'][i]);await open.click();await expect(page.locator('.story-player')).toBeVisible();await page.keyboard.press('Escape');await expect(open).toBeFocused()}
 const ctx=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true}),p=await ctx.newPage();await ready(p);await travel(p,1.52,2.72);await flat(p);await p.screenshot({path:'evidence/stories-velocity-bend/mobile-flat.png'});await p.locator('[data-story=elecrama] .story-open').tap();await expect(p.locator('.story-player')).toBeVisible();await p.getByRole('button',{name:'Close story',exact:true}).tap();await ctx.close();
});
