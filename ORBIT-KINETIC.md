# Orbit kinetic display update

Orbit-only runtime changes; the existing camera reveal, DNA mechanics/materials, Matrix, Helix, shared UI and fluid background are preserved.

## Reference and geometry

Inspected the complete 16.7-second Comp-1 recording as a frame sequence. It shows narrow curved content bands, broad reflective annular surfaces, a circular central display, and a black pedestal. Rotation changes the relative ring planes and periodically brings them back toward a concentric view. The runtime uses the supplied Orbit GLB without replacing or scaling its components independently.

The authored adaptation uses a 16-second nested cycle: outer Y +1 turn, middle X +1 turn, inner local Y -2 turns. These rates and phases are visually adapted from the reference, not measured actuator specifications. The central display follows the inner assembly; no additional unverified motor is introduced. Explicit mechanical centers are necessary because the outer ring is truncated at its pedestal connection and its bounding-box center is incorrect. Original mesh world transforms are preserved during one-time reparenting (maximum measured matrix error 5.55e-17).

## Materials and mapping

Topology/normal inspection confirms three cylindrical LED primitives and two planar circular center caps. Only those exact surfaces receive footage. Three broad annular mirror primitives use a silver physical metallic material (metalness 1, roughness .065), lit by an Orbit-specific hidden reflection-card environment. Original black bearings remain unchanged. Only the base/pedestal primitive receives the black finish.

One shared muted inline video element and VideoTexture supply all displays. Cylindrical UVs make one continuous revolution per band, with a small 2.5% seam feather; center caps use a centered cover crop with corrected rear-face orientation. UVs are assigned in the assembled reference frame once and remain fixed to local geometry during motion. Video is not assigned to broad mirror faces, bearings, or the base. No floating display planes are added.

## Lifecycle

The camera and product chapter remain scroll driven. At chapter progress .70 (the existing reveal completion), a separate elapsed-time clock immediately accelerates the three ring pivots into the continuous cycle. There is no extra scroll threshold or waiting hold. Reverse scrolling blends motion out before the close-up; chapter exit resets while out of view and pauses video. Re-entry resumes a clean coordinated sequence. Hidden-tab rendering and media pause through the existing shared lifecycle. Reduced motion shows an aligned mapped poster and suppresses rotation/video. Playback rejection uses the poster without blocking navigation.

## Video

Original retained at assets-originals/orbit-golden.mp4: 47,777,960 bytes, 1920x1080, 25 fps, 16.04 seconds.

Compared CRF23 1080p (10,114,009 bytes) and 720p (3,823,034 bytes), including golden detail and dark gradients. Selected 720p for the small rendered bands. Final public/assets/products/orbit-golden.mp4 is 3,711,129 bytes, 1280x720, 25 fps, H.264/yuv420p, no audio, fast-start metadata. Its duration is 15.64 seconds. Source endpoints visibly differ; a restrained .4-second overlap dissolve joins them in the derivative. Optimized first/end frames and a live wrap were checked. The original is not claimed to be seamless.

## Evidence and checks

- evidence/orbit-kinetic-mirror.mp4: actual full reveal, immediate ring movement, idle continued motion, a complete mechanical cycle and a video wrap.
- evidence/orbit-kinetic-checks.json: captured times and unchanged UV diagnostics; video wraps once while motion continues, without a playback reset at the mechanical cycle.
- evidence/orbit-first-checks.json: assembled, gyroscopic, oblique, concentric and reconstructed states; fixed base, rigid assemblies and stable pivots/UVs.
- Production browser checks at 1500, 768, 390 and 320px, including reduced motion: all four products loaded, no horizontal overflow, failed requests or console errors.
- Automated Orbit coverage checks surface classification, exact attachment preservation, immediate idle animation, cycle reconstruction, video continuity, exit/re-entry, hidden tab pause, reduced motion and autoplay failure.
- Production build passes. Full regression results are reported in the completion message.

Remaining limitation: ring speeds/phases are a reference-led visual adaptation; no dimensioned mechanical/actuator specification was supplied. Reflections use a deliberately simple studio-card environment rather than recreating the reference room or its changing video reflections.

Final regression outcome: 57/58 passed in the full run. The existing nested-SVG cursor test injected its fixture before the shared UI finished mounting, and initialization replaced that fixture. Its setup now waits for crystalDiagnostics.ready; the isolated rerun passed. All four Orbit tests passed in the full run. No production cursor behavior was changed. Production build and responsive browser checks passed.
