# communication

Skills for clearer, more human writing — plus spoken summaries read aloud.

## Skills

- **brevify** — Tighten prose. Cuts hedges, filler, and AI-tells; enforces active voice, concrete language, and short sentences. Manually invoked.
- **humanify** — Remove signs of AI-generated writing from text. Detects and fixes inflated symbolism, promotional language, em dash overuse, rule-of-three, AI vocabulary, passive voice, and filler phrases.
- **grill-me** — Progressively harder quiz on a topic to test and deepen understanding.
- **doc-trim** — Trim editorial bloat from existing documents (ADRs, READMEs, KB notes) using six named cut reasons; approval-gated diff, never a silent rewrite.
- **tts-enable** / **tts-disable** — Turn spoken summaries on or off. When on, Claude's closing summary is read aloud (Kokoro if installed, macOS `say` otherwise).

## Hooks

Spoken summaries run on three hooks: SessionStart injects the marker instructions, Stop speaks the summary, and UserPromptSubmit interrupts playback when you send the next message.

## Install

```
/plugin marketplace add jorgeiglopez/toolkit
/plugin install communication@jorgeiglopez-toolkit
```
