---
name: accessibility
description: Audit and improve web accessibility against WCAG 2.2. Use when asked to improve accessibility, run an a11y audit, check WCAG compliance, add screen reader support, fix keyboard navigation, or make a page accessible.
---

# Accessibility (a11y)

Goal: make content usable by everyone, including people with disabilities. Based on WCAG 2.2 and Lighthouse accessibility audits.

## WCAG principles: POUR

| Principle | Description |
|-----------|-------------|
| **P**erceivable | Content can be perceived through different senses |
| **O**perable | Interface can be operated by all users |
| **U**nderstandable | Content and interface are understandable |
| **R**obust | Content works with assistive technologies |

## Conformance levels

| Level | Requirement | Target |
|-------|-------------|--------|
| **A** | Minimum accessibility | Must pass |
| **AA** | Standard compliance | Should pass (legal requirement in many jurisdictions) |
| **AAA** | Enhanced accessibility | Nice to have |

Full criteria list by level: [references/WCAG.md](references/WCAG.md).

---

## Perceivable

- **Text alternatives:** every `<img>` needs `alt`; decorative images use `alt=""`. Icon-only buttons need an accessible name via `aria-label` or visually-hidden text. Patterns: [icon buttons](references/A11Y-PATTERNS.md#icon-button-accessible-name), [visually-hidden CSS](references/A11Y-PATTERNS.md#visually-hidden-css).
- **Color contrast (1.4.3, 1.4.6):**

  | Text size | AA minimum | AAA enhanced |
  |-----------|------------|--------------|
  | Normal (< 18px / < 14px bold) | 4.5:1 | 7:1 |
  | Large (≥ 18px / ≥ 14px bold) | 3:1 | 4.5:1 |
  | UI components & graphics | 3:1 | 3:1 |

- **Don't rely on color alone:** pair color with an icon or text (e.g., a form error needs `aria-invalid` and a visible message, not just a red border).
- **Media alternatives:** video needs captions (`<track kind="captions">`), audio needs a transcript. Pattern: [references/A11Y-PATTERNS.md#media-alternatives](references/A11Y-PATTERNS.md#media-alternatives).

## Operable

- **Keyboard accessible:** every interactive element must work with both click and `keydown` (Enter/Space). Pattern: [references/A11Y-PATTERNS.md#keyboard-accessible](references/A11Y-PATTERNS.md#keyboard-accessible-js). No keyboard traps: use the native `<dialog>` element or the [modal focus trap pattern](references/A11Y-PATTERNS.md#modal-focus-trap).
- **Focus visible (2.4.7):** never remove focus outlines outright; use `:focus-visible` for keyboard-only focus rings.
- **Focus not obscured (2.4.11, new in 2.2):** sticky headers/footers must not fully hide a focused element. Set `scroll-margin-top`/`scroll-margin-bottom` to compensate.
- **Skip links (2.4.1):** provide "Skip to main content" for keyboard users. Pattern: [references/A11Y-PATTERNS.md#skip-link](references/A11Y-PATTERNS.md#skip-link).
- **Target size (2.5.8, new in 2.2):** interactive targets ≥ 24×24 CSS px (AA); 44×44 is the comfortable recommendation.
- **Dragging movements (2.5.7, new in 2.2):** any drag-only interaction (reorder, slider, map pan) needs a single-pointer alternative. Pattern: [references/A11Y-PATTERNS.md#dragging-movements](references/A11Y-PATTERNS.md#dragging-movements).
- **Timing:** let users extend session/time limits instead of silently expiring.
- **Motion:** respect `prefers-reduced-motion: reduce` by cutting animation/transition durations to near-zero.

## Understandable

- **Page language (3.1.1):** `<html lang="en">` always set; mark language changes inline with `<span lang="fr">`. Pattern: [references/A11Y-PATTERNS.md#page-language](references/A11Y-PATTERNS.md#page-language).
- **Consistent navigation (3.2.3) / consistent help (3.2.6, new in 2.2):** same nav structure across pages; if a help mechanism (chat, FAQ link) repeats, it stays in the same relative position every time.
- **Form labels (3.3.2):** every input needs a programmatically associated label. Pattern: [references/A11Y-PATTERNS.md#form-labels](references/A11Y-PATTERNS.md#form-labels).
- **Error handling (3.3.1, 3.3.3):** announce errors with `role="alert"`/`aria-live`, set `aria-invalid="true"`, focus the first error on submit. Pattern: [references/A11Y-PATTERNS.md#error-handling](references/A11Y-PATTERNS.md#error-handling).
- **Redundant entry (3.3.7, new in 2.2):** don't force re-entry of data already given this session; auto-populate or offer to reuse it. Pattern: [references/A11Y-PATTERNS.md#redundant-entry](references/A11Y-PATTERNS.md#redundant-entry).
- **Accessible authentication (3.3.8, new in 2.2):** login flows can't rely purely on memory/puzzle cognitive tests unless copy-paste, autofill, or an alternative (passkey, email link) is available. Pattern: [references/A11Y-PATTERNS.md#accessible-authentication](references/A11Y-PATTERNS.md#accessible-authentication).

## Robust

- **ARIA usage (4.1.2):** prefer native elements (`<button>`, `<input type="checkbox">`) over ARIA roles on `<div>`s. Pattern: [references/A11Y-PATTERNS.md#aria-native-vs-role](references/A11Y-PATTERNS.md#aria-native-vs-role). When ARIA is genuinely needed, see the [ARIA tabs pattern](references/A11Y-PATTERNS.md#aria-tabs) for a full tablist example.
- **Live regions (4.1.3):** use `aria-live` to announce dynamic changes without moving focus. Pattern: [references/A11Y-PATTERNS.md#live-regions-and-notifications](references/A11Y-PATTERNS.md#live-regions-and-notifications).

---

## Testing checklist

**Automated:**
```bash
npx lighthouse https://example.com --only-categories=accessibility
npm install @axe-core/cli -g && axe https://example.com
```

**Manual:**
- [ ] Keyboard: tab through the entire page, activate with Enter/Space
- [ ] Screen reader: VoiceOver (Mac), NVDA (Windows), or TalkBack (Android). Shortcuts: [references/A11Y-PATTERNS.md#screen-reader-commands](references/A11Y-PATTERNS.md#screen-reader-commands)
- [ ] Zoom: usable at 200%
- [ ] High contrast mode
- [ ] `prefers-reduced-motion: reduce`
- [ ] Focus order matches visual order
- [ ] Target size ≥ 24×24px

## Common issues by impact

| Critical (fix now) | Serious (fix before launch) | Moderate (fix soon) |
|---|---|---|
| Missing form labels | Missing page language | Missing ARIA labels on icons |
| Missing image alt text | Missing heading structure | Inconsistent navigation |
| Insufficient color contrast | Non-descriptive link text | Missing error identification |
| Keyboard traps | Auto-playing media | Timing without controls |
| No focus indicators | Missing skip links | Missing landmark regions |

## References

- [WCAG 2.2 Quick Reference](https://www.w3.org/WAI/WCAG22/quickref/) · [WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/) · [Deque axe rules](https://dequeuniversity.com/rules/axe/)
- [web-quality-audit/SKILL.md](../web-quality-audit/SKILL.md)
- [references/WCAG.md](references/WCAG.md) - full criteria table by level
- [references/A11Y-PATTERNS.md](references/A11Y-PATTERNS.md) - copy-paste code patterns
