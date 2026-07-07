---
name: react-useeffect
lastUpdate: 2026-07-04 00:00
---

# Rules
- Effects synchronize with external systems only. No external system, no Effect.
- Derived values: compute during render, not `useState` + `useEffect`.
- Expensive derived values: `useMemo`, not an Effect that caches into state.
- Reset all state on prop change: `key` prop, not an Effect calling `setState`.
- User-triggered logic (clicks, submits): event handler, not an Effect watching state.
- Notifying a parent of a change: call `onChange` in the event handler, not in an Effect.
- Data fetching needs cleanup (ignore-stale-response guard) or a framework's fetcher: never a bare `useEffect` fetch.
- External store subscriptions: prefer `useSyncExternalStore` over manual `useEffect` subscribe/unsubscribe.
