# Current asset assessment — November 10, 2026

## Authoritative inputs inspected

- `C:/Users/CFT 02/Downloads/KUKA+Display.glb`: 87,737,220 bytes; 1,276,964 triangles; 98 nodes; one skin; separate Base, Armature hierarchy, Bone.001 through Bone.007, Kuka_LED_Led6x4 display node and Display.001 face material. The default scene is Scene (index 6); earlier named Holo Fan scenes are empty and are not rendered as extra objects.
- The supplied bicycle MP4 with the long Klickpin filename, copied to `evidence/reference/bicycle.mp4` for local analysis. Sequential frames were directly decoded, preserving its portrait aspect in `evidence/reference/bicycle-study.png`.
- `Dark studio void with amber perspective lines.png`: visual direction only, visible in the supplied attachment. No reference photograph is placed behind the model.
- `image03.png`: supplied gradient screenshot; exact stop/color pairs are reflected in config and inlay/particle accents.
- Original `E:/CFT/Craftech360_Logo White.png`: already retained byte-for-byte as public/assets/craftech360-logo.png. No substitute logo was generated.
- Existing located PolySans Neutral/Median files remain. No new Helvetica binaries or license metadata were supplied. System fallbacks are available.

## Clip inspection and runtime choice

Individually previewed ArmatureAction, ArmatureAction.001 and ArmatureAction.002 (about 61.708 seconds each), and ArmatureAction.004 (8.125 seconds), using isolated fresh model loads. Captures include start, midpoint, end/loop boundary and early-time samples. ArmatureAction.004 visibly changes the screen/arm pose. Evidence: evidence/reference/clip*.png and evidence/model-preview.json.

The current revision evaluates selected safe poses from ArmatureAction.004 for real base/shoulder/elbow articulation. It uses Bone004/005 for the held compact wrist preparation and continuous clockwise Bone006 local -Y roll through one rig owner. Raw low/face-down clip intervals are excluded. The other three clips are effectively static. Actual wrist axes and hierarchy were audited in evidence/wrist-axis-audit.json. All clips and the original skin remain in the compressed asset.

## Optimization

The untouched original is saved in source-assets. The optimized web file uses lossless Meshopt buffer compression and vertex/index reordering. It retains the triangle count, all 98 nodes, skin, clips, hierarchy and original local TRS values. No quantization, simplification or flattening. Final web size: 33,243,144 bytes. Original texture images, material separation and UV attributes remain intact. A continuous content surface just ahead of the tiled LED face prevents seams at the homepage handoff; original cabinet and source geometry remain.

The latest website recording (Screen Recording 2026-11-10 153431.mp4), TAGG9328 and TAGG9330 were decoded together with the available bicycle reference in evidence/reference-153431-study.png. The bicycle contributes motion direction only and is never included in runtime imagery. New surface/contour data is derived directly from the held GLB pose: 48,000 component-stratified surface samples, normals, local contour targets and 12,379 simplified crease/silhouette segments in a 2,025,096-byte version-2 binary. Its metadata records the original source hash and pose. These are geometry data, not a replacement model.

## Skills and scope

The custom immersive-web-design skill was searched for in the available local skill roots and is still unavailable. Applied available frontend-design, web-style-director, frontend-ui-engineering, animation-tool-router, design-motion-principles, GSAP performance and motion performance QA guidance. Awesome DESIGN.md and Product Design QA guidance previously read in this project support visual discipline and review. The local Edge browser was used to inspect the GLB, clips, footage and implementation; no unavailable tool is claimed as used.

No generated replacement robot, external model service, Adobe/Figma/Shopify integration or deployment was used. There is intentionally no brand-guideline Markdown dependency. Earlier storyboards and procedural robot references are historical and no longer control the revised concept.

The corrected revision samples the compact 0–0.32s interval of ArmatureAction.004. The original Cable mesh is rebound at runtime between the base and elbow anchors using its original vertices; no replacement connector is created. The latest supplied 15:34:31 recording and robot/bicycle videos were decoded in tools/reference-153431.html and reviewed in evidence/reference-153431-study.png. References supply motion and identity only.

Focused approved-sequence refinements use the newly available 16:12:40 recording. A6 aligns with the display normal to floating-point precision; the original rigid payload offset is centred by 3.9mm so its geometric display centre stays on the rotation shaft. Source arm pivots, link transforms, mesh dimensions and stored GLB files are unchanged. Depth-only source surfaces suppress hidden technical lines; metadata includes ordered line ranges.

Latest direct-reconstruction revision: drawing stage removed. Runtime data version 3 keeps the approved surface/dotted-feature positions and normals only (1,152,000 bytes), with no contour targets or line ranges loaded by the runtime. The original GLB is unchanged. The existing physical cabinet material gains restrained bezel reflections; a separate physical-panel luminance uniform fades to zero before the unchanged homepage handoff. Historical contour counts above describe superseded data.
