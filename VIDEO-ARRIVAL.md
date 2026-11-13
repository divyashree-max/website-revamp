# Tunnel video landing arrival

## Scope
The approved KUKA joint animation, camera path, timing, model, particle formation, floor and lighting are preserved. This update changes the LED content while the screen is fully dissolved, before solid reconstruction and the landing interface.

## Playback and transition
- One muted, inline HTML video uses the supplied original 1920 × 1080, 10-second clip (`public/assets/tunnel.mp4`). The file is copied without transcoding or recoloring.
- Three.js samples this same element through VideoTexture. Playback preparation begins at authored time 11.5 as dissolution starts. The LED changes from logo to video at time 14, when all solid surfaces are gone. The particle-only shape holds before surfaces return at 19–21 with video already playing. The logo never returns during reconstruction or camera entry.
- The square display uses a centred cover crop. During the approved final approach, crop coordinates interpolate to match viewport cover. Landing arrival reveals the same HTML video without changing currentTime or loading a new player.
- Only the video loops. The intro retains per-tab completion and explicit Intro replay. Three.js animation/rendering stops on arrival.
- Autoplay rejection or delayed decoding uses an extracted still poster and never traps the intro. Pause/play is keyboard accessible. Reduced motion skips spatial animation and starts with a still image; video playback is opt-in.

## Interface
Frame 62 supplies the layout: original logo at viewport centre, amber Book a Demo at upper right, four lower-left navigation controls, and an outlined down-arrow/Scroll To Explore control below. UI fades in only on arrival.
On narrow screens the logo stays centred and the CTA moves to the next row. Font family is centralized in `--font-interface`; the existing PolySans Neutral is used pending final font selection.

## Pending dependencies
Demo booking, Projects, Products, Contact and below-hero content have no existing destinations in this project. Controls show Pending and explain the dependency when activated. Intro replays the existing sequence. No URLs, contact details or extra sections were invented.

## Verification
Run `npm.cmd run dev`, then `npx.cmd playwright test`. `npm.cmd run build` produces the production bundle.
New tests in `tests/video-arrival.spec.cjs` cover complete playback, a real loop wrap with decoded frames available, continuous shared playback time, responsive UI, pause/play, reduced motion, autoplay rejection and navigation feedback. Existing rig/camera checks continue to validate the approved mechanics. Local screenshots and boundary frames are stored under ignored `evidence/`.
The original clip's final/initial frames were visually reviewed; no black frame or playback pause was observed across the loop. Desktop Edge is the tested runtime; physical iOS/Android hardware remains untested.
Browser Use was invoked, but its remote browser could not reach this machine's localhost (connection refused). Local Edge/Playwright supplied browser validation instead. Production preview was checked locally with no resource, console or page errors.

No deployment was performed.

Final validation: all 19 Playwright scenarios passed. After the final projected-coverage crop refinement, the six affected display/rig/accessibility checks passed again. The final production build and smoke check passed with no page, console or resource errors. Central handoff comparison with paused video measured approximately 2.06/255 mean channel difference, consistent with differing WebGL/browser video filtering. The existing renderer chunk-size warning remains. The original video is 62.4 MB and has not been compressed.


## Corrected concealed LED switch
The logo remains on the visible LED throughout dissolution. The shared video starts preparing at the dissolve cue (11.5), and replaces the LED identity only at the fully dissolved swarm cue (14). Reconstruction (19–21), screen entry and landing use that continuous video source; the separate header logo is unchanged. Five updated Edge checks passed, including the full sequence/loop, concealed switch, reconstruction with live video, continuous handoff, responsive UI, reduced motion and autoplay recovery. Normal loopback connections timed out in this environment, so verification used the exact local assets through Playwright request routing (LOCAL_ASSET_ROUTE=1). The build passed and the reconstruction screenshot was visually reviewed. No console errors were recorded in the normal playback checks.
