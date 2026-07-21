# Gate 1: Data Model

## Entities

| Entity | Definition |
|--------|------------|
| **Diagram** | Mermaid source text + auto-detected type (flowchart, sequence, class, ER, state, XY chart, C4, gantt, pie, gitgraph, timeline, etc.) |
| **Theme** | Color palette: `bg`, `fg`, `line`, `accent`, `muted`, `surface`, `border`, `font` |
| **RenderRequest** | A Diagram + resolved Theme + output format + output path + rendering options (scale, DPI) |
| **Output** | File on disk: SVG, PNG, HTML, PDF, or ASCII text |
| **ProjectConfig** | Optional `mermaid.config.ts` in project root containing 0..N named custom themes + a default theme name |

## Relationships

```
Diagram ──1:1──▶ type (enum — auto-detected from first line)
Diagram ──1:1──▶ RenderRequest
RenderRequest ──1:1──▶ Theme (always resolved, never null)
RenderRequest ──1:1──▶ Backend (beautiful-mermaid | mermaid-cli)
RenderRequest ──1:N──▶ Output files (1 SVG, optionally 1 PNG, optionally 1 HTML)
ProjectConfig ──1:N──▶ Theme (0..N custom themes)
ProjectConfig ──1:1──▶ default theme name
```

## Invariants (must always be true)

1. Every render MUST detect diagram type before selecting backend
2. Theme resolution MUST produce a valid DiagramColors object — never null
3. beautiful-mermaid handles: flowchart, sequence, class, ER, state, XY chart. Everything else → mermaid-cli fallback
4. SVG output is self-contained (inline styles, no external file refs)
5. PNG output at print resolution (300 DPI default) via resvg-js
6. File extension matches format (`.svg`, `.png`, `.html`, `.pdf`, `.txt`)

## Impossible States (must never happen)

- A Diagram rendered with no Theme (resolution always produces a fallback to zinc-light)
- A RenderRequest targeting a format with no implementation
- An SVG that references external CSS/asset files
- Two backends both claiming the same diagram type (mutually exclusive partition)
- A ProjectConfig theme overriding a built-in theme name without explicit declaration

## Theme Resolution Chain

```
explicit --theme flag → project mermaid.config.ts default → zinc-light
```

## Open Decisions

- HTML wrapper template: implementation detail of `html` format output, not its own entity. Future versions may expose it via ProjectConfig.
- C4 and other non-beautiful-mermaid types fall back to mermaid-cli (headless Chromium). This adds ~2-3s latency and a Chromium dependency, but diagram types are auto-detected so no user-facing complexity.
