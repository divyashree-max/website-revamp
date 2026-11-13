# DNA targeted timing, counter-rotation and chrome corrections

This supersedes the dwell/15.4-second choreography described in DNA-LED.md. It changes DNA only.

## Timing and continuous motion
Inspected 24 frames across the complete latest accessible output recording, Screen Recording 2026-11-13 160443.mp4 (35.37 seconds). It shows the full-view stationary interval and the original white base. Source inspection confirmed an additional 1.2-second startup hold and several dwell intervals inside the loop.

The kinetic clock starts at the same normalized 0.7 progress at which the existing camera reaches its resting hero composition. There is no additional scroll threshold or timed hold. A 0.12-second analytic acceleration ramp produces movement immediately while smoothing startup; it is not a stationary delay. Motion continues from elapsed frame time while scrolling is idle.

The existing four travel intervals (2.2, 2.0, 1.6 and 1.4 seconds) and per-block angle bounds are retained. Removing the stationary intervals condenses the cycle to 7.2 seconds. Matched Hermite velocities pass through the assembled pose and the loop seam continuously instead of stopping there. Monotonic easing lag retains the stagger while giving all blocks shared turning points. Adjacent angular velocities therefore stay opposed through every travel segment.

Block order is top-to-bottom. The consistent direction axis is +Y looking downward along the vertical spindle: block 1 starts clockwise (negative Y), block 2 anticlockwise, alternating through block 6. As required by the preserved bounded range, each block reverses at its travel limit; adjacent blocks remain counter-rotating on the return. No unlimited cumulative spins or new mechanical behavior are introduced. Pivots, member meshes, original geometry, stationary base/spindle and the camera path are unchanged.

## Chrome selection
Only these explicit source meshes receive the new physical material:
- DNA - BASE Full assembly.008
- Cylinder.014

Metalness is 1, roughness 0.09, with neutral silver reflectance and zero emission. A material-specific precomputed studio reflection map provides shaped highlights and darker reflected areas. These reflection cards are invisible and use the existing renderer; shared scene lighting and other product materials are unchanged. Wheels and rubber retain their source materials. The DNA-only reduced-motion/loading preview has been recaptured with the chrome base.

## Preserved video and lifecycle
The same 4.34 MB video, one player/VideoTexture, crop, front/rear mapping and fixed per-panel UVs are unchanged. Motion cycle boundaries do not seek, reload or restart footage. Leaving DNA pauses and cleanly resets the hidden rig; returning begins smoothly at full reveal. Hidden tabs pause the existing render clock. Reduced motion remains aligned with a mapped still. No duplicate timeline, RAF or WebGL context is added. Chrome environment resources are released with the DNA asset.

## Checks and evidence
- Nine targeted DNA/product browser tests passed, including immediate motion at full view with unchanged scroll position, opposed adjacent angular velocities, continuous cycle seams, fixed pivots/base, UV stability, video continuity, exit/re-entry, reduced motion, autoplay fallback and the other three products.
- Production build passes. Production checks at desktop, tablet, phone and reduced-motion widths report no captured console/asset errors or overflow.
- Actual recording samples show nonzero block motion approximately 0.22 seconds into the full-view clock. Camera position and scroll chapter remain fixed throughout the subsequent recording; motion continues across two complete cycles.
- Chrome targets, material parameters and stationary transforms are verified in diagnostics. LED texture and UV-region checks remain green.
- All 54 browser regression tests passed (5.4 minutes), including the existing intro, home-video handoff, C, services, cursor, products and reduced-motion/fallback states.

Recording: evidence/dna-alternating-chrome.mp4 (approximately 19 seconds, including the reveal ending and two idle cycles). Raw capture: evidence/dna-alternating-chrome.webm. Captured state: evidence/dna-alternating-checks.json. Contact sheet: evidence/robot-presentation-dna-chrome-completed.jpg. Representative still: evidence/dna-corrected-alternating.png.

No deployment was performed. Travel remains bounded at the approved angles and preserves the return phases. Physical low-end devices were not available for hardware profiling.
