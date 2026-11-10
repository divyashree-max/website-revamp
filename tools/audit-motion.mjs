import {NodeIO} from '@gltf-transform/core';
import {ALL_EXTENSIONS} from '@gltf-transform/extensions';
import * as T from 'three';
import fs from 'node:fs';
const doc=await new NodeIO().registerExtensions(ALL_EXTENSIONS).read('source-assets/KUKA+Display.glb'),report=[];
for(const clip of doc.getRoot().listAnimations()){
 const channels=[];
 for(const channel of clip.listChannels()){
  if(channel.getTargetPath()!=='rotation')continue;
  const sampler=channel.getSampler(),times=sampler.getInput().getArray(),values=sampler.getOutput().getArray(),base=new T.Quaternion().fromArray(values,0);let largest=0,axis=null;
  for(let i=0;i<times.length;i++){const q=new T.Quaternion().fromArray(values,i*4),delta=base.clone().invert().multiply(q);const angle=2*Math.acos(Math.min(1,Math.abs(delta.w)));if(angle>largest){largest=angle;axis=[delta.x,delta.y,delta.z].map(v=>+v.toFixed(3));}}
  channels.push({node:channel.getTargetNode().getName(),sweepDegrees:+T.MathUtils.radToDeg(largest).toFixed(2),deltaAxis:axis});
 }
 report.push({clip:clip.getName(),channels});
}
fs.writeFileSync('evidence/embedded-motion-audit.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
