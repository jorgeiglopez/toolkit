# TTS backends

`tts-drain.sh` (the single queue drainer spawned by `speak.sh`) speaks one
block at a time — a queued message holds one line per 📢 marker block — by
shelling out to a backend script in this directory. Each block is synthesized
and played as a single continuous clip. Each backend is a single executable
implementing two subcommands:

- `check` — exit 0 if this backend's dependencies are installed and usable,
  non-zero otherwise. No output required, no side effects.
- `speak <rate>` — read one block of text (a single line) from stdin and
  speak it, blocking until playback finishes. The speaker loop is sequential:
  it doesn't read the next block (or notice an interrupt) until this call
  returns.

## Selection

`tts-drain.sh` tries backend names from `BACKEND_PRIORITY` in order and uses
the first one whose `check` passes. `say` has no install step and ships with
macOS, so it's always last in priority — the guaranteed fallback when nothing
else is available.

To force a specific backend regardless of priority (e.g. for testing), write
its name to `~/.claude/toolkit/tts/tts-backend`:

```bash
echo say > ~/.claude/toolkit/tts/tts-backend
```

Delete that file to return to auto-detection.

## Backends

### kokoro (preferred)

Kokoro-82M via [mlx-audio](https://github.com/Blaizzy/mlx-audio), fully local
on Apple Silicon — natural voice, no text leaves the machine. `check` passes
once both the tool and the model cache exist. One-time setup (idempotent,
check-first; `dogfooding/install.sh` runs it automatically):

```bash
./kokoro-setup.sh
```

It installs whatever is missing from the chain: `uv` itself (brew, or the
official installer), `mlx-audio` as a uv tool, and the Kokoro model + voice
cache (~350MB, one network download; the backend then runs with
`HF_HUB_OFFLINE=1` forever after).

The `uv tool install` carries two `--with` pins, and both matter. `misaki[en]`
isn't declared by mlx-audio, and the spaCy model wheel can't be fetched
lazily: `misaki.en.G2P` calls `spacy.cli.download()` at runtime, which shells
out to `uv pip install` and dies with `error: No virtual environment found`
inside a uv tool env. Bake the wheel in at install time instead — see the
pinned URLs in `kokoro-setup.sh`.

The backend runs with `HF_HUB_OFFLINE=1`, so it never touches the network
after the cache is primed. Each speak call reloads the model (~3s before
audio); if that grates, swap the invocation for a persistent
[Kokoro-FastAPI](https://github.com/remsky/Kokoro-FastAPI) server + curl.

Rate mapping: Kokoro's 1.0x pace is slower than `say` at 200wpm, so the
wpm rate is calibrated as 1.0x ≈ 167wpm — the 200wpm default plays at 1.2x.

### say (fallback)

macOS built-in. No dependencies, always passes `check`, guaranteed last
resort. Rate is native wpm.

## Adding a backend

1. Add `<name>.sh` here implementing `check` and `speak <rate>`.
2. Add `<name>` to `BACKEND_PRIORITY` in `tts-drain.sh`, ahead of `say` if it
   should be preferred whenever its dependencies are installed.
3. `chmod +x` the new script — only executable files are considered.
