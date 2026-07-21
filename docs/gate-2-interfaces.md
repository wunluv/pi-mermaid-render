# Gate 2: Interface Design

## CLI Interface

```
mermaid-render <source> [options]

source               Path to .mmd file, or inline Mermaid string with -i

-f, --format         svg | png | html | pdf | ascii         [default: svg]
-t, --theme          Theme name (dracula), path to custom theme file,
                      or "list" to enumerate available themes
-o, --output         Output file path                        [default: derived]
-s, --scale          PNG scale factor (1-4)                  [default: 2]
--dpi               Print DPI for PNG                       [default: 300]
--font              Font family                              [default: Inter]
--interactive       Enable hover tooltips on XY chart output
--width             Override output width in pixels
--height            Override output height in pixels
```

**Errors:** Missing source → exit 1 with usage. Unsupported format → exit 1 with valid list. Unsupported diagram type → exit 1 with backend info. File write failure → exit 1 with path.

## Programmatic API

```typescript
interface RenderOptions {
  source: string;
  format: 'svg' | 'png' | 'html' | 'pdf' | 'ascii';
  theme?: string | DiagramColors;
  output?: string;
  font?: string;           // Default: Inter
  scale?: number;          // PNG scale, default 2
  dpi?: number;            // PNG DPI, default 300
  interactive?: boolean;   // XY chart tooltips
  width?: number;
  height?: number;
}

interface RenderResult {
  path: string;
  format: string;
  diagramType: string;
  backend: 'beautiful-mermaid' | 'mermaid-cli';
}

function render(options: RenderOptions): Promise<RenderResult>;
```

**Errors:** Throws `RenderError` with `.code` enum (`UNSUPPORTED_TYPE`, `INVALID_SOURCE`, `THEME_NOT_FOUND`, `CONVERSION_FAILED`). Never returns partial output. Cleanup on error.

## Project Configuration

```typescript
// mermaid.config.ts at project root
interface MermaidConfig {
  themes?: Record<string, DiagramColors>;
  defaultTheme?: string;
  font?: string;
  defaults?: Partial<RenderOptions>;
}

// Resolution: walk cwd → parents looking for mermaid.config.ts
// First found wins. No config found → zinc-light default.
```

## Extension Points

1. **Custom themes** — via `mermaid.config.ts` or standalone `.ts` files exporting `DiagramColors`
2. **Shiki themes** — any VS Code theme via `fromShikiTheme()` exposed as theme name
3. **HTML wrapper** — implementation detail of `html` format. Future: configurable via `MermaidConfig.htmlTemplate`
4. **Backend selection** — diagram type detection is the extension point. Adding a new diagram type means adding to the type → backend map

## Invariants Enforced at Interface Boundaries

- `render()` validates format enum before dispatching
- Theme resolution never returns null (always resolves to a valid DiagramColors)
- Backend selection is deterministic based on diagram type
- Output path always derived if not provided: `{source-stem}.{format}`
