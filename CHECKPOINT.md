> Latest DNA-only update: one continuous cropped LED video across six rigid independently rotating blocks. See [DNA-LED.md](DNA-LED.md) for mapping, lifecycle, encoding comparison, tests and recording. Other products retain their approved behavior.

> Latest addition: four exact-GLB kinetic product chapters after services, plus the supplied ground grid and modest KUKA framing adjustment. See [KINETIC-PRODUCTS.md](KINETIC-PRODUCTS.md) for behavior, checks, recordings and the Matrix scene limitation.

> Latest services correction: larger articulated motion envelope, alternating authored text, 66% reading intervals, richer LED visuals and folded refractive fluid. See [SERVICES-REFINEMENT.md](SERVICES-REFINEMENT.md) for current checks, evidence and dependencies.

> Latest correction: closed glass facets, foreground C, continuous 3D motion, local triangle hover and an advected fluid sheet replace the earlier material/wake. See [C-CORRECTIONS.md](C-CORRECTIONS.md) for current behavior and verification; earlier implementation notes below are historical.

> New section: the supplied crystalline C now follows the home. See [CRYSTAL-SECTION.md](CRYSTAL-SECTION.md) for geometry, shared UI, motion, shader implementation and verification.

> Latest update: the supplied tunnel video replaces the LED logo after solid reconstruction and continues into the Frame 62 landing layout. See [VIDEO-ARRIVAL.md](VIDEO-ARRIVAL.md) for implementation, pending navigation and verification. Earlier notes below describe the previous approved base.

# Approved-base direct reconstruction — November 10, 2026

The approved opening, source KUKA proportions and centred clockwise A6 screen roll are preserved. Total playback is now 22.45 seconds (27.5 authored clock units at 1.225×), versus the approved 26.94 seconds: 20% faster overall. The camera, articulation, particles and screen illumination share the same clock.

The technical drawing stage is removed completely from runtime. Recognisable source-surface particles hold at authored 18–19, restore directly to solid at 19–21, then the camera makes one direct alignment at 21–23. Brief frontal hold 23–24; straight screen-normal entry 24–27.5; unchanged homepage. The arm/mount hold the same compact pose after the initial roll. No later gestures, repeated turns or technical camera detours.

The existing LED housing material now carries realistic charcoal bezel reflections. The physical screen adds a subtle charcoal/amber luminance surface while preserving logo contrast. Its luminance lift fades continuously during the final approach, reaching the unchanged shared homepage texture before handoff. No homepage content, fonts, layout or control changes.

Reconstruction data is version 3: approved surface/dotted-feature positions and normals only, 1,152,000 bytes (down from 2.03MB). Runtime has points and short analytic trails; no contour line objects, contour convergence, hidden-line proxies or wireframe imports. The source GLB and 33.2MB optimized model remain unchanged. If the held pose changes, run node tools/bake-reveal.cjs before building.

Verified: npm run build and all 15 browser scenarios. Tests cover full playback, front-facing clockwise roll about a fixed centre, held joints and source proportions, direct particle-to-solid fill, one straight final alignment, LED-to-homepage pixel continuity, responsive resize, reduced motion, Skip/Replay/focus, real readiness holds, fallback and lifecycle. Current visual evidence: direct-sequence.webm, direct-playback-1/2/3.png, direct-*.png, direct-camera-proportions.json. Historical contour evidence is superseded.

Source fingerprint: evidence/direct-source-manifest.json. Homepage content matches evidence/approved-before-direct-reveal/src/content.js. Development http://127.0.0.1:5173; production http://127.0.0.1:4173. Refresh then Replay intro. No deployment.

Existing limits: dense GLB, no factory joint/soft-body collision simulation, and no real iOS/Android hardware validation.

Latest extension: the connected six-chapter services stage is implemented. See SERVICES.md for the shared C/fluid handoff, media replacement structure, verification and pending service destinations.

13 November 2026: completed coordinated robotic services presentation. All 45 regression scenarios, the additional motion-corridor sweep and responsive production smoke checks passed. Recording: evidence/services-scroll.webm. Current report: ROBOT-SERVICES.md.
