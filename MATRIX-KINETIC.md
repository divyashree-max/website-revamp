# Matrix kinetic display

Matrix-only runtime changes preserve the supplied GLB, existing camera shots, chapter copy and shared UI. DNA, Orbit and Helix configurations and mechanics are unchanged. Publication uses the existing GitHub Pages workflow on main.

## Reference evidence and model inspection

The complete 20.03-second Matrix Kinetic reference was inspected as a 30-frame sequence. Observed motion is vertical carriage travel in fixed columns: staggered column waves, expanded rows, middle-row offset patterns and returns to a compact aligned grid. Its relief artwork, room, plants, pots and captions are not reproduced.

The supplied Matrix GLB does contain eighteen rectangular LED faces: Box12756.018 through .035, each paired with its corresponding Box12754 rear housing. Each face has exactly two triangles normal to source +X. Runtime groups each front/edge/housing pair into one rigid carriage while preserving the original world appearance (maximum measured reparenting error 2.37e-10). The GLB file hash remains identical to the supplied Matrix - 6 x 3.glb. No display geometry or video planes were added.

There are also two coincident holographic-fan assemblies outside the wall array, plus empty controller nodes. These remain in their original hierarchy with their original geometry, circular display shape, materials and transforms; they are not substituted for the eighteen rectangular panels or assigned the array footage. They are occluded by the existing backing in the main front view.

The single BASE-OF-MATRIX mesh includes the backing shell and recessed guide channels. Eighty outer/front shell triangles receive a dark silver physically based metallic material; 130 channel/interior triangles retain their original material. Panel frames, housings and other materials remain unchanged. A private hidden studio reflection environment serves only this wall material (metalness 1, roughness .14, no emission). It does not brighten the visible black background.

## Motion and coordinates

src/matrix-config.js centralizes the six-column/top-to-bottom order, paired node names, video, overall crop, travel limits, timing and authored key patterns. Twenty-second periodic quintic interpolation gives zero-velocity joins and exact assembled positions at each complete cycle. All transforms are absolute from stored rest positions: source Y translation only, with fixed source X/Z, orientation and scale.

The reference informs the choreography; the exact timings and travel distances are an authored adaptation constrained to the supplied model rather than measured actuator specifications. Runtime validates the complete cycle against panel order, at least 4mm panel clearance and 40mm backing boundaries. The sampled motion stays within these limits. No motor/rail extension geometry or lateral/rotating motion was invented.

The existing camera reveal ends at chapter progress .70. The independent elapsed-time carriage clock begins immediately there and continues while scrolling is idle. Reverse travel blends the motion out before close views; leaving the chapter pauses media and resets hidden carriages. Re-entry starts a clean coordinated cycle. The existing offscreen/hidden-tab lifecycle pauses unnecessary work. Reduced motion uses the aligned mapped poster without video autoplay or carriage motion.

## Video and mapping

Original assets-originals/matrix-spheres.mov retained locally: 434,195,956 bytes, 1920x1080, 25fps, 12 seconds, ProRes 4444. It is excluded from the public browser assets and Git upload by the existing assets-originals ignore rule.

Compared 720p CRF22 (6,181,077 bytes) and 1080p CRF23 (10,556,075 bytes), inspecting sphere motion, iridescent edges and dark gradients. The selected final derivative is encoded directly from the original in a single lossy pass: public/assets/products/matrix-spheres.mp4, 5,993,644 bytes (5.99 MB), 1280x720, 25fps, H.264/yuv420p, no audio, BT.709, fast-start metadata. Source start/end frames differ; a restrained .4-second overlap dissolve produces an 11.6-second derivative. The original is not claimed to be seamless.

One muted inline looping video and one VideoTexture drive the eighteen actual LED primitives. Geometry-derived reference coordinates provide a single 2.586:1 array composition, with a centered cover crop of the 16:9 source (horizontal span 1, vertical span .687447). Physical gaps remain gaps. Each local UV region is fixed before carriage motion, so it cannot slide with changing world positions. Brightness is controlled independently of studio lighting; source colors are retained.

The temporary numbered pattern verified upright 1-6 / 7-12 / 13-18 ordering and orientation on the actual array. It is disabled in the final output; there is no diagnostic overlay or development label in normal viewing.

## Verification and artifacts

- 18 automated checks passed across Matrix, DNA, Orbit and existing product behavior. Matrix checks cover exact pair attachment, one player/texture, crop/order, preserved wall channels, vertical-only motion, collision boundaries, cycle continuity, exact rest return, immediate idle animation, unchanged camera, UV stability, video continuity, exit/re-entry, hidden tab, autoplay failure and reduced motion.
- Production browser checks at 1500, 768, 390 and 320px, including reduced motion: all four products load; no failed assets, console errors or horizontal overflow.
- Production build passes. Only existing rendering infrastructure is used; no new rendering context, runtime dependency or animation library was added.
- evidence/matrix-numbered-uv.png confirms numbered UV orientation.
- evidence/matrix-kinetic-video.mp4 shows the reveal completion, immediate kinetic start, waves, expanded rows, stagger, full reassembly and continued idle movement. Original raw capture and sampled motion/video diagnostics are retained locally.
- evidence/matrix-first-checks.json and matrix-kinetic-checks.json capture stable housing attachment, stationary backing, vertical-only poses, fixed UVs and playback across a wrap.
- evidence/matrix-final-loop-checks.json records playback readiness and decoded frames across the final derivative's loop boundary.

Limitations: timings are reference-led rather than factory calibrated. The backing uses authored studio reflections rather than real-time reflections of the moving video panels. The source's slight panel-row offsets and its extra fan assemblies are preserved rather than repaired or replaced.
