> Latest correction: closed glass facets, foreground C, continuous 3D motion, local triangle hover and an advected fluid sheet replace the earlier material/wake. See [C-CORRECTIONS.md](C-CORRECTIONS.md) for current behavior and verification; earlier implementation notes below are historical.

> New section: the supplied crystalline C now follows the home. See [CRYSTAL-SECTION.md](CRYSTAL-SECTION.md) for geometry, shared UI, motion, shader implementation and verification.

> Latest update: the supplied tunnel video replaces the LED logo after solid reconstruction and continues into the Frame 62 landing layout. See [VIDEO-ARRIVAL.md](VIDEO-ARRIVAL.md) for implementation, pending navigation and verification. Earlier notes below describe the previous approved base.

# Craftech360 — direct particle reconstruction

The existing homepage follows a 22.45-second introduction using the supplied KUKA GLB, logo and amber studio. The approved mechanical-detail opening and centred clockwise screen roll are preserved. Runtime contains no technical line-drawing or wireframe stage.

## Run

npm run dev serves http://127.0.0.1:5173. Use npm run build, then npm run preview for production. npm test runs the Microsoft Edge browser scenarios. Development-only inspection: /?debug=1&t=0, with authored-clock scrubbing from 0 to 27.5. Production omits debug controls.

## Shared choreography

A single GSAP authored clock plays at 1.225×. The shortened 27.5-unit timeline is 20% faster overall than the approved 33-unit timeline at the same rate, retaining opening/roll pacing.

- 0–2.8: mechanical elbow detail and backwards pullback.
- 2.8–6: approved low three-quarter reveal and compact presentation.
- 6–11.2: clockwise A6 in-plane display roll; front stays facing the camera and A1–A5 hold still.
- 11.5–18: surface dissolve, controlled swarm and return to recognisable source geometry.
- 18–19: stable particle-only KUKA and display.
- 19–21: particles restore directly to original solid materials.
- 21–23: one direct camera alignment; robot stays still.
- 23–24: brief centred, upright, front-facing logo hold.
- 24–27.5: straight display-normal approach and unchanged homepage arrival.

Times above are authored units; divide by 1.225 for playback seconds. There are no post-reconstruction arm gestures, repeated revolutions or camera detours.

## Geometry and assets

The original source-assets/KUKA+Display.glb and 33.2MB runtime GLB remain unchanged. All 1,276,964 triangles, 98-node hierarchy, native link offsets/scales, skin and embedded clips remain. Runtime joint rotations use compact source .004 poses. The original Cable follows base/elbow anchors without replacement connector geometry. The existing payload offset is centred on A6 by 3.9mm; mesh proportions and native arm pivots remain authored.

Surface data version 3 contains approved source/dotted-feature samples and normals only (1.15MB). Runtime uses 36k / 14k points and short trails. It creates no contour objects or depth-only drawing proxies. Regenerate with node tools/bake-reveal.cjs when the held pose changes.

## Physical LED and homepage

The actual cabinet material supplies restrained bezel highlights. A subtle charcoal/amber luminance lift separates the physical LED from the dark studio and preserves the original logo. That lift fades during entry to the existing shared homepage texture before the handoff; homepage content and styling remain unchanged. The model's square display is never stretched.

Homepage logo/fonts preload. Late readiness holds the aligned screen, Skip waits for loaded content, reduced motion uses the static homepage, and per-tab completion, Replay, Pause, keyboard focus, touch pan and lifecycle cleanup remain.

## Verification and limits

npm run build and all 15 browser checks pass. Full visual playback: evidence/direct-sequence.webm and direct-playback-1/2/3.png. Source fingerprints and homepage comparison are recorded separately. No deployment.

The dense GLB remains 33.2MB. Real mobile/assistive hardware and factory-calibrated mechanical simulation are outside local headless-browser validation.

## Current website and deployment

The site now includes the approved robot/video introduction, crystalline C interaction, six-service robotic presentation, and DNA, Orbit, Matrix and Helix product chapters. DNA and Orbit have their own kinetic motion and shared LED video mapping. See the corresponding section Markdown files for implementation and actual verification notes.

GitHub Actions builds and deploys main to GitHub Pages at https://divyashree-max.github.io/website-revamp/. Relative production asset paths support the repository subdirectory. Local server logs, captured evidence and large unoptimized media masters remain local; optimized runtime assets are included in public/assets. The original supplied KUKA model remains in source-assets.
