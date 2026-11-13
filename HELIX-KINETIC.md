# Helix closed-to-open articulation

Helix-only implementation. The original closed HELIX.glb, structural materials, base treatment, product copy and authored camera shots are preserved. DNA, Orbit and Matrix mechanics/media modules are unchanged. Publication uses the existing GitHub Pages workflow on main.

## Reference observations and endpoint evidence

Inspected the complete 60.25-second movement reference as a 36-frame sequence, with additional full-size detail views. It shows row-staggered mechanical changes between a narrow closed tower and a broad opened display. Its wedding footage, text, floor, environment and watermark are not reproduced.

The supplied closed and open GLBs share 32 named meshes and have no animation clips. They align directly in product coordinates; their two base components have matching world bounds and transforms. The six center panels, six structural units and two base pieces remain stationary. Six HingeR nodes rotate +120 degrees around vertical source-Y axes; six HingeL nodes rotate -120 degrees. The supplied node origins establish the actual hinge axes.

The moving parts have matching expanded triangle vertex coordinates in their own local frames; their opening is stored in node transforms. Some exported vertex counts differ because of duplication and normal splits. The fixed upper unit also changes triangle ordering, but a spatial point-set comparison confirms exactly identical geometry. Consequently no vertex interpolation, morphing, scaling or model swapping is used.

src/helix-rig.js records measured pivots and open matrices derived by tools/derive-helix-rig.mjs. A single copy of the closed geometry is attached to twelve non-rendering pivot groups, preserving its original world appearance (maximum reparenting error 8.89e-16). Fixed-axis rigid rotations match the open-state bounds within 0.00003462m (0.035mm). This residual comes from the open export's tiny Y/scale precision differences; runtime preserves rigid dimensions and fixed hinges rather than animating those numerical artifacts. Closing returns exactly to the supplied closed transforms.

## Authored motion

One elapsed-time system composes the twelve hinge angles. The 4.8-second cycle opens top-to-bottom with 50ms row staggering, briefly holds the complete open state, then closes bottom-to-top and repeats without an angular reset. Timing is an authored, faster adaptation of the reference, not a measured actuator specification.

Motion starts at existing chapter progress .70, exactly where the camera reveal ends. Scroll still owns the unchanged camera path; elapsed time owns the hinges while visitors stop scrolling. Reverse travel blends back toward closed before close camera shots. Chapter exit and hidden-tab handling pause work; re-entry begins from a clean closed cycle. There are no independent tweens competing for the same transforms.

The row separation remains approximately 5mm because all opening is around vertical axes. Hinges remain at their source positions, structural mesh transforms stay fixed, and the original flaps turn outward. Intermediate and endpoint states were visually reviewed; this is not a factory tolerance/collision simulation.

## LED mapping and media

Geometry inspection identifies eighteen LED.001 primitives, each consisting of four coplanar quads. They form three coherent closed faces, six vertically stacked segments per face. Source-space outward normals and horizontal directions are:

- Center: normal +X; image-right -Z.
- Right: normal (-.5,0,+.866025); image-right (+.866025,0,+.5).
- Left: normal (-.5,0,-.866025); image-right (-.866025,0,+.5).

Each portrait face receives one correctly oriented complete video composition across its six segments, using a centered cover crop that preserves source proportions. The three faces share the same video playback. Their fixed closed-coordinate UVs travel with the panels during opening; the opened arrangement retains these three original face compositions. Structural parts, panel edges, hinges and bases do not receive the footage. Only the actual front LED surfaces emit, so newly exposed faces appear naturally as the hinges turn.

The temporary numbered test verifies upright top-to-bottom segments 1 through 6 on all faces in closed and open configurations. It is disabled in the final output and is created lazily only when requested by the debug test API.

Original locally retained at assets-originals/helix-organic.mov: 18,007,719 bytes, 1920x1080, 24fps, approximately 17.5 seconds. Compared 720p CRF22 (6,377,117 bytes) against 1080p CRF23 (10,493,224 bytes), inspecting glowing details and dark gradients. The selected public/assets/products/helix-organic.mp4 is 6,377,117 bytes (6.38MB), 1280x720, 24fps, H.264/yuv420p, muted/no audio, with fast-start metadata. The original is excluded from public runtime assets.

Start/end frames were visually checked; their change is comparable to normal adjacent frames (SSIM .890 across the wrap versus .864 for the inspected first adjacent pair). No extra loop dissolve was necessary. Browser sampling confirms decoded frames remain ready through a real media wrap. This does not claim mathematically identical source endpoints. Video time continues independently of the 4.8-second mechanism cycle.

## Checks and artifacts

- Production build passes.
- All 23 Helix, DNA, Orbit, Matrix and existing product regression checks pass.
- Five Helix-specific checks verify measured endpoints, rigid child transforms, hinge attachment, fixed structure/base, row separation, unchanged camera during idle motion, exact closed return, independent video playback, one player/texture, three-face UV order, exit/re-entry, hidden tab, autoplay fallback and reduced motion.
- Production checks at desktop/tablet/mobile widths (1500, 768, 390, 320px) include full open and closed reduced-motion views. No console errors, failed assets or horizontal overflow were found.
- Reduced motion uses a mapped, closed product poster and pauses video and hinges.
- The supplied closed GLB fingerprint remains unchanged. No structural material overrides or new renderer/context/dependencies were added.

Evidence in the ignored evidence folder: helix-opening-video.mp4 (closed reveal, immediate opening, full-open endpoint, repeated close/open cycles and media wrap); helix-kinetic-checks.json; helix-numbered-closed/open.png; helix-endpoint-comparison.json; helix-fixed-top-geometry.json; helix-final-loop-checks.json; helix-production.json and responsive screenshots.

Camera refinement: the full-product presentation now looks along the opened display normal (product-local +X, respecting the existing root yaw). Framing fits a swept bound of the closed, opening and fully open poses. The authored close-up shots remain unchanged, including their mobile framing, and blend into the frontal view only during the final pullback. The camera stays fixed while the mechanism cycles. The reduced-motion fallback uses the same frontal closed view.

Remaining limitations: approximately 0.035mm endpoint export precision difference; reference-led timing rather than actuator calibration.
