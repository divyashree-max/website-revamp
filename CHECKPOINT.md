# Approved-base direct reconstruction — November 10, 2026

The approved opening, source KUKA proportions and centred clockwise A6 screen roll are preserved. Total playback is now 22.45 seconds (27.5 authored clock units at 1.225×), versus the approved 26.94 seconds: 20% faster overall. The camera, articulation, particles and screen illumination share the same clock.

The technical drawing stage is removed completely from runtime. Recognisable source-surface particles hold at authored 18–19, restore directly to solid at 19–21, then the camera makes one direct alignment at 21–23. Brief frontal hold 23–24; straight screen-normal entry 24–27.5; unchanged homepage. The arm/mount hold the same compact pose after the initial roll. No later gestures, repeated turns or technical camera detours.

The existing LED housing material now carries realistic charcoal bezel reflections. The physical screen adds a subtle charcoal/amber luminance surface while preserving logo contrast. Its luminance lift fades continuously during the final approach, reaching the unchanged shared homepage texture before handoff. No homepage content, fonts, layout or control changes.

Reconstruction data is version 3: approved surface/dotted-feature positions and normals only, 1,152,000 bytes (down from 2.03MB). Runtime has points and short analytic trails; no contour line objects, contour convergence, hidden-line proxies or wireframe imports. The source GLB and 33.2MB optimized model remain unchanged. If the held pose changes, run node tools/bake-reveal.cjs before building.

Verified: npm run build and all 15 browser scenarios. Tests cover full playback, front-facing clockwise roll about a fixed centre, held joints and source proportions, direct particle-to-solid fill, one straight final alignment, LED-to-homepage pixel continuity, responsive resize, reduced motion, Skip/Replay/focus, real readiness holds, fallback and lifecycle. Current visual evidence: direct-sequence.webm, direct-playback-1/2/3.png, direct-*.png, direct-camera-proportions.json. Historical contour evidence is superseded.

Source fingerprint: evidence/direct-source-manifest.json. Homepage content matches evidence/approved-before-direct-reveal/src/content.js. Development http://127.0.0.1:5173; production http://127.0.0.1:4173. Refresh then Replay intro. No deployment.

Existing limits: dense GLB, no factory joint/soft-body collision simulation, and no real iOS/Android hardware validation.
