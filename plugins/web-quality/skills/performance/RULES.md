---
name: performance
lastUpdate: 2026-07-04 00:00
---

# Rules
- Prioritize findings by Core Web Vitals impact, not raw issue count. Defer metric-specific fixes to `core-web-vitals`.
- Keep the Next.js quick-fixes section in SKILL.md, it's the user's primary stack.
- Runtime performance, third-party script loading, service worker caching, and the full responsive-image example live in `references/patterns.md`, not inline in SKILL.md.
- Budget numbers (page weight, JS/CSS/image/font/third-party KB targets) are fixed reference values, don't restate them differently across skills.
- Framework-agnostic first: give the plain HTML/JS/CSS fix, then the Next.js-specific shortcut where one exists.
