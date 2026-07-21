# pi-mermaid-render

Render Mermaid diagrams to beautiful SVG, PNG, HTML, PDF, and ASCII. CLI-first. Agent-friendly. Theme-aware.

Built on [beautiful-mermaid](https://github.com/lukilabs/beautiful-mermaid) by Craft — zero-DOM, synchronous SVG/ASCII rendering with 15 built-in themes. Falls back to `@mermaid-js/mermaid-cli` (optional) for C4, Gantt, Pie, and other diagram types.

## Install

```bash
pnpm add pi-mermaid-render
# or from the repo directly
git clone https://github.com/wunluv/pi-mermaid-render
cd pi-mermaid-render && pnpm install && pnpm build && pnpm link --global
```

For C4, Gantt, Pie, Gitgraph, Timeline support (optional):
```bash
pnpm add @mermaid-js/mermaid-cli
# Then install Chromium for Puppeteer:
npx puppeteer browsers install chrome-headless-shell
```

## Usage

```bash
# SVG (default)
mermaid-render diagram.mmd

# PNG with theme
mermaid-render diagram.mmd -f png -t dracula

# Self-contained HTML
mermaid-render diagram.mmd -f html -t tokyo-night

# PDF for print
mermaid-render diagram.mmd -f pdf -t github-light

# Terminal ASCII preview
mermaid-render diagram.mmd -f ascii

# Inline source
mermaid-render "graph TD\n  A --> B" -i -t nord -o output.svg

# List available themes
mermaid-render --theme list
```

## Themes

15 built-in themes: zinc-light, zinc-dark, tokyo-night, tokyo-night-storm, tokyo-night-light, catppuccin-mocha, catppuccin-latte, nord, nord-light, dracula, github-light, github-dark, solarized-light, solarized-dark, one-dark.

## Project Configuration

Drop a `mermaid.config.ts` in your project root to define custom themes and set a default:

```typescript
import type { DiagramColors } from 'pi-mermaid-render';

const heaven: DiagramColors = {
  bg: '#f8fafc',
  fg: '#1e293b',
  accent: '#3b82f6',
  line: '#94a3b8',
  muted: '#64748b',
  surface: '#f1f5f9',
  border: '#cbd5e1',
  font: 'Inter',
};

export default {
  themes: { heaven },
  defaultTheme: 'heaven',
};
```

## Diagram Types Supported

| Type | Backend |
|------|---------|
| Flowchart (`graph TD`, `flowchart LR`) | beautiful-mermaid |
| Sequence (`sequenceDiagram`) | beautiful-mermaid |
| Class (`classDiagram`) | beautiful-mermaid |
| ER (`erDiagram`) | beautiful-mermaid |
| State (`stateDiagram`, `stateDiagram-v2`) | beautiful-mermaid |
| XY Chart (`xychart-beta`) | beautiful-mermaid |
| C4 (`C4Context`, `C4Container`, etc.) | mermaid-cli (optional) |
| Gantt (`gantt`) | mermaid-cli (optional) |
| Pie (`pie`) | mermaid-cli (optional) |
| Gitgraph (`gitGraph`) | mermaid-cli (optional) |
| Timeline (`timeline`) | mermaid-cli (optional) |

## Programmatic API

```typescript
import { render } from 'pi-mermaid-render';

const result = await render({
  source: 'graph TD\n  A --> B',
  format: 'png',
  theme: 'dracula',
  output: 'diagram.png',
});
// { path: 'diagram.png', format: 'png', diagramType: 'flowchart', backend: 'beautiful-mermaid' }
```

## License

MIT
