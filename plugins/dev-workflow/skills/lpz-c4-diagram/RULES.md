---
name: lpz-c4-diagram
lastUpdate: 2026-09-13 00:00
---

# Rules
- Never emit a single giant Mermaid flowchart; Obsidian can't pan/zoom Mermaid and >15 nodes force horizontal scrolling.
- Draw L1 (context), L2 (containers), and one L3 component view per main container; skip L4 unless explicitly asked for a single hot path.
- Base every element and edge on real evidence (entrypoints, launchers, build targets, queues, stores); mark derived/unconfirmed edges dashed and list them under "Confidence & open questions".
- Never draw a contested finding as a solid edge; keep it as an open question.
- Deliver the KB triple: one LikeC4 `.c4` DSL file + per-view PNG exports + a markdown note that embeds them, under `ARCHITECTURE/<System>/`.
- Define each relationship at the most specific level (component→component); views roll them up, and defining an edge at two levels draws duplicates.
- Validate with `likec4 export json` before exporting PNGs.
- PNG export needs the chromium-headless-shell matching likec4's bundled Playwright — install it from likec4's own npx cache path (the error prints it), not a bare `npx playwright install`.
- Embed PNGs with relative markdown paths, never `![[wikilinks]]` — generic filenames collide vault-wide.
- Include a callout with both the interactive-start and re-export commands.
