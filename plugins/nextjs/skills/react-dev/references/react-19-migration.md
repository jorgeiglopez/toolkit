# React 19 Migration and Extended Patterns

Deeper patterns beyond the SKILL.md summary: generic components with ref, useActionState with optimistic updates, use() edge cases, useOptimistic, useTransition, useDeferredValue, and the full migration checklist.

## Generic Components with ref

```typescript
type SelectProps<T> = {
  ref?: React.Ref<HTMLSelectElement>;
  options: T[];
  value: T;
  onChange: (value: T) => void;
  getLabel: (option: T) => string;
};

export function Select<T>({ ref, options, value, onChange, getLabel }: SelectProps<T>) {
  return (
    <select
      ref={ref}
      value={getLabel(value)}
      onChange={(e) => {
        const selected = options.find((opt) => getLabel(opt) === e.target.value);
        if (selected) onChange(selected);
      }}
    >
      {options.map((opt) => (
        <option key={getLabel(opt)} value={getLabel(opt)}>{getLabel(opt)}</option>
      ))}
    </select>
  );
}
```

## useActionState with Optimistic Updates

Combine `useActionState` (server round-trip) with `useOptimistic` (instant local feedback):

```typescript
'use client';

import { useActionState, useOptimistic } from 'react';

type Todo = { id: string; title: string; completed: boolean };

async function toggleTodo(prevState: { todos: Todo[] }, formData: FormData): Promise<{ todos: Todo[] }> {
  'use server';
  const todoId = formData.get('todoId') as string;
  await db.todo.update({ where: { id: todoId }, data: { completed: { toggle: true } } });
  return { todos: await db.todo.findMany() };
}

export function TodoList({ initialTodos }: { initialTodos: Todo[] }) {
  const [state, formAction] = useActionState(toggleTodo, { todos: initialTodos });
  const [optimisticTodos, setOptimisticTodos] = useOptimistic(
    state.todos,
    (currentTodos, todoId: string) =>
      currentTodos.map((todo) => (todo.id === todoId ? { ...todo, completed: !todo.completed } : todo))
  );

  return (
    <ul>
      {optimisticTodos.map((todo) => (
        <li key={todo.id}>
          <form action={(formData) => { setOptimisticTodos(todo.id); formAction(formData); }}>
            <input type="hidden" name="todoId" value={todo.id} />
            <button type="submit">{todo.completed ? 'done' : 'open'} {todo.title}</button>
          </form>
        </li>
      ))}
    </ul>
  );
}
```

## use() Edge Cases

`use()` can be called conditionally and inside loops, unlike ordinary hooks:

```typescript
'use client';
import { use } from 'react';

// Conditional
function UserDisplay({ userPromise, userId }: { userPromise?: Promise<User>; userId?: string }) {
  let user: User | undefined;
  if (userPromise) user = use(userPromise);
  else if (userId) user = use(fetchUser(userId));
  if (!user) return <div>No user data</div>;
  return <div>{user.name}</div>;
}

// In a loop
function UserList({ userPromises }: { userPromises: Promise<User>[] }) {
  return <ul>{userPromises.map((p) => { const u = use(p); return <li key={u.id}>{u.name}</li>; })}</ul>;
}

// With context (alternative to useContext, also callable conditionally)
function ThemedComponent({ override }: { override?: Theme }) {
  const theme = override ?? use(ThemeContext);
  return <div className={theme}>Content</div>;
}
```

## useOptimistic - Optimistic UI Updates

Shows immediate feedback before the server confirms:

```typescript
'use client';
import { useOptimistic } from 'react';

type Message = { id: string; text: string; sending?: boolean };

export function MessageThread({ messages }: { messages: Message[] }) {
  const [optimisticMessages, addOptimisticMessage] = useOptimistic(
    messages,
    (state, newMessage: Message) => [...state, newMessage]
  );

  async function sendMessage(formData: FormData) {
    const text = formData.get('message') as string;
    addOptimisticMessage({ id: 'temp', text, sending: true });
    await fetch('/api/messages', { method: 'POST', body: JSON.stringify({ text }) });
  }

  return (
    <div>
      <ul>{optimisticMessages.map((msg) => (
        <li key={msg.id} className={msg.sending ? 'opacity-50' : ''}>{msg.text}</li>
      ))}</ul>
      <form action={sendMessage}>
        <input name="message" required />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}
```

## useTransition - Non-Blocking Updates

Marks a state update as non-urgent so the UI stays responsive during the update:

```typescript
'use client';
import { useTransition, useState } from 'react';

export function SearchResults() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();

  function handleSearch(value: string) {
    setQuery(value); // urgent: update input immediately
    startTransition(() => {
      const filtered = hugeDataset.filter((item) => item.toLowerCase().includes(value.toLowerCase()));
      setResults(filtered); // non-urgent: can be interrupted
    });
  }

  return (
    <div>
      <input value={query} onChange={(e) => handleSearch(e.target.value)} />
      {isPending && <div>Searching...</div>}
      <ul>{results.map((r) => <li key={r}>{r}</li>)}</ul>
    </div>
  );
}
```

`useTransition` also wraps Server Action calls to keep the UI responsive during the async call:

```typescript
'use client';
import { useTransition } from 'react';
import { deletePost } from '@/actions/posts';

export function DeleteButton({ postId }: { postId: string }) {
  const [isPending, startTransition] = useTransition();
  function handleDelete() {
    startTransition(async () => { await deletePost(postId); });
  }
  return <button onClick={handleDelete} disabled={isPending}>{isPending ? 'Deleting...' : 'Delete'}</button>;
}
```

## useDeferredValue - Deferred Rendering

Defers an expensive re-render while keeping input responsive:

```typescript
'use client';
import { useDeferredValue, useState, useMemo } from 'react';

export function ProductSearch() {
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);
  return (
    <div>
      <input value={query} onChange={(e) => setQuery(e.target.value)} />
      <ExpensiveResults query={deferredQuery} />
    </div>
  );
}

function ExpensiveResults({ query }: { query: string }) {
  const results = useMemo(() => products.filter((p) => p.name.includes(query)), [query]);
  return <ul>{results.map((r) => <li key={r.id}>{r.name}</li>)}</ul>;
}
```

## Migration Checklist (React 18 to 19)

- [ ] Replace `forwardRef` with `ref` as a prop
- [ ] Replace `useFormState` with `useActionState`
- [ ] Update Server Action types to include the `prevState` parameter
- [ ] Use `use()` for promises passed into Server Components
- [ ] Add `'use server'` to Server Actions, `'use client'` to Client Components
- [ ] Update TypeScript to 5.0+, `@types/react` to 19.x
- [ ] Test all forms with `useActionState`
- [ ] Verify ref forwarding works without `forwardRef`
- [ ] Remove any remaining `propTypes`, `defaultProps` on function components, string refs
