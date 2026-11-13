# Contextual cursor

The cursor enhancement lives in `src/cursor.js`; `CURSOR_STATES` centralizes the labels. Existing controls declare `data-cursor` values in `index.html`. No About Us item was added; its label is reserved for an existing/future mapped link.

A single fixed, aria-hidden, pointer-transparent overlay uses transform-only position and circle scaling, two crossfading label slots, a restrained press response, and a short 38 ms exponential follow. Animation frames stop at rest. Leaving the viewport, keyboard use, modals, intro replay, preference changes and cleanup restore the native cursor. Re-entry snaps to the actual pointer before smoothing resumes. Coarse/touch pointers and reduced-motion users retain the standard cursor.

The optional module loads independently of the main experience. Failed cursor loading leaves the page and native pointer usable. Inputs, editable fields and native media controls are excluded. Event listeners, mutation observer and animation frames are cleaned up on page exit.

## Showreel dependency
No full showreel file/URL exists in the supplied project. `SHOWREEL_SOURCE` in `src/showreel.js` is intentionally null. The background's semantic button opens a labelled native dialog explaining that the film is pending. It supports close, Escape, focus containment and focus return. A discreet background action is visible to touch and keyboard users. Only that button opens the dialog; navigation/control clicks do not.

When the actual film is supplied, set `SHOWREEL_SOURCE` to its asset URL. The same dialog creates a native video with visible controls, no autoplay, and no audio until deliberate playback. The tunnel loop is never used as a substitute. Actual showreel media playback cannot be verified until this dependency is supplied.

Demo booking, Projects, Products, Contact and below-hero destinations remain the existing explicitly pending actions. Intro still replays the approved KUKA sequence.

## Verification
`npx.cmd playwright test tests/cursor.spec.cjs tests/video-arrival.spec.cjs` checks context priority, nested text/SVG, navigation isolation, press/release/cancel, viewport re-entry, modal close/Escape/focus, native inputs, optional-module failure, keyboard/touch/reduced motion, replay/arrival, and continuous background video playback. Local Edge screenshots are stored in ignored `evidence/`. `npm.cmd run build` validates the production bundle. No deployment is part of this change.

Result: all nine targeted cursor/video scenarios passed in local headless Edge. The production build and production smoke check passed with no console, page or resource errors. Cursor styling was visually reviewed over the live landing video. Physical touch hardware and actual full-showreel playback remain untested; no showreel source has been supplied.
