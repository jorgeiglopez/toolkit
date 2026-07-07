# Performance patterns

Deep reference for [performance/SKILL.md](../SKILL.md). Copy-paste-ready code for less common but still important optimizations.

---

## Responsive images

```html
<picture>
  <!-- AVIF for modern browsers -->
  <source
    type="image/avif"
    srcset="hero-400.avif 400w, hero-800.avif 800w, hero-1200.avif 1200w"
    sizes="(max-width: 600px) 100vw, 50vw">

  <!-- WebP fallback -->
  <source
    type="image/webp"
    srcset="hero-400.webp 400w, hero-800.webp 800w, hero-1200.webp 1200w"
    sizes="(max-width: 600px) 100vw, 50vw">

  <!-- JPEG fallback -->
  <img
    src="hero-800.jpg"
    srcset="hero-400.jpg 400w, hero-800.jpg 800w, hero-1200.jpg 1200w"
    sizes="(max-width: 600px) 100vw, 50vw"
    width="1200"
    height="600"
    alt="Hero image"
    loading="lazy"
    decoding="async">
</picture>
```

## Variable fonts

```css
/* One file instead of multiple weights */
@font-face {
  font-family: 'Inter';
  src: url('/fonts/Inter-Variable.woff2') format('woff2-variations');
  font-weight: 100 900;
  font-display: swap;
}
```

## Service worker caching

Cache-first for static assets:
```javascript
self.addEventListener('fetch', (event) => {
  if (event.request.destination === 'image' ||
      event.request.destination === 'style' ||
      event.request.destination === 'script') {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        return cached || fetch(event.request).then((response) => {
          const clone = response.clone();
          caches.open('static-v1').then((cache) => cache.put(event.request, clone));
          return response;
        });
      })
    );
  }
});
```

## Runtime performance

**Avoid layout thrashing** (batch DOM reads, then writes):
```javascript
// Bad: forces a reflow per iteration
elements.forEach(el => {
  const height = el.offsetHeight; // read
  el.style.height = height + 10 + 'px'; // write
});

// Good: all reads, then all writes
const heights = elements.map(el => el.offsetHeight);
elements.forEach((el, i) => {
  el.style.height = heights[i] + 10 + 'px';
});
```

**Debounce expensive handlers:**
```javascript
function debounce(fn, delay) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
}
window.addEventListener('scroll', debounce(handleScroll, 100));
```

**Use `requestAnimationFrame` for animation**, not `setInterval`:
```javascript
function animate() {
  // animation logic
  requestAnimationFrame(animate);
}
requestAnimationFrame(animate);
```

**Virtualize long lists** (render only visible items). Use `react-window`, `vue-virtual-scroller`, or native CSS:
```css
.virtual-list {
  content-visibility: auto;
  contain-intrinsic-size: 0 50px; /* estimated item height */
}
```

## Third-party scripts

**Delay until interaction or visibility:**
```javascript
document.addEventListener('DOMContentLoaded', () => {
  const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      const script = document.createElement('script');
      script.src = 'https://widget.example.com/embed.js';
      document.body.appendChild(script);
      observer.disconnect();
    }
  });
  observer.observe(document.querySelector('#widget-container'));
});
```

**Facade pattern** (static placeholder until interaction):
```html
<div class="youtube-facade" data-video-id="abc123" onclick="loadYouTube(this)">
  <img src="/thumbnails/abc123.jpg" alt="Video title">
  <button aria-label="Play video">Play</button>
</div>
```
