# Crystalline C corrections — 12 November 2026

## Latest refinement: glass, clean UI and repeatable section entry
The current correction removes the flat blue-grey reflection treatment. Colorless transmission is retained, while the bounded optical shader now evaluates hidden finite studio cards along reflected and refracted rays. Both paths use the same lighting field. RGB refractive indices are 1.49/1.5/1.512 on desktop, with up to five interface encounters (three on the lower tier). Polished bevels and small surface-normal variation reveal thickness; broad native PBR reflections are reduced, not used as a metallic face fill. No opacity-only glass, emissive outlines or bloom were added. The black studio composition remains intentionally dark between highlights; it is not a pixel-identical recreation of Frame 63.

The main separation is now a coordinated fan derived from each facet's rest position, with related depth/rotation offsets instead of alternating pseudo-random turns. Local hover is more visible: the primary facet receives .42 units of depth separation plus outward and rotation offsets. Neighbor weights remain weaker, distant pieces remain still, and rest errors return to exactly zero.

The fluid field deposits a continuous bounded film instead of accumulating ridges at each pointer sample. Lower vorticity and bounded velocity prevent grid-scale shredding. Filtered thickness derivatives, sharper Fresnel reflection cards and small chromatic offsets replace the previous smoky body response. The wake still evolves spatially, follows with inertia, and dissipates. It is a 2D optical surface approximation, not a reconstruction of Lusion's proprietary effect or a full 3D liquid solver.

Visible Pending tags beneath the CTA and beside navigation are removed. The normal labels and existing click feedback remain; missing destinations are still reported on activation rather than invented. Headline layering remains fluid → semantic HTML → glass → shared UI, including at MEETS. Medium landscape typography is adjusted to keep the full word CREATIVITY readable.

### Automatic re-entry lifecycle
A separate hysteresis gate triggers at 50% visibility and rearms below 10%, normalized to the smaller of section and viewport height. This handles a section taller than a mobile viewport. A genuine exit stops the single existing timeline, clears hover/fluid/ambient offsets and resets facets while out of view. The next entry restarts from the assembled pose. Boundary reversals continue the current sequence. Pointer events and resizing do not restart it. Reduced motion stays assembled and never replays. Diagnostics expose actual GSAP tween count and entry/replay counts.

The C is currently the final page section. Return from above was tested on the actual page; return from below was tested using a temporary following viewport in the test harness. No new content or blank trailing section was added to the site.

### Latest verification
35 scenarios passed across the complete regression run and focused re-runs. The complete run initially found one cursor test still targeting deleted Pending elements; its selectors now target the actual nested labels, and all five cursor scenarios passed again. All ten C scenarios passed, including four consecutive entries, exits halfway through and after completion, both directions, boundary reversals, resize, stable local hover and precise reset, mobile normalization, reduced motion, fallback and clean UI. All 20 existing intro/video scenarios passed.

Production build and production browser smoke check passed, with no page, console or resource errors. Updated screenshots and the short interaction recording remain under evidence/corrected-c-*. Physical mobile hardware, screen-reader software and an exact visual match to Lusion's solver have not been verified. Existing showreel/demo/navigation dependencies remain unimplemented. No deployment was performed.

## Reference inspection and skills
The accessible attachment `Screen Recording 2026-11-12 173353.mp4` is the 18.0666-second Lusion interaction recording. Thirty frames across its entire duration and five full-resolution detail frames were inspected. It shows an elongated translucent sheet that stretches, folds/curls, trails and dissipates with pale highlights and small spectral fringes. The blue graphic curve and embedded showreel footage were deliberately excluded. The separately named `20261112-1203-31.3667695.mp4` was not found, but the accessible recording contains the requested interaction. The original 4.04-second C motion reference and Frame 63 remain the motion/composition sources.

Installed instructions were read for Blender core, hard-surface modeling, PBR materials, asset QA and modeler, and the Three.js router, procedural fields/materials/animation and water optics skills. The replica-building workflow was inspected but not selected because this is repair of a supplied mesh, not construction of a new replica. Existing Animation Tool Router, Design Motion Principles, GSAP Performance, frontend and Motion Performance QA guidance was used. `immersive-web-design` remains unavailable. No Blender executable or connector was available, so the numerical repair/QA ran in the existing Three.js data pipeline. No packages were reinstalled. This project uses vanilla Three.js/GSAP, so React Motion patterns were not introduced.

## Headline and foreground composition
The four semantic word elements are exactly WHERE, CREATIVITY, MEETS, ENGINEERING. The accessible headline has the complete correctly spaced phrase. Tracking is opened, font kerning/ligatures are disabled for this display treatment, and words are not clipped. The split layout remains responsive.

