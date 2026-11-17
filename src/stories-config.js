const asset = name => new URL(`../public/assets/stories/${name}`, import.meta.url).href;
export const STORIES = [
 {id:'infocomm',title:'InfoComm India',description:'Kinetic displays and interactive technology brought our experiential capabilities into one showcase.',source:asset('infocomm-installation.mp4'),poster:asset('infocomm-installation.jpg'),trimStart:13,trimEnd:23.5,focalPoint:'50% 50%'},
 {id:'dell',title:'Dell Forum',description:'Interactive installations connected audiences with technology and sustainability.',source:asset('dell-installation.mp4'),poster:asset('dell-installation.jpg'),trimStart:28,trimEnd:43.5,focalPoint:'52% 50%'},
 {id:'elecrama',title:'ELECRAMA — Raychem RPG, Aspha & Delta',description:'Product storytelling and interactive experiences brought three brands to life.',source:asset('elecrama-installation.mp4'),poster:asset('elecrama-installation.jpg'),trimStart:16,trimEnd:31,focalPoint:'50% 45%'},
 {id:'gafx',title:'GAFX',description:'Kinetic displays turned digital content into a moving physical showcase.',source:asset('gafx-installation.mp4'),poster:asset('gafx-installation.jpg'),trimStart:12.5,trimEnd:17.5,focalPoint:'50% 50%'},
].map(story=>({...story,fit:'cover',cursor:'story-'+story.id,destination:null,mediaStatus:'verified'}));
// Consecutive blue-card observations, cross-checked against flower/chicken neighbors.
// Depth/angles are fitted; they are not a claim about the original site's mechanism.
export const STORY_COMPOSITION=Object.freeze({
 ratio:.8,perspectiveRatio:1.98,bend:.9,
 desktop:{height:.46,maxHeight:430},wide:{height:.46,maxHeight:430},tablet:{height:.43,maxHeight:390},mobile:{height:.27,maxHeight:230},
 // path coordinate, projected center x/y, depth/lens distance, yaw, pitch, roll
 keyframes:[[-.10,.12,.75,-.24,-109,0,0],[0,.124,.735,-.22,-87,0,0],[.08,.137,.72,-.18,-65,1,-1],[.16,.188,.67,-.10,-48,2,-3],[.25,.268,.625,-.025,-34,3,-5],[.375,.425,.54,.055,-20,3,-7],[.50,.605,.441,.08,-7,3,-8],[.625,.75,.379,.025,24,3,-6],[.75,.845,.337,-.075,49,2,-2],[.875,.86,.30,-.16,68,1,0],[1,.865,.28,-.23,92,0,1],[1.10,.865,.27,-.25,113,0,1]]
});
export const STORY_ORBIT=Object.freeze({stageViewports:6.50,releaseTail:.05,headlineHold:.02,enterEnd:1.52,chapterViewport:.75,exitStart:3.77,exitEnd:5.44,spacing:.25,focus:.50});
export const clamp=n=>Math.max(0,Math.min(1,n));
export const smooth=n=>{n=clamp(n);return n*n*(3-2*n)};
export function sampleStoryOrbit(scroll){
 const c=STORY_ORBIT,distance=(scroll-c.enterEnd)*c.spacing/c.chapterViewport+c.focus;
 return {scroll,entrance:clamp((scroll-c.headlineHold)/(c.enterEnd-c.headlineHold)),exit:clamp((scroll-c.exitStart)/(c.exitEnd-c.exitStart)),distance,headline:1,lineReveal:[smooth((scroll+.75)/.38),smooth((scroll+.64)/.40)]};
}



