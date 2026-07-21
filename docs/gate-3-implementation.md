# Gate 3: Implementation

## Modules

```
src/
  index.ts              CLI entry (commander)
  render.ts             Core render() — public API, 113 lines
  detect.ts             Diagram type detection + backend selection
  themes.ts             Theme resolution (built-in + project config + custom files)
  error.ts              RenderError class with error codes
  config.ts             Project config discovery (walks up tree for mermaid.config.ts)
  backends/
    beautiful.ts        beautiful-mermaid: SVG + ASCII for 6 types
    mermaid-cli.ts      mermaid-cli fallback: C4, Gantt, Pie, etc. (optional dep)
  formats/
    svg.ts              Write SVG to file
    png.ts              SVG → PNG via @resvg/resvg-js
    html.ts             SVG → self-contained HTML wrapper
    pdf.ts              PNG → PDF via pdf-lib
    ascii.ts            ASCII output via renderMermaidASCII
templates/
  wrapper.html          HTML wrapper template with theme variable injection
```

## Key Decisions

1. **mermaid-cli as optional dependency.** Chromium download is ~300MB and slow on mobile connections. The 6 beautiful-mermaid types work without it. Error message tells users how to install when C4/Gantt/etc. are needed.

2. **Extended DiagramColors.** beautiful-mermaid's `DiagramColors` doesn't include `font`. Extended with optional `font` field. Backward-compatible: built-in themes are cast, custom themes can set font.

3. **RenderedImage → `.asPng()`.** resvg-js returns a `RenderedImage` class, not a raw Buffer. Must call `.asPng()` before writing.

4. **Theme link for live switching (HTML).** HTML output sets CSS custom properties on the SVG container so themes can change without re-render. The SVG itself already uses these variables via beautiful-mermaid's style block.

5. **PDF via PNG intermediate.** pdf-lib embeds PNG into PDF. SVG dimensions are parsed to set page size. Print resolution via resvg-js defaults.

## Net Line Count

~550 lines of TypeScript across 13 source files. Core logic is ~200 lines; format converters ~100; backends ~100; CLI ~80; config/themes/detect ~70.
