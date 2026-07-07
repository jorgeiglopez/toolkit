# Core Web Vitals patterns

Deep reference for [core-web-vitals/SKILL.md](../SKILL.md).

---

## LCP element identification

```javascript
new PerformanceObserver((list) => {
  const entries = list.getEntries();
  const lastEntry = entries[entries.length - 1];
  console.log('LCP element:', lastEntry.element);
  console.log('LCP time:', lastEntry.startTime);
}).observe({ type: 'largest-contentful-paint', buffered: true });
```

---

## INP patterns

**Heavy event handler: prioritize visual feedback, defer the rest:**
```javascript
// Bad: all work happens inline
button.addEventListener('click', () => {
  const result = calculateComplexThing();
  updateUI(result);
  trackEvent('click');
});

// Good: immediate feedback, deferred work
button.addEventListener('click', () => {
  button.classList.add('loading');
  requestAnimationFrame(() => {
    const result = calculateComplexThing();
    updateUI(result);
  });
  requestIdleCallback(() => trackEvent('click'));
});
```

**Third-party scripts: load lazily, not eagerly:**
```javascript
// Bad: blocks interactions
<script src="https://heavy-widget.com/widget.js"></script>

// Good: loaded on demand
const loadWidget = () => import('https://heavy-widget.com/widget.js').then(w => w.init());
button.addEventListener('click', loadWidget, { once: true });
```

**Excessive re-renders (React):**
```javascript
// Bad: ExpensiveComponent re-renders on every count change
function App() {
  const [count, setCount] = useState(0);
  return <div><Counter count={count} /><ExpensiveComponent /></div>;
}

// Good: memoized
const MemoizedExpensive = React.memo(ExpensiveComponent);
```

**Debugging slow interactions:**
```javascript
new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    if (entry.duration > 200) {
      console.warn('Slow interaction:', {
        type: entry.name, duration: entry.duration, target: entry.target
      });
    }
  }
}).observe({ type: 'event', buffered: true, durationThreshold: 16 });
```

---

## CLS patterns

**Ads, embeds, iframes: reserve space:**
```html
<div style="aspect-ratio: 16/9;">
  <iframe src="https://youtube.com/embed/..." style="width: 100%; height: 100%;"></iframe>
</div>
```

**Dynamically injected content: insert below viewport, or animate in without shifting:**
```javascript
const insertBelow = viewport.bottom < newNotification.top;
if (insertBelow) {
  notifications.prepend(newNotification);
} else {
  newNotification.style.transform = 'translateY(-100%)';
  notifications.prepend(newNotification);
  requestAnimationFrame(() => { newNotification.style.transform = ''; });
}
```

**Web fonts: avoid FOUT-driven shift with `font-display: optional`, or match fallback metrics:**
```css
@font-face {
  font-family: 'Custom';
  src: url('custom.woff2') format('woff2');
  font-display: swap;
  size-adjust: 105%;      /* match fallback size */
  ascent-override: 95%;
  descent-override: 20%;
}
```

**Animations: animate `transform`, not layout properties:**
```css
/* Bad */
.animate { transition: height 0.3s, width 0.3s; }

/* Good */
.animate { transition: transform 0.3s; }
.animate.expanded { transform: scale(1.2); }
```

**Debugging layout shifts:**
```javascript
new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    if (!entry.hadRecentInput) {
      console.log('Layout shift:', entry.value);
      entry.sources?.forEach(source => console.log('  Shifted element:', source.node));
    }
  }
}).observe({ type: 'layout-shift', buffered: true });
```

---

## Other frameworks

**React (no Next.js):**
```jsx
// LCP
<link rel="preload" href="/hero.jpg" as="image" fetchpriority="high" />

// INP
const [isPending, startTransition] = useTransition();
startTransition(() => setExpensiveState(newValue));

// CLS: always specify width/height on img tags
```

**Vue/Nuxt:**
```vue
<!-- LCP -->
<NuxtImg src="/hero.jpg" preload loading="eager" />

<!-- INP -->
<component :is="() => import('./Heavy.vue')" />

<!-- CLS -->
<img :style="{ aspectRatio: '16/9' }" />
```
