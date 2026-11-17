# Stories approved-baseline repair — 17 November 2026

Completed a focused repair. Only runtime files changed from the saved starting state: src/stories-orbit.js, src/stories-stage.js, src/stories-surface.js. All other source files match the backup byte-for-byte.

## Recovery and reference

Saved the entire current source/test/tool state and working-tree patch before editing in evidence/stories-approved-repair/current-state-20261117-124419/.

No versioned Stories checkpoint was available in Git/local editor history. Recovered the approved behavior by reversing the later shared horizontal recentering curve and restoring the original innerWidth camera sizing. Reconstructed baseline source is retained in evidence/stories-approved-repair/restored-baseline/src/.

The exact attachment filenames supplied in the brief were not present locally. Matched the local Windows recordings by embedded UTC creation metadata and visible content:

- Screen Recording 2026-11-17 121302.mp4: creation 06:42:25 UTC, 37.60 seconds, 1158 × 826; corresponds closely to the approved 06:42:21 attachment.
- Screen Recording 2026-11-17 122815.mp4: creation 06:58:04 UTC, 11.20 seconds, 1150 × 822; corresponds closely to the rejected 06:58:00 attachment.

Both were inspected as contact sheets and enlarged frames. Their association with the supplied attachment names is an inference, not a recovered file identity. The source/baseline/repair comparison shows the actual approved recording frame at 20 seconds on the left, reconstructed baseline in the middle, repaired orientation on the right. Video time is independent of scroll progress, so video content is not frame-synchronized.

## Correction

The approved authored positions, depth, camera, dimensions, timing, spacing and interpolation are unchanged. An exact comparison of 8,816 card poses across 2,204 scene states against the restored baseline reported zero trajectory mismatches.

Moved only the existing straightening envelope along that path. Solve the authored upright plane's final projected horizontal midpoint against the header logo midpoint, using the actual CSS canvas bounds (including scrollbar and parent translation/scaling). For the normal centered canvas, the focal phase is 0.4269360282353659, rather than 0.5. Rotation X/Y/Z and effective bend are zero there. Retained the existing quintic approach/departure and single native-scroll update loop. No horizontal hold, recentering, competing transform writer or scroll snapping was added.

Updated semantic hit-region projection to use the actual CSS canvas dimensions while retaining the approved rendering camera. Choose-a-story navigation now selects the corrected viewing point. Video, caption surface geometry, media clocks, cursor and player implementation are unchanged.

## Verification

- Production build passed. Eighteen focused Stories tests passed; the obsolete recentering regression test was replaced with an approved-path assertion and passed separately.
- Rendered and captured all four crossings forward and backward; checked zero rotations/bend and attached captions. Largest measured card midpoint error in the recorded 1158 × 826 pass: 0.3359375 CSS pixels.
- Browser checks at 1500 × 708, 1158 × 826, 1440 × 900 and 390 × 844. Also checked a visible native scrollbar and translated/scaled parent.
- Before/after samples confirmed continuous lateral motion, fixed physical 4:5 proportions, smooth rotation changes and deterministic reversal. Intermediate stops and velocity settling passed the deformation checks; videos continued advancing while stationary.
- Visually inspected crossing sheet, matched baseline/repair compositions, actual approved recording comparison, forward/reverse motion contact sheet, mobile and wide screenshots, hover cursor and open player. Caption stays inside its card, including the long ELECRAMA title. Escape closes the player. No page or console errors during recording.
- Recording: evidence/stories-approved-repair.mp4. Detailed captures and measurements: evidence/stories-approved-repair/.

## Limits and remaining differences

The intended difference from the approved baseline is earlier straightening at the logo crossing and correspondingly earlier return to the approved perspective. The independent video playback clocks produce different imagery in comparison captures. The approved innerWidth camera behavior is retained even where a native scrollbar slightly changes the CSS projection aspect. No physical mobile device, Safari or Firefox check was performed; desktop/mobile checks used Edge browser viewports. No claim of measured 60 FPS is made. The exact attachment filenames/checkpoint were unavailable, as explained above.
