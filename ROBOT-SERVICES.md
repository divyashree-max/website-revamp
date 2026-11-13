# Articulated services presentation — 13 November 2026

## Result
The existing KUKA services stage now has six authored rotary joint poses and six corresponding HTML copy compositions. One normalized scroll sample drives shoulder/elbow pose, wrist presentation, active chapter, text visibility and LED blending. The same sample works in either scroll direction without queued animations. Native sticky scrolling and release remain in place.

## Reference inspection
Inspected 24 frames distributed across each complete accessible recording:
- `KUKA-WOOW_2.mp4`: 14.1667 seconds. Coordinated reach/height changes and wrist-carried display presentation; the orange arm and its display remain a connected mechanism.
- `TAGG9330.MP4`: 6.72 seconds. A real display rises and changes presentation angle with the mounted wrist/arm rather than sliding independently.
- `Screen Recording 2026-11-13 120036.mp4`: 5.9 seconds. The previous website changed service visuals and copy while the robot largely retained one pose.
The second and third files are the actual accessible attachments corresponding to the differently suffixed names in the request. Contact sheets are saved as `evidence/robot-presentation-woow.jpg`, `robot-presentation-tagg.jpg` and `robot-presentation-current.jpg`.

The implementation translates the references' coordinated carriage and presentation into the existing square-screen GLB and Craftech360 composition. It does not import the references' branding, environment or display proportions.

## Joint and transform ownership
The supplied GLB's existing hierarchy, seven source bones, rotary pivots and embedded quaternion animation channels are retained. No robot asset was regenerated or exported. The source clip establishes the baseline joint orientations. Shoulder and elbow offsets are authored per chapter, while the three existing wrist axes compensate for orientation. The physical display's local matrix stays unchanged.

A deterministic wrist seed table is prepared over the authored corridor for desktop and smaller mobile motion. Every runtime frame evaluates from the current scroll position and its corresponding seed, then composes small ambient offsets through the same final transform calculation. It does not warm-start from the previously visited chapter. The base's placement, yaw and uniform scale remain fixed between resizes. Individual links are never translated or scaled. The existing source cable deformation is retained; no connector geometry is added.

Shoulder offsets stay between -.46 and .4 radians; elbow offsets stay between -.88 and .18 radians relative to the source baseline. The source GLB does not encode manufacturer joint-limit or collision metadata. These are conservative visual presentation poses, checked in the running scene, rather than a certified industrial motion plan.

The camera is framed once around the swept reach corridor. The robot remains on the left and above the shared navigation. Wrist travel includes a modest authored tilt; reading poses settle within about three degrees of frontal. Original materials remain, with the existing controlled studio lighting.

## Timeline, copy and screen media
`src/services-config.js` now centralizes each title, exact description, media, destination, shoulder/elbow/wrist target and copy layout. `src/services-timeline.js` supplies reading intervals, eased travel, early text exit, delayed text reveal and the two LED blend weights.

Copy groups have six deliberately authored positions and widths. They leave while still at their own composition; the next composition is already positioned while hidden and appears near the end of arm travel. There is no pointer-driven text positioning or per-frame collision-chasing layout. The swept robot is confined to the left safe zone, leaving clear separation from all visible copy.

The previous fade-to-black chapter transition is replaced by a weighted two-source LED blend. Only the active source, or the two sources participating in a blend, are animated. Their time continues during arm travel and reading intervals. Inactive videos pause, and replaceable image/video entries use the same screen mapping and choreography. Existing square display UVs, bezel, mount and proportions stay intact.

The chromatic-to-amber C travel, assembled display hold and first-service arrival remain in the same shared scene. Returning toward C reverses that spatial/material transition and retains the deferred C re-entry behavior. The single existing fluid effect, buffers and pointer state continue through the full stage. The existing contextual cursor, header, CTA and navigation remain shared.

## Responsive and reduced motion
At 900px and below the services use natural-flow articles below the robot rather than desktop text pinning. Mobile joint offsets are 28% of the desktop deviations from the initial pose. Framing keeps the screen below the header/CTA and the robot above the text/navigation region. Reduced motion selects stable chapter poses with no ambient arm movement, no fluid wake and static procedural frames.

Rendering and media pause offscreen and while the document is hidden. The existing pixel-ratio caps and fluid quality fallback remain. No additional WebGL context, animation framework or runtime dependency was added. The new numerical pose preparation is lazy-loaded below the opening experience.

## Verification
- All 45 Playwright regression scenarios passed in Edge (4.4 minutes), covering the original intro, particle reconstruction, clockwise screen roll, continuous LED/home video, cursor, C hover/re-entry, amber handoff, and the new services presentation.
- A further 41-position motion-corridor sweep passed: screen bounds remained in the safe stage region, and no visible HTML copy overlapped the projected display throughout travel.
- Six distinct projected screen positions, six authored copy compositions, planted base, unchanged link offsets/scales, attached display, front-readable settled orientations, reversible joint values and synchronized media were checked numerically.
- Actual LED screenshot pixels were checked at a mid-transition blend: the display remained lit, with both sources contributing and animation time advancing.
- Forward, backward, fast jumps, PageDown scrolling, resize/reflow, finite sticky release, reduced motion, touch, media replacement and hidden/offscreen suspension passed.
- Production build passed. Production browser checks at 1500, 768, 390 and 320px returned no page, console or resource errors and no horizontal overflow. Shared UI counts remained one each and the official logo decoded.
- Desktop/mobile screenshots and the motion sequence were inspected. The updated services were also opened and inspected in the in-app browser.

`evidence/services-scroll.webm` records all six forward transitions and reverse travel, with pointer movement. `services-final-0.png` through `services-final-5.png` capture the reading poses; `services-final-handoff.png` and `services-final-reverse.png` capture the connection to C. `services-final.json` records all six ordered chapter indices, joint values, intact attachment and continuously increasing fluid step counts, with an empty errors array. `presentation-led-blend.png` and `presentation-mobile-*.png` provide additional checks.

## Remaining dependencies and limits
All six Explore more destinations remain explicitly null because no finished routes were supplied; activation reports that dependency. The media remain clearly scoped procedural placeholders in configuration. Existing missing showreel/demo/navigation destinations remain unchanged. Physical mobile hardware, assistive screen-reader software and a full mesh self-collision solver were not tested. Glass/fluid remain the approved bounded real-time approximations. No deployment was performed.

Relevant installed Animation Tool Router, Design Motion Principles, GSAP Performance, Motion Performance QA, Three.js procedural-animation and Blender core/animation instructions were read. The installed hierarchy already supported the required motion, so Blender preparation was unnecessary. `immersive-web-design` remains unavailable, and React Motion is not applicable to the actual vanilla Three.js/GSAP stack.
