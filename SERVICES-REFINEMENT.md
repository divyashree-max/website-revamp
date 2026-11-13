# Services refinement — 13 November 2026

This supersedes the earlier left-column presentation notes in ROBOT-SERVICES.md.

## Changes
- Six larger shoulder/elbow-driven poses share one planted base and constant side-profile placement. The original wrist axes compensate orientation; the display remains rigidly mounted and front-facing at reading states. Source geometry, bone translations/scales and LED proportions are unchanged.
- Framing now uses 90% of the available stage width and 79% of its height around the swept motion envelope, rather than restricting every pose to the left 46%. Copy alternates between upper-left and lower-right authored compositions, clear of the moving display.
- Each chapter uses 0.95 viewport of native scroll. The first 66% is a settled reading interval; the remaining 34% drives joint travel. Text exits/reveals in short windows around the midpoint, synchronized with the LED blend. No queued tween, wheel interception or frame-dependent chapter switching is used.
- Replaced the small diagrams with six fuller procedural illustrations: depth-separated kinetic modules; responsive touch matrix; illuminated spatial corridor; coordinated automation cells; rotating generative volume; connected hardware/software nodes. These remain illustrative placeholders, replaceable with images/videos in services-config.js.
- The existing single shared fluid layer now advects a signed folding field alongside velocity and thickness, with pressure projection, stronger vorticity, sharper reflection cards, refractive light-field detail and narrower spectral separation. It retains the same pointer state through the C handoff and services. It is an original approximation of the recording, not the proprietary Lusion simulation.
- Preserved the C's amber-glass arrival/hold and reverse transition, intro/home video, source assets, shared UI and contextual cursor. Mobile uses natural-flow copy, smaller articulation and disabled pointer decoration; reduced motion keeps stable presentation states.

## Reference observations versus implementation
Reviewed contact sheets distributed across the complete latest 124036 output recording and preceding 122213 recording, alongside the earlier KUKA-WOOW/TAGG movement and supplied Lusion recording. The output showed a small left-only motion envelope and lengthy dark copy intervals. The movement references show a mounted panel carried through coordinated height and reach changes; the fluid reference shows localized folded clear surfaces and refractive highlights. The authored poses, alternating copy locations and procedural media are implementation choices for the existing square-screen GLB, not copies of reference branding or media.

## Verification evidence
- Production build succeeds.
- All 45 automated browser tests passed (4.6 minutes). The suite covers original intro, clockwise LED roll, particle reconstruction, continuous home video, C entry/re-entry and hover, contextual cursor, all six services, reverse/fast scroll, LED replacement, amber handoff, keyboard scrolling, sticky release, hidden-tab lifecycle and fallback states.
- Updated pose tests check all six distinct screen positions, source link invariants, constant base/mount transforms, frontal reading orientation, authored copy placement and screen/copy clearance through 41 travel samples.
- Production browser checks at 1500, 768, 390 and 320 pixels: no horizontal overflow, shared logo/UI intact, rigid attached display, no captured console or asset errors.
- Inspected desktop and mobile screenshots and frames across the complete 72.96-second forward/reverse recording. Live in-app browser also verified the enlarged Kinetic and alternate Interactive composition.
- Recording: evidence/services-refined-forward-reverse.webm. Forward services approximately 21–44s; full reverse approximately 44–67s; C/amber connection shown at both ends. Contact sheet: evidence/robot-presentation-refined.jpg. Detailed captured state: evidence/services-refined-checks.json.

## Remaining dependencies and limits
All six Explore more destinations remain explicitly null because service routes have not been supplied; activating one reports that dependency. Media remains replaceable illustrative procedural content. The source GLB has no manufacturer joint-limit or collision metadata: these are visually checked website poses, not a validated industrial robot motion program. The fluid is a screen-space simulation; its folded highlights approximate the reference and can still differ from Lusion's exact optical treatment. immersive-web-design was not available in the installed skills; applicable installed animation, performance, frontend and Three.js skills were used. The runtime is vanilla Three.js/GSAP, so React-specific motion patterns are not applicable. No deployment was performed.
