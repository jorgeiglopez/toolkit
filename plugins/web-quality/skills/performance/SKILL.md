---
name: performance
description: Optimize web page loading speed and runtime performance. Use when asked to speed up a site, optimize performance, reduce load time, fix slow loading, improve page speed, or run a performance audit.
---

# Performance optimization

Loading speed, runtime efficiency, and resource optimization. Based on Lighthouse performance audits. For LCP/INP/CLS specifics, see [core-web-vitals](../core-web-vitals/SKILL.md).

## How it works

1. Identify performance bottlenecks in code and assets.
2. Prioritize by impact on Core Web Vitals.
3. Provide specific optimizations with code examples.
4. Measure improvement with before/after metrics.

## Performance budget

| Resource | Budget | Rationale |
|----------|--------|-----------|
| Total page weight | < 1.5 MB | 3G loads in ~4s |
| JavaScript (compressed) | < 300 KB | Parsing + execution time |
| CSS (compressed) | < 100 KB | Render blocking |
| Images (above-fold) | < 500 KB | LCP impact |
| Fonts | < 100 KB | FOIT/FOUT prevention |
| Third-party | < 200 KB | Uncontrolled latency |

## Critical rendering path

**Server response:** TTFB < 800ms via CDN, caching, efficient backends. Enable Brotli/Gzip compression. Use HTTP/2 or HTTP/3.

**Preconnect and preload:**
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preload" href="/hero.webp" as="image" fetchpriority="high">
<link rel="preload" href="/font.woff2" as="font" type="font/woff2" crossorigin>
```

**Defer non-critical CSS:** inline critical above-fold CSS, load the rest with `<link rel="preload" as="style" onload="this.rel='stylesheet'">` plus a `<noscript>` fallback.

## JavaScript optimization

```html
<script defer src="/app.js"></script>   <!-- preferred: parses in order, runs after DOM -->
<script async src="/analytics.js"></script>   <!-- independent scripts only -->
```

Code splitting (route/component/feature based):
```javascript
const Dashboard = lazy(() => import('./Dashboard'));
```

Tree shaking: import only what you need (`import debounce from 'lodash/debounce'`, not the whole library).

Runtime performance (layout thrashing, debouncing, `requestAnimationFrame`, list virtualization): see [references/patterns.md](references/patterns.md#runtime-performance).

## Image optimization

| Format | Use case | Browser support |
|--------|----------|-----------------|
| AVIF | Photos, best compression | 92%+ |
| WebP | Photos, good fallback | 97%+ |
| PNG | Graphics with transparency | Universal |
| SVG | Icons, logos, illustrations | Universal |

```html
<!-- Above-fold LCP image: eager, high priority -->
<img src="hero.webp" fetchpriority="high" loading="eager" decoding="sync" alt="Hero">

<!-- Below-fold: lazy -->
<img src="product.webp" loading="lazy" decoding="async" alt="Product">
```

Full responsive `<picture>` example with AVIF/WebP/JPEG fallbacks and `srcset`: [references/patterns.md](references/patterns.md#responsive-images).

## Font optimization

```css
@font-face {
  font-family: 'Custom Font';
  src: url('/fonts/custom.woff2') format('woff2');
  font-display: swap; /* or optional for non-critical */
  unicode-range: U+0000-00FF; /* subset */
}
```
Preload critical fonts: `<link rel="preload" href="/fonts/heading.woff2" as="font" type="font/woff2" crossorigin>`. Prefer variable fonts to avoid shipping multiple weights.

## Caching strategy

```
Cache-Control: public, max-age=31536000, immutable   # hashed static assets
Cache-Control: public, max-age=86400, stale-while-revalidate=604800   # unhashed static
Cache-Control: no-cache, must-revalidate   # HTML
```
Service worker cache-first pattern for static assets: [references/patterns.md](references/patterns.md#service-worker-caching).

## Third-party scripts

Load async or defer until interaction/visibility; use a facade (static thumbnail + click-to-load) for embeds like YouTube widgets. Patterns: [references/patterns.md](references/patterns.md#third-party-scripts).

## Next.js quick fixes

```jsx
import Image from 'next/image';
import { Inter } from 'next/font/google';
import dynamic from 'next/dynamic';

// Images: automatic AVIF/WebP, srcset, lazy loading, and CLS-safe sizing
<Image src="/hero.jpg" priority fill alt="Hero" />

// Fonts: self-hosted, zero layout shift, no external request
const inter = Inter({ subsets: ['latin'], display: 'swap' });

// Code splitting: skip SSR for client-only heavy components
const HeavyChart = dynamic(() => import('./HeavyChart'), { ssr: false });

// Scripts: strategy controls when third-party JS loads
import Script from 'next/script';
<Script src="https://widget.example.com/embed.js" strategy="lazyOnload" />
```
Set immutable caching for hashed build assets and short/no-cache for HTML via `next.config.js` `headers()` or your CDN/edge config.

## Measurement

| Metric | Target | Tool |
|--------|--------|------|
| LCP | < 2.5s | Lighthouse, CrUX |
| FCP | < 1.8s | Lighthouse |
| Speed Index | < 3.4s | Lighthouse |
| TBT | < 200ms | Lighthouse |
| TTI | < 3.8s | Lighthouse |

```bash
npx lighthouse https://example.com --output html --output-path report.html
```
```javascript
import {onLCP, onINP, onCLS} from 'web-vitals';
onLCP(console.log); onINP(console.log); onCLS(console.log);
```
