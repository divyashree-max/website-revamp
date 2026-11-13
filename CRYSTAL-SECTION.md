> Latest correction: closed glass facets, foreground C, continuous 3D motion, local triangle hover and an advected fluid sheet replace the earlier material/wake. See [C-CORRECTIONS.md](C-CORRECTIONS.md) for current behavior and verification; earlier implementation notes below are historical.

# Crystalline C section

## Implemented scope
One section follows the existing home stage. The supplied `Crystal_C_Model.glb` is copied byte-for-byte to `public/assets/crystal-c.glb` (SHA-256 `1CD9EEA743CEA3909A1FB3FAAC174BB0E372501E687A727795EA4069656B578E`). Its 18 meshes/180 triangles remain nine named rigid facet pairs. Reparenting around computed front-face centroids preserves the original world-space vertex positions. The source file is unchanged.

The existing header, CTA, navigation, exploration control and cursor are shared rather than duplicated. On this section the same logo element uses the supplied monochrome SVG, presented off-white through CSS because the original SVG artwork is black. The home retains its previous logo. The new section's CTA uses the four requested amber stops; the home styling is retained. The exploration control scrolls naturally to the C; its up-arrow state returns home at the end. No additional sections or destinations were invented. Existing pending demo/projects/products/contact/showreel actions remain pending.

## Reference observations versus implementation choices
- **Frame 63:** black negative space, a tall central C, upper-left WHERE/CREATIVITY, lower-right MEETS/ENGINEERING, off-white type and optical spectral edges. These determine the desktop composition; tablet and mobile use separate text placement and a width-safe camera.
- **Motion clip:** inspected 12 frames across the full 4.04 seconds. Coordinated groups turn, separate in organized bands and return to an assembled object. The cube/heart object is not used.
- **Our motion:** the nine supplied facet pairs rotate together, spread in a restrained fan with individual depth/angle offsets, then return exactly to stored transforms. A 9.6-second single GSAP timeline gives this C more readable pacing than the short reference. Timing, turn, spread, depth, rotation and stagger are in `src/crystal-config.js`. Spread is reduced automatically in narrow frames. After completion only reflected lighting changes subtly; replay is explicit.
- **[Lusion](https://lusion.co/):** an interaction-quality target from the brief, not a recovered implementation. Our localized fluid effect is original: twelve decaying wave impulses generate a spatial normal gradient that refracts a quiet underlying light field with separate spectral sample offsets. A short wake follows pointer motion and decays at rest. There is no blurred cursor halo, particle trail or distortion of HTML text.

## Glass and geometry audit
Normals are absent in the GLB. The front faces are wound inward. Runtime preparation computes normals and corrects winding without moving vertices. The source fronts and bevel shells have 54 boundary edges when audited together; their differently positioned front surfaces do not form watertight glass volumes.

Glass uses MeshPhysicalMaterial transmission, IOR 1.52, thickness 0.36, dispersion, controlled roughness, thin-film response and a PMREM environment made from hidden reflection cards. It does not use the source's baked iridescent image maps or low-opacity plastic. A narrow procedural optical-normal/caustic treatment at triangle edges augments the physical dispersion, without painting a rainbow across the interiors. The optical thickness is an approximation for the supplied open shells; this is not a physically exact, multi-bounce solid-glass ray tracer. That limitation remains most apparent at unusual edge/back angles.

## Architecture and performance
- `src/crystal-section.js`: lazy loading, visibility lifecycle and shared UI state.
- `src/crystal-experience.js`: one animation clock, render lifecycle, responsive camera and replay.
- `src/crystal-model.js`: exact facet grouping, normals, optical material and hidden reflection environment.
- `src/glass-field.js`: spatial wave-normal/refraction shader rendered to a reduced-resolution target.

The section loads after home readiness and near the viewport, without blocking the robot intro. Offscreen/hidden rendering and the timeline pause. Pixel ratio, transmission resolution and mobile spread are capped. Touch disables the fluid field; reduced motion shows the assembled C without the sequence or wake. Failure uses an SVG derived from the actual source front triangles, plus all readable HTML and shared controls. Timelines, observers, event listeners, targets and GPU resources are disposed on exit. No React or new runtime libraries were added. The named immersive-web-design skill was not available; the installed frontend, animation, motion and performance skills were used.

## Verification
Local Edge screenshots cover desktop, tablet, 390px and 320px layouts. Whole-sequence samples confirm rigid pairs throughout, actual spread, and zero final transform error. The wake decays from about 2.04 to 0.0016 over 1.8 seconds; offscreen frame counts stop. Dedicated tests cover replay, shared UI/cursor, continuous home video, hidden-tab suspension, touch, reduced motion, overflow and static fallback. Production build and existing intro/video/cursor regression checks are also run. Evidence remains under the ignored `evidence/` directory.

No deployment. Physical iOS/Android hardware and pixel-identical reference matching remain outside the verified scope.

Final results: the full regression run passed 28 cases and exposed two shared-UI integration defects. Those defects were fixed; all ten section/cursor cases then passed on the final implementation. The existing twenty robot/video scenarios passed in the regression run. The final production build and production browser smoke check passed with no page, console or resource errors, no development controls, 18 meshes/nine rigid facets and zero final transform error. The new section is open in the visible browser, with Replay C available.
