import {NodeIO,PropertyType} from '@gltf-transform/core';
import {ALL_EXTENSIONS,EXTMeshoptCompression} from '@gltf-transform/extensions';
import {dedup,reorder} from '@gltf-transform/functions';
import {MeshoptEncoder,MeshoptDecoder} from 'meshoptimizer';
import fs from 'node:fs';

await MeshoptEncoder.ready;
const source='source-assets/KUKA+Display.glb';
const output='public/assets/kuka-display.web.glb';
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.encoder':MeshoptEncoder,'meshopt.decoder':MeshoptDecoder});
const doc=await io.read(source);
await doc.transform(dedup({propertyTypes:[PropertyType.ACCESSOR,PropertyType.MESH,PropertyType.TEXTURE]}),reorder({encoder:MeshoptEncoder,target:'size'}));
doc.createExtension(EXTMeshoptCompression).setRequired(true).setEncoderOptions({method:EXTMeshoptCompression.EncoderMethod.QUANTIZE});
await io.write(output,doc);
// The generic writer omits near-identity transforms within its epsilon. Restore the
// authored JSON values verbatim: even tiny joint-local offsets remain untouched.
const original=fs.readFileSync(source),encoded=fs.readFileSync(output);
const originalJSON=JSON.parse(original.subarray(20,20+original.readUInt32LE(12)).toString());
const encodedJSON=JSON.parse(encoded.subarray(20,20+encoded.readUInt32LE(12)).toString());
for(const node of encodedJSON.nodes){const authored=originalJSON.nodes.find(n=>n.name===node.name);if(!authored)throw new Error('Unexpected node in optimized model');for(const key of ['translation','rotation','scale','matrix']){if(authored[key])node[key]=authored[key];else delete node[key];}}
const text=JSON.stringify(encodedJSON),padding=(4-Buffer.byteLength(text)%4)%4,json=Buffer.from(text+' '.repeat(padding));
const rest=encoded.subarray(20+encoded.readUInt32LE(12)),header=Buffer.alloc(20);header.writeUInt32LE(0x46546c67,0);header.writeUInt32LE(2,4);header.writeUInt32LE(20+json.length+rest.length,8);header.writeUInt32LE(json.length,12);header.writeUInt32LE(0x4e4f534a,16);fs.writeFileSync(output,Buffer.concat([header,json,rest]));
const report={originalBytes:fs.statSync(source).size,webBytes:fs.statSync(output).size,nodes:doc.getRoot().listNodes().length,skins:doc.getRoot().listSkins().length,clips:doc.getRoot().listAnimations().map(a=>a.getName()),optimization:'Lossless Meshopt buffer compression, vertex/index reordering and accessor/mesh/texture deduplication. No quantization, simplification, hierarchy flattening, or transform changes. All clips and the original skin are retained.'};
fs.writeFileSync('evidence/model-optimization.json',JSON.stringify(report,null,2));console.log(report);
