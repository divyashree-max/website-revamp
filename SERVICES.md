# Services showcase — implementation and verification

Implemented on 12 November 2026 in the existing vanilla Three.js/GSAP website. No dependencies were added and nothing was deployed.

## Composition and shared rendering
The supplied layout sets the composition: a side-profile KUKA at left, its real square display facing forward, and service copy at right on black. The original font, logo, amber CTA and single shared navigation/cursor remain. Mobile uses the robot/display above natural-flow service articles; the same navigation becomes a compact horizontal row to avoid obscuring service text.

A single bounded sticky optical stage now spans the C and services. It reuses the existing C model, main renderer, fluid renderer, fluid buffers and pointer state. No second C or fluid layer crossfades into view. The robot is another instance of the existing KUKA GLB inside the C renderer; the opening intro retains its own approved scene and replay behavior.

Native scroll position drives C travel, scale, display arrival, chapter selection and HTML transitions. The assembled C moves into the physical display, briefly settles there, then shrinks as the first procedural visual appears. The same transform calculation reverses naturally. If visitors scroll before the C entrance finishes, its facet transforms converge into assembly during the first part of the scroll transition. Returning from services defers the C entrance replay until spatial travel has nearly completed, avoiding competing timelines near the boundary.

The sticky optical stage is bounded by its containing block. Its overlap is on the ordinary content spacer, not the sticky element; this prevents an extra viewport of stale canvas after release. No wheel, touch or keyboard input is intercepted. The showcase is currently the final page content; a temporary following footer in the test harness verified actual sticky release.

## Source robot and articulation
The original GLB hierarchy and four embedded clips were inspected. The original seven-bone hierarchy, authored joint offsets, mesh proportions, materials and source hose are reused. The stage applies a fixed side-profile presentation yaw, not an animated whole-robot turn. Shoulder/elbow rotations remain small; the three existing wrist rotary axes are solved together so display normal stays along camera Z and display up remains Y. The screen and real mount remain descendants of the wrist. The original two-anchor cable deformation is reused; no connector mesh was added. Geometry and source files were not modified.

The base placement is fixed. Only joint rotations change. Measured screen-normal Z remained greater than .9999, screen-up Y greater than .9999, all local bone positions/scales stayed unchanged and base anchoring remained exact across all six chapters. The screen keeps its actual approximately 1:1 proportions. Robot-only studio lighting and an environment map reveal the original dark materials without changing the C lighting or adding a floor/podium.

## Content and replaceable media
`src/services-config.js` owns the exact six titles/descriptions, their order, media type, source, renderer, poster and destination. All Explore more destinations are explicitly null: no finished service routes were available. Buttons announce this dependency on activation rather than navigating to dead or invented pages.

The six canvas illustrations are temporary service concepts, not claims about completed projects:
1. Kinetic: a coordinated moving matrix of display modules.
2. Interactive: a pointer-responsive field of sensors/nodes.
3. Immersive: a perspective light-space corridor.
4. Robotics: coordinated articulated mechanisms and conveyor elements.
5. AI: a continuously evolving parametric composition.
6. Development: a connected modular hardware/software network with signal pulses.

Only the active illustration renders, with per-chapter elapsed time. Video players pause when inactive, offscreen, hidden, or returning to C. Changing a media entry to image/video with a source retains the same scroll choreography; cover cropping preserves proportions on the physical square LED. Poster/fallback entries can be supplied with real media; procedural entries have a still frame at time zero. Reduced motion freezes procedural movement and arm motion and replaces cinematic travel with immediate state changes. Touch disables pointer decoration through the existing quality fallback.

## Files
- src/services-config.js: exact content and replacement media/destination configuration.
- src/services-stage.js: semantic HTML, native scroll state and text choreography.
- src/services-robot.js: exact KUKA import, fixed placement, wrist compensation, ambient joints and lighting.
- src/services-media.js: six lightweight visuals and image/video support.
- src/crystal-experience.js and src/crystal-section.js: shared scene/lifecycle and reversible C handoff.
- src/crystal-backdrop.js: fades the optical headline image along with the real heading, preventing stale words inside the travelling glass.
- index.html, src/style.css and src/cursor.js: joined sticky structure, responsive composition and the existing cursor's region coverage.

