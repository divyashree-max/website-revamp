/** Orbit-only mechanical and optical contract, in the supplied model's metre world frame. */
export const ORBIT=Object.freeze({
 video:new URL('../public/assets/products/orbit-golden.mp4',import.meta.url).href,
 poster:new URL('../public/assets/products/orbit-video-poster.jpg',import.meta.url).href,
 sourceAspect:16/9,brightness:.9,seamFeather:.025,
 motion:{revealStart:.7,blendStart:.58,startup:.12,cycle:16},
 rings:[
  {id:'outer',node:'Gyro ring_outter.001',center:[0,2.4603857,-.000011448353689],axis:[0,1,0],turns:1},
  {id:'middle',node:'Gyro ring_Middle.001',center:[-.00000160909824,2.460385657115,-.00000257074434],axis:[1,0,0],turns:1},
  {id:'inner',node:'Gyro ring_Inner.003',center:[-.000000104638986,2.460386267467,.000358275360134],axis:[0,1,0],turns:-2},
 ],
 centerDisplay:'Gyro ring_Inner.002',base:'Gyro ring_Base.001',
 materials:{band:'LED.001',center:'LED-1.001',mirrors:['Ac_1.001','Ac_2.002'],bearing:'M2'},
 mirror:{color:0xe1e4e8,roughness:.065,metalness:1,envMapIntensity:1.1},
});
export const orbitAnglesAt=seconds=>ORBIT.rings.map(r=>seconds*Math.PI*2/ORBIT.motion.cycle*r.turns);
