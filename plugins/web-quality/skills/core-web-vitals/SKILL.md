---
name: core-web-vitals
description: Optimize Core Web Vitals (LCP, INP, CLS) for page experience and search ranking. Use when asked to improve Core Web Vitals, fix LCP, reduce CLS, optimize INP, or fix layout shifts.
---

# Core Web Vitals optimization

Targeted optimization for the three Core Web Vitals metrics that affect Google Search ranking and user experience. For broader loading/runtime work, see [performance](../performance/SKILL.md).

## The three metrics

| Metric | Measures | Good | Needs work | Poor |
|--------|----------|------|------------|------|
| **LCP** | Loading | ≤ 2.5s | 2.5s - 4s | > 4s |
| **INP** | Interactivity | ≤ 200ms | 200ms - 500ms | > 500ms |
| **CLS** | Visual stability | ≤ 0.1 | 0.1 - 0.25 | > 0.25 |

Google measures at the 75th percentile: 75% of page visits must meet "Good" thresholds.

---

## LCP: Largest Contentful Paint

When the largest visible element renders (usually a hero image/video, large text block, or background image).

**Common causes and fixes:**
- Slow server response (TTFB > 800ms): CDN, caching, edge rendering.
- Render-blocking resources: inline critical CSS, defer the rest.
- Slow-loading LCP resource: preload it with high priority.
  ```html
  <link rel="preload" href="/hero.webp" as="image" fetchpriority="high">
  <img src="/hero.webp" alt="Hero" fetchpriority="high">
  ```
- Client-side rendering delay: render the LCP element server-side or statically, not after a `useEffect` fetch.

**Checklist:** TTFB < 800ms · LCP image preloaded with `fetchpriority="high"` · image optimized (WebP/AVIF, correct size) · critical CSS inlined (< 14KB) · no render-blocking JS in `<head>` · fonts use `font-display: swap` · LCP element present in initial HTML, not JS-rendered.

Script to identify your actual LCP element: [references/patterns.md](references/patterns.md#lcp-element-identification).

---

## INP: Interaction to Next Paint

Measures responsiveness across all interactions (clicks, taps, key presses); reports the worst one. Total INP = Input Delay + Processing Time + Presentation Delay (targets: < 50ms / < 100ms / < 50ms).

**Most common cause: long tasks blocking the main thread.**
```javascript
// Bad: one long synchronous task
items.forEach(item => expensiveOperation(item));

// Good: chunk and yield
async function processLargeArray(items) {
  const CHUNK_SIZE = 100;
  for (let i = 0; i < items.length; i += CHUNK_SIZE) {
    items.slice(i, i + CHUNK_SIZE).forEach(item => expensiveOperation(item));
    await new Promise(r => setTimeout(r, 0)); // yield to main thread
  }
}
```

Also watch for: heavy event handlers doing DOM work + analytics synchronously (give immediate visual feedback, defer the rest with `requestIdleCallback`), eagerly-loaded third-party scripts, and excessive React/Vue re-renders on unrelated state changes.

**Checklist:** no task > 50ms on main thread · handlers complete in < 100ms · visual feedback is immediate · heavy work deferred via `requestIdleCallback` · third-party scripts don't block interactions · Web Workers for CPU-heavy operations.

Full examples (heavy handlers, third-party scripts, re-render memoization) and a debugging script: [references/patterns.md](references/patterns.md#inp-patterns).

---

## CLS: Cumulative Layout Shift

Unexpected shifts in visible elements between frames, without user interaction. Formula: impact fraction × distance fraction.

**Most common cause: images without reserved dimensions.**
```html
<!-- Bad: shifts when the image loads -->
<img src="photo.jpg" alt="Photo">

<!-- Good: space reserved -->
<img src="photo.jpg" alt="Photo" width="800" height="600">
```

Also watch for: ads/iframes/embeds without a min-height container, content injected above existing content, web fonts causing FOUT/FOIT, and animations that change layout properties instead of `transform`/`opacity`.

**Checklist:** all images/videos/embeds have width/height or `aspect-ratio` · ads have min-height containers · fonts use `font-display: optional` or matched fallback metrics · dynamic content inserts below viewport · animations use `transform`/`opacity` only.

Full examples (embeds, dynamic content, font metric overrides, animations) and a debugging script: [references/patterns.md](references/patterns.md#cls-patterns).

---

## Next.js quick fixes

```jsx
// LCP: next/image handles priority, sizing, and format negotiation
import Image from 'next/image';
<Image src="/hero.jpg" priority fill alt="Hero" />

// INP: skip hydrating heavy client-only components until needed
const HeavyComponent = dynamic(() => import('./Heavy'), { ssr: false });

// CLS: next/image requires width/height or fill, so shift is prevented by default
```

React (no Next.js) and Vue/Nuxt equivalents: [references/patterns.md](references/patterns.md#other-frameworks).

## Measurement

- **Lab:** Chrome DevTools Performance panel, Lighthouse, WebPageTest.
- **Field:** Chrome UX Report (CrUX), Search Console's Core Web Vitals report, or the `web-vitals` library sent to your own analytics.

```javascript
import {onLCP, onINP, onCLS} from 'web-vitals';
function sendToAnalytics({name, value, rating}) {
  gtag('event', name, { event_category: 'Web Vitals', value, event_label: rating });
}
onLCP(sendToAnalytics); onINP(sendToAnalytics); onCLS(sendToAnalytics);
```

## References

- [web.dev LCP](https://web.dev/articles/lcp) · [INP](https://web.dev/articles/inp) · [CLS](https://web.dev/articles/cls)
- [performance/SKILL.md](../performance/SKILL.md)
