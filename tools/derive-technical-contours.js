import * as T from 'three';

// Geometry-only bake: significant creases and simplified grazing-face boundaries, never wireframe.
export function deriveTechnicalContours(model){
 const segments=[],v=[new T.Vector3(),new T.Vector3(),new T.Vector3()],ab=new T.Vector3(),ac=new T.Vector3();
 const view=new T.Vector3(Math.sin(Math.PI/3),.06,Math.cos(Math.PI/3)).normalize();
 const hash=p=>[p.x,p.y,p.z].map(n=>Math.round(n*10000)).join(',');
 const seen=new Map();
 function add(a,b,kind,stage,category){
  if(a.distanceTo(b)<.003)return;
  const x=hash(a),y=hash(b),key=x<y?x+'|'+y:y+'|'+x;
  if(seen.has(key)){if(kind==='outer')segments[seen.get(key)].kind='outer';return;}seen.set(key,segments.length);
  segments.push({points:[...a.toArray(),...b.toArray()],kind,stage,category,order:(a.y+b.y)/2,length:a.distanceTo(b)});
 }
 function simplify(points){
  if(points.length<3)return points;
  const start=points[0],end=points.at(-1),line=new T.Line3(start,end),closest=new T.Vector3();let far=0,index=0;
  for(let i=1;i<points.length-1;i++){line.closestPointToPoint(points[i],true,closest);const d=closest.distanceTo(points[i]);if(d>far){far=d;index=i;}}
  if(far<.0025)return [start,end];
  const left=simplify(points.slice(0,index+1)),right=simplify(points.slice(index));return [...left.slice(0,-1),...right];
 }
 function traceChains(edges,stage,category){
  const vertices=new Map(),links=edges.map(([a,b])=>({a,b,used:false}));
  function link(p,e){const k=hash(p);if(!vertices.has(k))vertices.set(k,[]);vertices.get(k).push(e);}
  for(const e of links){link(e.a,e);link(e.b,e);}
  for(const first of links){
   if(first.used)continue;
   const degree=p=>vertices.get(hash(p)).length;
   let start=degree(first.a)!==2?first.a:degree(first.b)!==2?first.b:first.a,current=start,edge=first,points=[start];
   for(let guard=0;guard<=links.length;guard++){
    edge.used=true;const next=hash(edge.a)===hash(current)?edge.b:edge.a;points.push(next);current=next;
    const connected=vertices.get(hash(current));if(connected.length!==2||hash(current)===hash(start))break;
    edge=connected.find(e=>!e.used);if(!edge)break;
   }
   // Split closed loops before simplifying so their full circumference is retained.
   let paths=[points];if(hash(points[0])===hash(points.at(-1))&&points.length>4){const mid=Math.floor(points.length/2);paths=[points.slice(0,mid+1),points.slice(mid)];}
   for(const path of paths){const clean=simplify(path);for(let i=1;i<clean.length;i++)add(clean[i-1],clean[i],'outer',stage,category);}
  }
 }
 for(const mesh of model.meshes){
  if(!/^(Cube20[3456]|Circle006|Circle012|Link1|Circle002|Kuka_LED_Mid001)(_[12])?$/.test(mesh.name))continue;
  let node=mesh,bone=null;while(node){if(/^Bone\d+$/.test(node.name)){bone=node.name;break;}node=node.parent;}
  const stage=bone==='Bone001'?1:bone==='Bone002'||bone==='Bone003'?2:bone?3:0;
  const category=stage===0||stage===1?'base':stage===2?(bone==='Bone002'?'upper':'forearm'):'wrist';
  const g=mesh.geometry,index=g.index,crease=new T.EdgesGeometry(g,42),positions=crease.attributes.position;
  const a=new T.Vector3(),b=new T.Vector3();
  // Internal detail remains subordinate, and excludes screws, rails and short tessellation edges.
  for(let i=0;i<positions.count;i+=2){a.fromBufferAttribute(positions,i).applyMatrix4(mesh.matrixWorld);b.fromBufferAttribute(positions,i+1).applyMatrix4(mesh.matrixWorld);if(a.distanceTo(b)>.025)add(a,b,'inner',stage,category);}
  crease.dispose();
  const map=new Map(),outline=[];
  for(let i=0;i<(index?.count||g.attributes.position.count);i+=3){
   const keys=[];for(let j=0;j<3;j++){mesh.getVertexPosition(index?index.getX(i+j):i+j,v[j]).applyMatrix4(mesh.matrixWorld);keys.push(hash(v[j]));}
   const sign=ab.subVectors(v[1],v[0]).cross(ac.subVectors(v[2],v[0])).dot(view)>=0;
   for(let j=0;j<3;j++){const k=(j+1)%3;if(keys[j]===keys[k])continue;const key=keys[j]<keys[k]?keys[j]+'|'+keys[k]:keys[k]+'|'+keys[j],previous=map.get(key);
    if(!previous)map.set(key,{sign,a:v[j].clone(),b:v[k].clone(),used:false});
    else if(previous.sign!==sign&&!previous.used){previous.used=true;outline.push([previous.a,previous.b]);}
   }
  }
  traceChains(outline,stage,category);
 }
 // The cabinet's actual outer bounds provide a precise display rectangle; no tiled back rails.
 const cabinet=model.face.parent,box=new T.Box3();cabinet.traverse(o=>{if(o.isMesh){o.geometry.computeBoundingBox();box.union(o.geometry.boundingBox.clone().applyMatrix4(o.matrix));}});
 const corners=[];for(const x of [box.min.x,box.max.x])for(const y of [box.min.y,box.max.y])for(const z of [box.min.z,box.max.z])corners.push(new T.Vector3(x,y,z).applyMatrix4(cabinet.matrixWorld));
 for(let i=0;i<8;i++)for(const mask of [1,2,4]){const j=i^mask;if(j>i)add(corners[i],corners[j],'outer',4,'screen');}
 segments.sort((a,b)=>a.stage-b.stage||a.kind.localeCompare(b.kind)||a.order-b.order);
 const ranges=[];for(let i=0;i<segments.length;){const first=segments[i];let end=i+1;while(end<segments.length&&segments[end].stage===first.stage&&segments[end].kind===first.kind)end++;ranges.push({stage:first.stage,kind:first.kind,start:i*6,count:(end-i)*6});i=end;}
 return {segments,ranges,traceOrder:['base','shoulder','arm','wrist','screen']};
}
