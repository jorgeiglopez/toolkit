---
name: react-dev
lastUpdate: 2026-07-04 00:00
---

# Rules
- React 19: `ref` is a regular prop, `forwardRef` is deprecated (still works, don't use it in new code).
- React 19: `useActionState` replaces the removed `useFormState`.
- React 19: `use()` unwraps promises/context and, unlike hooks, can be called conditionally or in loops. Never await a promise before passing it to `use()`.
- Event handlers: always use the specific event type (`MouseEvent`, `ChangeEvent`, etc.), never a generic/`any` handler.
- `useState`: give an explicit type for unions/null; inference alone isn't enough.
- `useRef`: `null` initial for DOM refs (guard with `?.`); non-null initial for mutable value refs.
- Custom hook tuple returns need `as const`, or the return type widens to a union and breaks positional destructuring.
- Variant props: discriminated unions, not a bag of optional fields.
- Children: `React.ReactNode`, never `JSX.Element`.
- Never mix Server and Client components in the same file.
- Full long-tail patterns (migration checklist, useOptimistic/useTransition/useDeferredValue, router details) live in `references/` and `examples/`, not in SKILL.md.
