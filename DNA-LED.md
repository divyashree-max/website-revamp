> Latest targeted correction: immediate full-view counter-rotation, continuous cycle seams and explicitly selected chrome base/support surfaces. See [DNA-TARGETED-CORRECTIONS.md](DNA-TARGETED-CORRECTIONS.md). Earlier timing notes below are historical.

# DNA LED video and kinetic movement — 13 November 2026

## Scope
DNA only. Orbit, Matrix and Helix sources, camera configurations, materials and posters are unchanged. The existing intro, home, crystalline C, services, shared UI and fluid effect are retained. The original DNA GLB is unchanged and has the same SHA-256 as the attachment.

## Reference and hierarchy inspection
Inspected 24 frames distributed across the complete 13.5-second download (4).mp4 recording. It shows coordinated staggered turns around a vertical spindle, changing block alignment and a return to a continuous assembled display. Its text, imagery and environment were not reused.

The source DNA hierarchy is flat: 28 meshes, no animation clips. Inspection identified six housings, six front panels, six rear panels, one vertical spindle, a base and wheel assemblies. Each housing and its two panels are grouped into a rigid block at runtime using the original spindle axis, preserving world appearance. The measured reparenting error is approximately 1.3e-15. No Blender repair, extra connectors, mesh stretching or fabricated mechanism is used.

Top-to-bottom block membership and source-unit pivots are explicit in src/dna-config.js. Axis is local Y through the actual Cylinder.014 center. Base, wheels and spindle stay in the fixed source hierarchy.

## One video composition
- One shared muted, inline, looping HTML video and one VideoTexture supply all twelve outward LED faces (six front, six rear).
- Only the two outward-facing triangles of each panel box use the video material. Panel edges, housings, spindle, wheels and base retain their original materials.
- UVs are calculated once from the assembled display's source-space coordinates. The complete portrait display bounds determine a single centered cover crop. Physical gaps remain missing portions of that same composition, as in a real video wall.
- Front panels use source X left-to-right and source Y bottom-to-top. Rear panels compensate X direction so the image is upright and unmirrored when viewed from behind. Each side forms its own coherent six-block display using the same playback frame.
- The crop occupies approximately 26.12% of the source width and all its height. Focal X/Y and zoom are configurable. UVs never use changing world positions during motion.
- The display uses restrained unlit emissive-style output independent of studio lights, with brightness 0.94 and no new bloom or recoloring. Original source colors remain.
- A numbered 1–6 diagnostic verified front/rear ordering, orientation and physical alignment; it is disabled in the final view. QA captures: evidence/dna-test-uv-front.png and dna-test-uv-back.png.

## Motion and lifecycle
The existing scroll-driven camera reveal is unchanged. Blocks remain aligned until the full-product camera is established, then hold briefly before beginning a coordinated rotary wave. The authored sequence includes an exact aligned interval between waves and at the cycle boundary. The 15.4-second cycle uses a top-to-bottom positive sweep and a restrained reverse sweep; timing, stagger and amplitudes are configurable.

A single DNA clock and transform calculation own all six pivots. The camera remains scroll-controlled. Moving back into the reveal blends the offset out; leaving the chapter resets the hidden rig cleanly and pauses video. Returning starts the coordinated block sequence from alignment. Video time is never manually reset during motion or camera travel. Hidden tabs pause rendering and playback. Cache eviction disposes video callbacks, media, textures and geometry resources. No new animation RAF or WebGL context is added.

Reduced motion keeps blocks aligned and uses a mapped still. The DNA assembled fallback preview was captured from that actual model and texture. Autoplay rejection uses the poster without blocking the chapter or following products.

## Video encoding
Original retained at assets-originals/dna-tunnel.mov: 17,919,500 bytes, 1920×1080, 60fps, 10 seconds. Its non-square SAR is 16:15; the derivative normalizes that display aspect to square pixels rather than silently stretching it to 16:9.

Selected public/assets/products/dna-tunnel.mp4:
- 1366×720 square pixels, 30fps, 10 seconds.
- H.264, yuv420p, CRF 24, slow preset; audio removed.
- Fast-start metadata verified before media data.
- **4,341,394 bytes (4.34 MB), approximately 75.8% smaller than the original.**

Compared against a 2048×1080/30fps CRF24 version (7.96 MB) and a 1366×720/60fps CRF23 version (5.45 MB). Inspected full frames, tunnel detail and dark gradients. The selected version retains useful detail at the rendered LED size; it is not claimed lossless. The portrait crop contains about 357 source pixels across, sufficient for the approximately 220-pixel desktop LED width.

The end/start frame difference was comparable to an ordinary adjacent-frame difference (mean RGB differences 17.22 versus 16.24). Two actual video wraps were observed during the kinetic recording, without a visible black flash or pause. No artificial crossfade/restart was added, and this is an observation rather than a claim that every possible viewing condition is perfectly seamless.

## Verification
- Production build passes.
- Eight targeted DNA/product tests passed: single crop/one player, front/rear regions, rigid block membership, stationary base/spindle, exact reassembly, fixed UVs, live video continuity, unchanged camera, chapter exit/re-entry, no duplicate players, hidden-tab pause, reduced motion and autoplay failure. Existing four-product behavior is included.
- All 53 browser regression tests passed (5.3 minutes), covering the approved intro, LED/home handoff, C, services, cursor, products and DNA.
- Production checks at desktop, tablet, 390px and 320px, including reduced motion: no captured asset/console errors or horizontal overflow. All four products remain usable.
- Actual live motion recorded through two video loops. Reassembly samples at clock 8.2, 14.3 and 23.6 seconds have zero angular/rest error; fixed source matrices and UVs remain unchanged throughout.
- No diagnostic texture appears in the final recording.

Recording: evidence/dna-led-kinetic.mp4 (24.22-second trimmed presentation); raw capture: evidence/dna-led-kinetic.webm. Detailed state: evidence/dna-recording-checks.json. Encoding metadata: evidence/dna-video-encode.json. Full-motion contact sheet: evidence/robot-presentation-dna-completed.jpg.

## Limits
The reference's staggered rotation language is adapted to bounded, connected yaw motion on the supplied six-block model, not claimed as an exact mechanical simulation or manufacturer-certified motion plan. Physical low-end hardware was not available for testing. Video autoplay policies can vary; the static poster fallback is verified. Other products and existing pending service destinations remain as before. No deployment was performed.
