# Product studio lighting

Replaces the radial/oval receiver treatment for DNA, Orbit, Matrix and Helix. Runtime changes are confined to `src/product-studio-lighting.js`, `src/product-shadows.js` and their integration in `src/products-experience.js`. Pre-edit files are in `evidence/product-studio/checkpoint/`.

## Lighting

One shared rig uses a large neutral upper front-left RectAreaLight (5 × 6 normalized units), a weaker rear-right strip (2.5 × 5), minimal hemisphere fill and a very weak amber rear edge. Lights orient relative to each product's approved hero direction; cameras are not moved. Product-specific key/rim/fill/reflection profiles are in `product-studio-lighting.js`. Existing studio environment maps and product-specific chrome/mirror reflection maps remain in use. Materials, emission, video textures, UVs and the renderer's existing exposure remain unchanged.

Three.js r187 WebGL RectAreaLight does not cast shadows. A directional shadow key is colocated/aligned with the large softbox and contributes controlled direct product lighting. The actual GLB meshes cast one bounded depth map. No new canvas or rendering loop. LTC area-light lookup tables use the installed Three.js addon; no new dependency.

## Floor and shadows

The floor is a 200 × 200 matte plane at each normalized GLB's actual minimum Y minus .00025. It has no radial mask, footprint alpha, ellipse, light-pool texture, mirror component or emissive graphic. Its low albedo is #282828 sRGB (about 2.1% linear reflectance), roughness 1 and specular intensity 0. The visible floor illumination comes from the physical softboxes and their distance falloff. Floor-only shader adjustments exclude the directional proxy's uniform illumination, hemisphere fill and environment diffuse contribution, allowing the distant floor to disappear into black without a horizon band. These exclusions do not affect products or LED materials.

The geometry depth map attenuates floor softbox illumination. Its receiver filter stays tight around the supports and broadens outward for the directional cast shadow. This is a real-time filtered area-shadow approximation using an aligned directional map, not ray-traced area-light shadows. Shadow framing remains fixed through the full motion envelope, with 2048 maps / 30 Hz desktop and 1024 / 20 Hz small-screen quality. Rendering and lifetime management reuse the existing owner.

## Actual verification

- Local Edge 1440 × 900: visually inspected all four full-reveal compositions and moving DNA blocks, Orbit gyro orientations, Matrix panel positions, and Helix closed/open poses. Inspected contact beneath wheels/bases, softened cast shadows, chrome highlights, dark mechanical edges, LED detail and black floor blending.
- Recorded complete live motion cycles with 20 quarter-cycle samples and no browser/shader errors. That lighting review recording precedes the final floor-albedo-only tuning; final `after-*.png`, `*-phase-*.png` and `mobile-orbit.png` captures reflect the final code.
- All seven product/shadow regression tests passed. After the final floor tuning, all three targeted shadow tests passed again: eight sampled phases per product, stable floor height, bounded shadow frusta and updates, aligned key/shadow positions, low fill, mobile quality, product switching, offscreen suspension and unchanged camera/media/kinetic-controller baselines. Broader suite also checked reverse/fast scrolling, resizing, reduced-motion posters and failed-model fallback. Final production build passed.
- Final performance comparison is in `evidence/product-studio/profile.json`: 120 warmed browser-frame intervals per product for both saved previous lighting and studio lighting, with render CPU submission samples. These are browser RAF and CPU measurements, not GPU timer-query data or a physical-device FPS guarantee.
- Reviewed 390 × 844 Orbit emulation. No physical-phone, Safari or Firefox verification. No deployment performed.

Supporting browser scripts: `tools/capture-product-studio.cjs`, `tools/record-product-studio.cjs`, `tools/profile-product-studio.cjs`.