The rendering layers are now independent: black/fluid at z=0, semantic HTML at z=1, transparent C canvas at z=2, shared UI above. The C therefore actually draws over overlapping headline pixels. A lightweight optical image of the same headline/lighting field is sampled through the glass; it is not another visible heading. The single shared logo, CTA, navigation, exploration cue and cursor are preserved.

## Necessary solid repair
The original GLB stays unchanged on disk. It still supplies all nine named front/beveled-side pairs and the complete C arrangement.

The source front triangles sit at z=.12 and do not meet the shell aperture at z=.185. Each front cap was sealed using its matching shell's existing first-ring vertices. No side vertex was moved. Winding was corrected outward and normals recomputed. All nine repaired facets have zero non-manifold/boundary edges and positive signed volume. All remain 20 triangles per facet (180 total), 18 meshes and nine rigid pivots. Original and repaired overall bounds are identical: x ±1.8, y ±2.13257694, z -.21 to .185. Per-facet numerical results are exposed through `crystalDiagnostics().repairs` and captured in the evidence JSON.

## Glass optics
The former emissive rims, spectral paint expressions and decorative face caustics were removed. The replacement uses colorless dielectric transmission, polished bevels, hidden gradient reflection cards, moving reflected lighting, wavelength-dependent refraction, attenuation and bounded internal reflections. Actual closed solids provide thickness. A subtle optical-normal finish smooths the cap response without changing the silhouette.

`src/crystal-optics.js` traces a convex optical proxy of each repaired facet, with up to five interface encounters on desktop and three in the lower quality tier. RGB refractive indices differ on desktop. Outer reflection combines the same analytic studio-card field with a restrained Three.js PBR response. `src/crystal-backdrop.js` owns the refraction source and its viewport; it does not capture or warp navigation. Glass appearance varies with view and reflection lighting and is not a pixel-identical recreation of Frame 63's art-directed render.

## Choreography and local interaction
One GSAP scalar clock drives an 11.4-second assembled → rotating → separated/turning → reconstructed sequence. Rotation continues during separation, with pitch/depth and a slight camera perspective sweep. All final facet transforms reconstruct exactly. Main timing, turn, spread, depth and stagger remain in `src/crystal-config.js`.

After settling, raycasts hit an assembled proxy rather than moving triangles. The selected facet gets the strongest outward/depth/rotation offset, close neighbors get weaker offsets, and distant pieces remain at rest. Entrance, hover and ambient responses are composed in one final transform calculation. Hover transfers smoothly and snaps precisely to zero after convergence on exit. A recorded primary weight was .964, nearby weights .115/.110, and distant weights zero. Final hover reset error is zero.

## Fluid replacement
`src/glass-field.js` now runs a lower-resolution half-float velocity/thickness field with semi-Lagrangian advection, pressure projection, vorticity, controlled smoothing and dissipation. Pointer direction/velocity and an inertial follower inject a stretched sheet. Its evolving normal field supplies Fresnel reflection and chromatically separated refraction of a restrained light field. There are no concentric sine-wave impulses, blurred colored circles, or particle trails. The field is rendered behind the HTML in its own canvas and cannot intercept input. Debug modes expose velocity and thickness.

The observed sheet behavior guided this implementation; this is an original 2D surface simulation, not Lusion's proprietary solver. It does not model full three-dimensional overhanging liquid or scene-wide global illumination.

## Verification and captures
- The earlier **32 Playwright scenarios passed** in local Edge: repaired geometry, genuine facet animation, rigid pairs, precise reconstruction, stable hover/local transfer/reset, foreground layering, exact headline, fluid decay, offscreen/hidden suspension, responsive layouts, touch, reduced motion, fallback, cursor, navigation, robot articulation and the continuous LED/home video handoff.
- `npm.cmd run build` passed. Production smoke check returned no page, console or resource errors; development controls remain absent.
- Desktop, tablet, 390px and 320px screenshots were inspected. No horizontal overflow or scroll traps were observed. Normal scene playback produced no console errors.
- `evidence/corrected-c-assembled.png`, `corrected-c-rotated.png`, `corrected-c-separated.png`, `corrected-c-turning.png`, `corrected-c-reconstructed.png`, `corrected-c-hovered.png` and `corrected-c-fluid.png` capture the requested states.
- `evidence/corrected-c-interactions.webm` records the sequence, local hover and fluid interaction. `evidence/corrected-c-motion.json` contains sampled transforms and an empty errors array.

Reduced motion has an assembled static C with no hover/wake/continuous rotation. Touch disables pointer effects. Rendering and simulation pause when hidden/offscreen; GPU resources, listeners, observers and the timeline are disposed. A source-derived static fallback remains available.

Remaining limitations: bounded convex-facet ray optics and a 2D fluid surface are real-time approximations; physical mobile hardware and assistive-device screen readers were not tested. Existing missing showreel and pending demo/navigation destinations remain unchanged. No deployment was performed.
