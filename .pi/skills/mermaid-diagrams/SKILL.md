# mermaid-diagrams

Render Mermaid diagrams to SVG, PNG, HTML, PDF, or ASCII using `mermaid-render`.

## When to Use

- Architecture documentation, system blueprints, planning artifacts
- Any time a visual diagram helps explain structure, flow, or relationships
- Project READMEs, design docs, presentations, print materials

## How to Use

Design the Mermaid code collaboratively with the human, then call the CLI:

```bash
mermaid-render diagram.mmd -f <format> -t <theme>
```

### Formats
`svg` (default), `png`, `html`, `pdf`, `ascii`

### Themes
15 built-in: zinc-light, zinc-dark, tokyo-night, tokyo-night-storm, tokyo-night-light, catppuccin-mocha, catppuccin-latte, nord, nord-light, dracula, github-light, github-dark, solarized-light, solarized-dark, one-dark.

List all available (including project-specific themes):
```bash
mermaid-render --theme list
```

### Project Themes
If the project has a `mermaid.config.ts`, themes defined there are auto-discovered. Use `--theme <name>` to select them. No theme flag uses the project default, or zinc-light if none.

### Diagram Types
Flowcharts, sequence, class, ER, state, and XY charts render instantly. C4, Gantt, Pie, and others require `@mermaid-js/mermaid-cli` (optional dependency).

### Example Workflow

```bash
# 1. Write diagram source
cat > docs/architecture.mmd << 'EOF'
graph TD
  A[Browser] --> B[API Gateway]
  B --> C[Auth Service]
  B --> D[Data Service]
  C --> E[(Postgres)]
  D --> E
EOF

# 2. Render
mermaid-render docs/architecture.mmd -f html -t dracula -o docs/architecture.html

# 3. For PDF (print)
mermaid-render docs/architecture.mmd -f pdf -t github-light -o docs/architecture.pdf
```

## Tips

- Preview with `-f ascii` for a quick terminal check before rendering to file
- Use `-f html` for self-contained HTML that can be embedded or opened in browser
- PNG and PDF default to print resolution (300 DPI)
- The HTML output is self-contained (no external dependencies except Google Fonts for Inter)
