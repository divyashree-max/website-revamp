# Kinetic products — implementation and verification

## Scope
Added DNA, Orbit, Matrix and Helix after the six services. The existing intro, home video, crystalline C and service poses/media remain in place. The supplied services grid sits behind the robot at 0.3 element opacity; its intrinsic perspective and alpha are preserved. The desktop services placement moves down by 0.02 of the design-frame height, without changing scale, joints or the screen attachment.

## Reference and visual direction
Inspected 24 frames across the entire attached 11.52-second camera reference. It explores actual product details, changes viewing angle, then pulls back to a complete object. The implementation adapts this progression to the supplied geometry: DNA starts at its base/caster and rises along an edge; Orbit explores the layered rings; Matrix passes across the supplied array; Helix travels from the lower assembly toward the upper display structure. These paths and the restrained studio setup are implementation choices, not copies of reference branding or technical claims. The live zrk.technology reference was inaccessible. The established black, off-white, PolySans and amber identity is retained.

## Assets and fidelity
All four GLBs are byte-for-byte copies of the supplied files, verified with SHA-256. No geometry was regenerated, decimated, exploded or mechanically animated. Mesh local matrices are stored and checked unchanged. A single uniform normalization group allows camera framing without changing proportions. Materials keep their source colors; product exposure and emissive intensity are balanced for studio viewing.

Asset sizes: DNA 46.42 MB, Orbit 0.21 MB, Matrix 2.28 MB, Helix 26.50 MB. No embedded animation clips were found. DNA's default assembly has approximately 876k triangles and Helix approximately 562k; these remain the largest performance cost. Model counts and all source scene/hierarchy details are recorded in evidence/products-asset-inspection.json and browser diagnostics.

Important Matrix limitation: the GLB contains seven scenes. Scene 6 is the declared default array assembly. Holographic-fan components are in separate non-default studio scenes; they are not connected to the default array hierarchy. The website renders the exact supplied default assembly. It does not fabricate fan connections or replace the geometry with a procedural tile wall. A different intended Matrix assembly would need a confirmed scene/assembled source asset.

## Rendering and scroll ownership
- One product scene and camera reuse the existing main WebGL renderer. The existing fluid renderer/pointer state continues unchanged; no new cursor, fluid layer or WebGL context is created.
- One normalized native-scroll sample controls the active product, authored camera position/look target, copy reveal and chapter transitions. Reverse and direct jumps evaluate immediately, without queued animation.
- Each product occupies 2.25 viewport heights. The close/detail travel resolves by 70% of the chapter, leaving a stable complete view and reading interval. Helix remains readable through the final release.
- Services recede before the product scene takes over. Loading previews are concealed until that handoff; unrelated robot/product objects are not rendered together.
- The first product starts loading during the latter services chapters. The next model preloads after the current one is ready. At most two product assets are retained; other cached GPU resources are disposed. Only the active product is rendered. Offscreen and hidden-tab rendering follow the existing lifecycle.
- Products navigation now reaches the implemented section. Existing contextual cursor labels/actions remain intact.
- Product copy, paths, sources and previews are centralized in src/products-config.js. No new destination pages or claims were added.

## Mobile, reduced motion and fallback
Narrow-screen camera framing keeps complete objects above the copy and simplifies close travel. Reduced motion uses four assembled image previews in normal document flow, with no cinematic camera movement. Previews were captured from the exact models, not generated substitute artwork. Posters and semantic copy remain useful on loading failure or WebGL failure. Touch has no fluid decoration; keyboard/native scrolling remains available. All product assets are below-fold loads.

## Actual verification
- npm.cmd run build: passed.
- Full regression run: 48 of 49 tests passed initially. The remaining cursor test assumed Products remained a pending control; it was updated for the new real section destination. Final targeted product/cursor run: all 9 tests passed, including that test.
- Existing intro playback, clockwise screen roll, particle reconstruction, continuous LED/home video, C re-entry/hover, amber handoff, six services, mobile/reduced motion and fallbacks passed in the regression run.
- New checks: four exact sources/order/copy; unchanged mesh matrices; zero clips; distinct detail-to-full paths; full-product projected bounds; two-asset cache limit; deterministic reverse/fast jumps; resizing; readable final Helix; source grid opacity/stacking and stationary floor anchor; logo clearance across all six service poses; reduced-motion normal flow; failed-model fallback.
- Development and production browser passes at 1500px, 768px, 390px and 320px, including reduced motion: no captured console/asset errors or horizontal overflow. Actual screenshots inspected for desktop, phone and reduced-motion layouts.
- Existing services tests also confirm planted base, unchanged links, wrist attachment and text/display clearance through the travel corridor.
- Live in-app browser inspected the Products navigation, DNA detail and complete DNA view.
- Recorded all four reveals: evidence/kinetic-products-reveals.webm. Captured state: evidence/products-recording-checks.json. Contact sheet: evidence/robot-presentation-products-completed.jpg.

## Remaining limits
The supplied display surfaces are largely plain white; no invented product footage or mechanical motion was added. The Matrix alternate scenes require assembly clarification before any fan motion/installation can be represented. Large original meshes may cost more on low-end devices; pixel ratio is capped, rendering is shared and inactive assets do not render, but physical low-end hardware was not available for profiling. All six service Explore more destinations remain pending as before. immersive-web-design was not installed; available frontend, animation, Three.js camera and performance skills were applied. React-specific patterns are not applicable to this vanilla Three.js/GSAP runtime. No deployment was performed.
