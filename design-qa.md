# Direct reconstruction — verification

Reviewed November 10, 2026. The user's approved output is the base. Supplied GLB, logo, robot recordings, bicycle motion reference and amber studio remain the reference set. Homepage content, fonts, layout and controls are unchanged.

## Current changes

Physical LED luminance is subtly charcoal/amber, with the original cabinet material refined for bezel highlights. Logo colors/content remain unchanged. The panel lift fades smoothly during approach and reaches zero before the shared-texture homepage handoff.

The entire line-drawing stage is removed from runtime, including contours, target convergence, drawing depth proxies and fat-line imports. Version-3 data keeps approved surface/dotted-feature positions and normals only, reducing reconstruction transfer from 2.03MB to 1.15MB. Recognisable particles hold before restoring directly to solid materials.

Playback falls from 26.94s to 22.45s, a 20% overall speed increase. Opening and clockwise roll retain their approved choreography. After reconstruction the arm stays frozen; the camera makes one direct alignment, holds briefly, then travels only along the measured display normal. No extra arm gestures, repeated turns or later camera detours.

## Checks

npm run build passes. All 15 Playwright scenarios pass: live shortened sequence; full clockwise A6 roll with fixed centre, frontal normal and stationary A1–A5; direct particle-to-solid restoration without line drawing; original proportions and one final camera path; completed frontal pose and pixel handoff; Skip/Replay/focus; delayed actual logo/model readiness; per-tab completion; reduced motion; responsive resize; touch/Pause; missing assets/context loss; hidden-tab lifecycle; frame intervals.

Full recorded playback is evidence/direct-sequence.webm, reviewed throughout using direct-playback-1.png through direct-playback-3.png and full-size direct-*.png captures. There are no asset or console errors in the recorded run. The original homepage content file matches its approved-base snapshot. Production playback is recorded in sequence-production.json. Existing dense-renderer build warning remains.

The handoff compares final physical-screen pixels against the homepage using the same composited texture/crop/phase. The panel lift is already zero at comparison. The centered A6 mount and source joint dimensions are unchanged from the approved version. No geometry was added for the screen surface beyond the already-existing continuous LED content surface.

Existing limits remain: 33.2MB dense model, no factory-calibrated engineering/soft-body simulation, and no real iOS/Android or assistive hardware validation. No deployment.
