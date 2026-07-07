---
name: core-web-vitals
lastUpdate: 2026-07-04 00:00
---

# Rules
- Scope is strictly LCP/INP/CLS. Broader loading/runtime optimization belongs in `performance`, link out rather than duplicating.
- Google's thresholds (LCP ≤2.5s, INP ≤200ms, CLS ≤0.1) are measured at the 75th percentile; don't quote single-visit numbers as if they were the ranking signal.
- Keep the Next.js quick-fixes section prominent in SKILL.md, it's the user's primary stack. React/Vue equivalents live in `references/patterns.md`.
- Debugging scripts (PerformanceObserver snippets) and the multi-case examples (heavy handlers, third-party scripts, re-renders, embeds, dynamic content, font metrics, animations) live in `references/patterns.md`, not inline.
- Each metric section leads with its single most common real-world cause before listing the rest.
