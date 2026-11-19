import * as T from 'three';
import {RectAreaLightUniformsLib} from 'three/addons/lights/RectAreaLightUniformsLib.js';
import {PRODUCTS} from './products-config.js';

// One shared studio, configured only on product changes. No render loop or media owner.
const PROFILES=[
 {key:9,rim:3.2,fill:.22,reflection:.72}, // DNA: broad bands across the chrome base
 {key:7.5,rim:3.5,fill:.18,reflection:.65}, // Orbit: preserve black pedestal and mirrored rings
 {key:9,rim:4,fill:.24,reflection:.72}, // Matrix: reveal the dark frame behind the panels
 {key:8.5,rim:3.5,fill:.22,reflection:.7}, // Helix: keep hinges readable in both poses
];
export function createProductStudio(scene){
 RectAreaLightUniformsLib.init();
 const key=new T.RectAreaLight(0xffffff,9,5,6),rim=new T.RectAreaLight(0xf1f4f6,3.2,2.5,5);
 const shadowKey=new T.DirectionalLight(0xffffff,1.15),fill=new T.HemisphereLight(0xdfe5eb,0x080808,.22);
 const amber=new T.RectAreaLight(0xf7a400,.3,1,3);
 key.name='Studio front-left softbox';rim.name='Studio rear-right strip';shadowKey.name='Studio aligned shadow key';
 fill.name='Studio minimal fill';amber.name='Studio restrained amber edge';
 scene.add(key,rim,shadowKey,shadowKey.target,fill,amber);
 let current=-1;
 const front=new T.Vector3(),right=new T.Vector3(),center=new T.Vector3(),up=new T.Vector3(0,1,0);
 return {shadowKey,update(asset,index){
  if(current===index)return;current=index;
  const p=PROFILES[index],size=asset.bounds.getSize(new T.Vector3()),scale=Math.max(size.x,size.y,size.z)/4.4;
  asset.bounds.getCenter(center);
  if(PRODUCTS[index].heroDirection)front.fromArray(PRODUCTS[index].heroDirection).applyQuaternion(asset.root.quaternion);
  else front.set(index===2?-.55:index===0?.55:.23,0,1);
  front.y=0;front.normalize();right.crossVectors(up,front).normalize();
  key.position.copy(center).addScaledVector(front,5.5*scale).addScaledVector(right,-4*scale).addScaledVector(up,6*scale);
  key.width=5*scale;key.height=6*scale;key.intensity=p.key;key.lookAt(center);
  shadowKey.position.copy(key.position);shadowKey.target.position.copy(center);
  rim.position.copy(center).addScaledVector(front,-4*scale).addScaledVector(right,4*scale).addScaledVector(up,3*scale);
  rim.width=2.5*scale;rim.height=5*scale;rim.intensity=p.rim;rim.lookAt(center);
  amber.position.copy(center).addScaledVector(front,-3*scale).addScaledVector(right,-3*scale).addScaledVector(up,2*scale);amber.lookAt(center);
  fill.intensity=p.fill;scene.environmentIntensity=p.reflection;
 },get diagnostics(){return {profile:current,key:key.position.toArray(),shadowKey:shadowKey.position.toArray(),rim:rim.position.toArray(),keyIntensity:key.intensity,rimIntensity:rim.intensity,fillIntensity:fill.intensity,environmentIntensity:scene.environmentIntensity}},dispose(){for(const o of [key,rim,shadowKey,shadowKey.target,fill,amber])o.removeFromParent()}};
}
