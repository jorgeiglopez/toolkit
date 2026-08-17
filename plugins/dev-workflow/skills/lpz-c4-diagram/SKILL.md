---
name: lpz-c4-diagram
description: "Build C4 architecture diagrams for a codebase and publish them into the Obsidian KB via LikeC4 (DSL model + exported PNGs embedded in a note). Use when the user asks for a C4 diagram, architecture diagram, container/component diagram, or to diagram/map a service's architecture."
---

# c4-diagram

Produce a C4 model of a codebase and land it in the KB as: one LikeC4 DSL file + PNG exports + a markdown note that embeds them. Never emit a single giant Mermaid flowchart — Obsidian can't pan/zoom Mermaid and >15-node diagrams force horizontal scrolling (user-confirmed pain).

## Ground rules

- **Levels:** L1 (context), L2 (containers), and **one L3 component view per main container**. Skip L4 (code) — C4 best practice, diagrams rot; only draw L4 for a single hot path if explicitly asked.
- **Evidence-based:** trace real entrypoints, launchers, build targets, queues, and data stores. Mark derived/unconfirmed relationships with a dashed line, and keep a "Confidence & open questions" section in the note.
- For high-stakes maps, fan out multiple independent agents (mixed models) and reconcile by agreement level; label edges [n/N]. Optional — only when the user asks for thoroughness.

## Layout in the KB

```
ARCHITECTURE/<System>/
  <System> C4 Diagram.md      # the note: embeds PNGs + tables + confidence notes
  likec4/
    <system>.c4               # the model (single file is fine)
    export/*.png              # one PNG per view
```

## LikeC4 workflow

1. Write the DSL. Skeleton that is known to parse:

```
specification {
  element person { style { shape person } }
  element system
  element container
  element component
  element datastore { style { shape storage; color secondary } }
  element mq { style { shape queue; color secondary } }
  element external { style { color muted } }
  relationship uncertain { line dashed }   // derived/partially-confirmed edges
}
model {
  sys = system 'Name' {
    api = container 'api' {
      technology 'Java'
      handler = component 'Handler' { description '...' }
    }
  }
  a -> b 'label'
  a -[uncertain]-> c 'contested edge'
}
views {
  view index { title 'L1'; include *; autoLayout TopBottom }
  view containers of sys { title 'L2'; include *; include <externals>; autoLayout TopBottom }
  view apiComponents of sys.api { title 'L3 api'; include *; include <neighbors>; autoLayout TopBottom }
}
```

   - Define relationships at the **most specific level** (component→component). Views roll them up automatically; defining the same edge at both container and component level draws duplicates.
   - Scoped `include *` covers the element + children only — explicitly `include` connected externals/queues/dbs you want visible.
   - View IDs become the exported filenames.

2. Validate (no browser needed, fast):
   `npx -y likec4 export json -o export/model.json .`

3. Export PNGs: `npx -y likec4 export png -o export .`
   **Pitfall:** this needs Playwright's chromium-headless-shell, and the browser build must match likec4's **bundled** playwright version. `npx playwright install` installs for a different version and the export still fails. Fix: run playwright from likec4's npx cache — the error message prints the path, e.g.
   `/Users/<u>/.npm/_npx/<hash>/node_modules/.bin/playwright install chromium-headless-shell`

4. In the note, embed with **relative markdown paths** (`![L2](likec4/export/containers.png)`), not `![[wikilinks]]` — generic filenames like `containers.png` collide vault-wide.

5. Add a tip callout in the note with both commands: `npx likec4 start` (interactive drill-down) and the re-export command.

## Note structure

Provenance header → L1 image → L2 image + containers table → per-container L3 images with 2-3 line prose → key relationships list → confidence & open questions. Keep contested findings as open questions, never draw them as solid edges.
