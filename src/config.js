export const CONFIG=Object.freeze({
 colors:{black:0x080809,amber:0xf7a504,yellow:0xfccc00,copper:0xd66f20,brown:0x994f2a,ivory:0xeee6d4},
 gradient:[{stop:0,color:0xfccc00},{stop:.35,color:0xf7a504},{stop:.73,color:0xd66f20},{stop:1,color:0x994f2a}],
 model:new URL('../public/assets/kuka-display.web.glb',import.meta.url).href,
 logo:new URL('../public/assets/craftech360-logo.png',import.meta.url).href,
 timing:{opening:0,fullReveal:2.8,armPerformance:4,screenRotation:6,rotationEnd:11.2,dissolve:11.5,swarm:14,gather:15.5,particleRobot:18,solidRestore:19,frontalSettle:21,brandHold:23,enterScreen:24,hero:27.5,total:27.5},
 playbackRate:1.225,
 camera:{fov:38},particles:{desktop:36000,mobile:14000},
});