## Checks actually performed
40 scenarios were verified across the full regression run and a focused mobile timing rerun. The complete run passed 39 and found one test that asserted replay before smooth scrolling had reached the 50% entry threshold. The test helper now waits for actual entrance start (or reduced motion); its focused rerun passed. Other coverage includes all prior intro, particle, LED/home video continuity, loop, skip/replay, cursor and C interactions.

Five services scenarios passed: six ordered/synchronized chapters, source joint invariants and front-facing display, C travel/reversal with continuous fluid state, native PageDown scrolling, finite sticky release, hidden-tab suspension, mobile natural flow, reduced motion, destination feedback, and image/video replacement with inactive players paused.

`npm.cmd run build` passed. Production Edge checks at 1500, 768, 390 and 320 pixels passed with no page, console or asset errors, no horizontal overflow, a decoded shared logo, one header/navigation/cursor and anchored source joints. Desktop and mobile screenshots and actual motion were inspected. The in-app browser also showed the final services composition and continuing fluid effect.

`evidence/services-scroll.webm` records forward travel through all six chapters, pointer movement, and reverse travel back into C. `evidence/services-final-0.png` through `services-final-5.png`, `services-final-handoff.png` and `services-final-reverse.png` show key states. `services-final.json` has the recorded transforms, monotonically increasing shared fluid step counts, all six ordered indices, rigid-joint checks and an empty error list. `services-production.json` contains production responsive results.

## Skills and remaining limits
Read the available Animation Tool Router, Design Motion Principles, Frontend UI Engineering, GSAP Performance and Motion Performance QA instructions, plus relevant Three.js procedural animation and Blender core/scene/animation instructions for hierarchy and pivot handling. The personal immersive-web-design skill remains unavailable. React Motion is not applicable to the actual vanilla Three.js/GSAP implementation. Blender preparation was unnecessary: the existing mechanical hierarchy was retained at runtime.

The visuals are procedural placeholders and all six Explore more destinations still need real routes. Existing missing showreel/demo/navigation destinations remain unchanged. The approved fluid and glass remain bounded real-time approximations of the supplied reference. Physical mobile hardware and screen-reader software were not tested. No new below-services page content was invented.

## Amber-glass handoff refinement — 13 November 2026
The same C remains chromatic at the start of travel. A shared optical uniform eases from zero to one between 42% and 78% of the existing transition scroll progress. Both front and bevel materials receive it. It changes wavelength-dependent absorption and hidden optical-card highlights using the linear-color equivalents of #FCCC00, #F7A504, #D66F20 and #994F2A; transmission, geometry, refraction, internal reflections and polished surfaces remain active. A miniature reflection probe keeps the C's faces readable inside the LED without adding emission, metallic shading or another model.

Position/scale finish settling at 80% progress. The assembled amber C holds through 94%, then shrinks into the Kinetic visual from 94% to 100%. These are scroll intervals, not forced time delays: visitors can scroll freely in either direction. The same uniform/transform evaluation restores chromatic glass on reverse travel. The fluid layer, robot rig and six services are unchanged.

Verification: all six services scenarios and three existing C geometry/layering/hover scenarios passed; the two handoff/reverse cases passed again after the final reflection adjustment. The production build passed. The recorded forward/reverse capture returned no console/page errors and showed tint amounts 0 → .5 → 1 → .5 → 0, identical held position/scale, transmission=1, and continuously increasing fluid steps. See evidence/amber-c-handoff.webm, amber-c-amber.png, amber-c-restored.png and amber-c-handoff.json. This remains the existing bounded real-time glass approximation; no deployment was performed.

Latest update: services now use six distinct articulated robot poses, authored text compositions and continuously blended LED media. See ROBOT-SERVICES.md for the current implementation, reference observations, recording, verification and limitations; the original stationary-stage notes below are historical.
