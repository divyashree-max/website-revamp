const {test,expect}=require('@playwright/test');

test('straightening moves along the approved path without the rejected horizontal recentering curve',async()=>{
 const {compositionAt,layoutStoryOrbit,storyFocalU}=await import('../src/stories-orbit.js');
 const {STORY_COMPOSITION,sampleStoryOrbit}=await import('../src/stories-config.js');
 const focal=storyFocalU();
 expect(focal).toBeLessThan(.5);
 for(const u of [.25,focal,.5,.625,.75]){
  const layout=layoutStoryOrbit(1500,708,{...sampleStoryOrbit(0),distance:u}),card=layout.cards[0];
  const [cx,,depth]=compositionAt(STORY_COMPOSITION.keyframes,u);
  expect(card.x).toBe((cx-.5)*1500*(1-depth));
  if(u===focal){expect([card.yaw,card.pitch,card.roll]).toEqual([0,0,0]);expect(cx).toBeCloseTo(.5,10)}
  if(u===.5)expect(cx).toBe(.605);
 }
});
