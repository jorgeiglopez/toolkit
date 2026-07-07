---
name: react-dev
description: Use when building React components with TypeScript, typing hooks, handling events, or when React 19, Server Components, or Next.js App Router are mentioned. Covers type-safe patterns for React 18-19 including generic components, event typing, and routing.
---

# React TypeScript

Typed React components, hooks, events, generics, Server Components, and routing. Not for non-React TypeScript or vanilla JS React.

<react_19_changes>

React 19 breaking changes:

**ref as prop** - `forwardRef` is deprecated (still works, but unnecessary):

```typescript
type ButtonProps = {
  ref?: React.Ref<HTMLButtonElement>;
} & React.ComponentPropsWithoutRef<'button'>;

function Button({ ref, children, ...props }: ButtonProps) {
  return <button ref={ref} {...props}>{children}</button>;
}
```

**useActionState** - replaces `useFormState` (removed):

```typescript
import { useActionState } from 'react';

type FormState = { errors?: string[]; success?: boolean };

function Form() {
  const [state, formAction, isPending] = useActionState(submitAction, {});
  return <form action={formAction}>...</form>;
}
```

**use()** - unwraps promises/context, callable conditionally and in loops (unlike hooks):

```typescript
function UserProfile({ userPromise }: { userPromise: Promise<User> }) {
  const user = use(userPromise); // suspends until resolved
  return <div>{user.name}</div>;
}
```

Also removed in React 19: `propTypes`, `defaultProps` on function components, string refs, `ReactDOM.render`/`hydrate`, `react-dom/test-utils`. See [react-19-migration.md](references/react-19-migration.md) for the full checklist and `useOptimistic`/`useTransition`.

</react_19_changes>

<component_patterns>

**Props** extend native elements: `type ButtonProps = { variant: 'primary' | 'secondary' } & React.ComponentPropsWithoutRef<'button'>`.

**Discriminated unions** for variant props, not a bag of optional fields:

```typescript
type ButtonProps =
  | { variant: 'link'; href: string }
  | { variant: 'button'; onClick: () => void };
```

**Children**: `React.ReactNode` for anything renderable, `React.ReactElement` for a single element. Never `JSX.Element` for children.

</component_patterns>

<event_handlers>

Use the specific event type, not a generic handler, so `e.target`/`e.currentTarget` is typed correctly: `React.MouseEvent<HTMLButtonElement>`, `React.FormEvent<HTMLFormElement>`, `React.ChangeEvent<HTMLInputElement>`, `React.KeyboardEvent<HTMLInputElement>`. See [event-handlers.md](references/event-handlers.md) for focus, drag, clipboard, touch, wheel events.

</event_handlers>

<hooks_typing>

- **useState**: explicit type for unions/null, `useState<User | null>(null)`, `useState<'idle' | 'loading'>('idle')`.
- **useRef**: `null` initial for DOM refs (needs `?.`); non-null initial for mutable value refs (direct access, no `?.`).
- **useReducer**: discriminated union for `Action`, switch on `action.type`.
- **useContext**: null-guard pattern, throw in a `useX()` wrapper if context is null, so callers get a narrowed type.
- **Custom hooks**: tuple returns need `as const` or the array widens to a union type, breaking positional destructuring.

See [hooks.md](references/hooks.md) for useCallback, useMemo, useImperativeHandle, useSyncExternalStore, useLayoutEffect, useId.

</hooks_typing>

<generic_components>

Generic components infer `T` from props, no manual annotation at the call site: `type TableProps<T> = { data: T[]; columns: { key: keyof T; header: string }[]; keyExtractor: (item: T) => string | number }`. Constrain generics that need a shared shape: `function List<T extends { id: string | number }>(...)`.

See [generic-components.md](examples/generic-components.md) for Table, Select, List, Modal, FormField.

</generic_components>

<server_components>

React 19 Server Components run on the server and can be `async`. Server Actions use `'use server'` for mutations; Client Components pair them with `useActionState`.

**use() for promise handoff**: server passes the promise unawaited, client unwraps it:

```typescript
// Server: no await
async function Page() {
  const userPromise = fetchUser('123');
  return <UserProfile userPromise={userPromise} />;
}

// Client
'use client';
function UserProfile({ userPromise }: { userPromise: Promise<User> }) {
  const user = use(userPromise);
  return <div>{user.name}</div>;
}
```

Never await a promise before passing it to `use()`, that defeats the streaming/Suspense benefit. Never mix Server and Client components in the same file.

See [server-components.md](examples/server-components.md) for parallel fetching, streaming, error boundaries.

</server_components>

<routing>

**TanStack Router** - compile-time type safety, Zod for search-param validation, `useLoaderData`/`useSearch`/`useParams` scoped `{ from: routeId }`.

**React Router v7** - Framework Mode generates types from routes: `import type { Route } from "./+types/user"`, `loaderData` is typed from the `loader` automatically.

See [tanstack-router.md](references/tanstack-router.md) and [react-router.md](references/react-router.md).

</routing>

<references>

- [react-19-migration.md](references/react-19-migration.md) - full migration checklist, useOptimistic, useTransition, useDeferredValue
- [hooks.md](references/hooks.md) - useCallback, useMemo, useImperativeHandle, useSyncExternalStore, useLayoutEffect, useId
- [event-handlers.md](references/event-handlers.md) - all event types, generic handlers
- [generic-components.md](examples/generic-components.md) - Table, Select, List, Modal patterns
- [server-components.md](examples/server-components.md) - async components, Server Actions, streaming
- [tanstack-router.md](references/tanstack-router.md) - TanStack Router typed routes, search params
- [react-router.md](references/react-router.md) - React Router v7 loaders, actions, forms

</references>
