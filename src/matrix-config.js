/** Matrix source-space order: front-view columns left to right, each top to bottom. */
export const MATRIX=Object.freeze({
 video:new URL('../public/assets/products/matrix-spheres.mp4',import.meta.url).href,
 poster:new URL('../public/assets/products/matrix-video-poster.jpg',import.meta.url).href,
 columns:[['030','024','018'],['033','027','021'],['031','025','019'],['034','028','022'],['032','026','020'],['035','029','023']],
 panelPrefix:'Box12756.',housingPrefix:'Box12754.',wall:'BASE-OF-MATRIX',displayMaterial:'led_screen',frameMaterial:'led_screen_edge',
 crop:{sourceAspect:16/9,focal:[.5,.5]},brightness:.86,
 motion:{revealStart:.7,blendStart:.58,cycle:20,clearance:.004,wallInset:.04},
 // Common carriage travel, outward row separation and weaker middle-row stagger.
 keys:[
  {at:0,common:[0,0,0,0,0,0],spread:0,bias:[0,0,0,0,0,0]},
  {at:2.8,common:[-.25,-.06,.16,.30,.12,-.15],spread:.025,bias:[0,0,0,0,0,0]},
  {at:5.4,common:[0,0,0,0,0,0],spread:.32,bias:[0,0,0,0,0,0]},
  {at:8,common:[0,0,0,0,0,0],spread:.32,bias:[.15,.09,.03,-.03,-.09,-.15]},
  {at:10.6,common:[0,0,0,0,0,0],spread:.32,bias:[-.15,-.09,-.03,.03,.09,.15]},
  {at:13,common:[-.18,.05,.30,.30,.05,-.18],spread:.04,bias:[0,0,0,0,0,0]},
  {at:16.2,common:[.12,.27,.10,-.10,-.27,-.12],spread:.04,bias:[0,0,0,0,0,0]},
  {at:20,common:[0,0,0,0,0,0],spread:0,bias:[0,0,0,0,0,0]},
 ],
 wallMaterial:{color:0x747980,metalness:1,roughness:.14,envMapIntensity:1.05},
});
export function matrixOffsetsAt(seconds){
 const t=((seconds%MATRIX.motion.cycle)+MATRIX.motion.cycle)%MATRIX.motion.cycle;let i=MATRIX.keys.findIndex((k,i)=>i<MATRIX.keys.length-1&&t<MATRIX.keys[i+1].at);if(i<0)i=0;
 const a=MATRIX.keys[i],b=MATRIX.keys[i+1],p=(t-a.at)/(b.at-a.at),u=p*p*p*(p*(p*6-15)+10),lerp=(x,y)=>x+(y-x)*u;
 return MATRIX.columns.flatMap((column,c)=>column.map((_,r)=>lerp(a.common[c],b.common[c])+(r===0?1:r===2?-1:0)*lerp(a.spread,b.spread)+(r===1?lerp(a.bias[c],b.bias[c]):0)));
}
