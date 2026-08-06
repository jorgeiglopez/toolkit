# TTS backends

`speak.sh` speaks one sentence at a time by shelling out to a backend script
in this directory. Each backend is a single executable implementing two
subcommands:

- `check` — exit 0 if this backend's dependencies are installed and usable,
  non-zero otherwise. No output required, no side effects.
- `speak <rate>` — read one sentence of text from stdin and speak it,
  blocking until playback finishes. The speaker loop is sequential: it
  doesn't read the next sentence (or notice an interrupt) until this call
  returns.

## Selection

`speak.sh` tries backend names from `BACKEND_PRIORITY` in order and uses the
first one whose `check` passes. `say` has no install step and ships with
macOS, so it's always last in priority — the guaranteed fallback when nothing
else is available.

To force a specific backend regardless of priority (e.g. for testing), write
its name to `~/.claude/toolkit/tts/tts-backend`:

```bash
echo say > ~/.claude/toolkit/tts/tts-backend
```

Delete that file to return to auto-detection.

## Adding a backend

1. Add `<name>.sh` here implementing `check` and `speak <rate>`.
2. Add `<name>` to `BACKEND_PRIORITY` in `speak.sh`, ahead of `say` if it
   should be preferred whenever its dependencies are installed.
3. `chmod +x` the new script — `speak.sh` only considers executable files.
