/** Three closed portrait faces share one media source, with independently oriented crops. */
export const HELIX=Object.freeze({
 video:new URL('../public/assets/products/helix-organic.mp4',import.meta.url).href,
 poster:new URL('../public/assets/products/helix-video-poster.jpg',import.meta.url).href,
 ledMaterial:'LED.001',sourceAspect:16/9,brightness:.92,
 faces:[{id:'center',normal:[1,0,0],right:[0,0,-1],focal:[.5,.5]},{id:'right',normal:[-.5,0,.866025403784],right:[.866025403784,0,.5],focal:[.5,.5]},{id:'left',normal:[-.5,0,-.866025403784],right:[-.866025403784,0,.5],focal:[.5,.5]}],
 motion:{revealStart:.7,blendStart:.58,cycle:4.8,openDuration:1.95,stagger:.05,closeStart:2.5},
});
const ease=n=>{n=Math.max(0,Math.min(1,n));return n*n*n*(n*(n*6-15)+10)};
export function helixOpenAt(seconds,row){const t=((seconds%HELIX.motion.cycle)+HELIX.motion.cycle)%HELIX.motion.cycle,m=HELIX.motion;return ease((t-row*m.stagger)/m.openDuration)*(1-ease((t-m.closeStart-(5-row)*m.stagger)/m.openDuration))}
