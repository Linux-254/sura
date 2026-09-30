# SURA performance and responsive acceptance

Date: 2026-09-30

## Bundle measurement

Production Vite build, measured with `gzip -9`:

| Asset | Baseline | Current | Change |
|---|---:|---:|---:|
| Initial JavaScript entry | 170,618 bytes gzip | 143,687 bytes gzip | **-15.8%** |
| Deferred GSAP chunk | included in initial entry | 27,467 bytes gzip | loaded only on capable devices |
| CSS | 9,322 bytes gzip | 9,322 bytes gzip | unchanged |

The total capable-device JavaScript remains within the `<200 KB gzip` budget, while low-power devices receive only the 143.7 KB initial entry and do not request the GSAP chunk.

## Runtime changes

- GSAP is loaded through a dynamic import only when the device is not low-power and the user has not requested reduced motion.
- Low-power detection uses `hardwareConcurrency`, `deviceMemory`, `saveData`, and slow connection hints.
- Route transitions use a short compositor-only CSS transform animation instead of a per-route GSAP DOM tween.
- Low-power glass surfaces remove expensive `backdrop-filter` work and use lighter shadows.
- The 320px / short-height hero has a tighter rhythm so the primary CTA clears the fixed mobile navigation.
- Reduced-motion mode removes route and loader animation while preserving content and navigation.

## Acceptance matrix

Executed with headless Chromium through the Chrome DevTools Protocol.

Viewports:

- 320 × 568
- 360 × 800
- 375 × 667
- 390 × 844
- 412 × 915
- 430 × 932
- 768 × 1024

Normal-device run: **7/7 passed**.

Throttled low-power run (`deviceMemory=2`, `hardwareConcurrency=2`, CPU throttle 6×): **7/7 passed**.

Each run checked:

- no horizontal overflow;
- mobile bottom-nav visibility below 640px;
- tablet header-nav visibility at 768px;
- Explore route renders from mobile bottom nav or tablet header nav;
- route animation starts and settles;
- mobile menu opens with `aria-expanded="true"` and visible animated panel;
- reduced-motion route and loader behavior;
- loader completes without blocking the page.

## Commands

```bash
pnpm check
pnpm build
pnpm test
```

The executable QA harness used for this pass is kept in the temporary sandbox at `/tmp/sura-responsive-qa.mjs` and is not part of the application bundle.
