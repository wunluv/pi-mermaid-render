// HTML output: wraps SVG in a self-contained HTML document with theme-aware styling.
// Invariant: output is self-contained (Google Fonts import accepted; no other external refs).

import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import type { DiagramColors } from '../themes.js';
import { RenderError } from '../error.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

export async function svgToHtml(
  svg: string,
  outputPath: string,
  theme: DiagramColors,
  options?: { title?: string; font?: string },
): Promise<string> {
  try {
    const templatePath = join(__dirname, '..', '..', 'templates', 'wrapper.html');
    let template = await readFile(templatePath, 'utf-8');

    // Determine container bg/fg
    const containerBg = theme.bg;
    const containerFg = theme.fg;

    // Build a theme style block that sets CSS custom properties on the SVG container.
    // beautiful-mermaid SVGs use --bg, --fg, --line, --accent, --muted, --surface, --border
    // We set these as CSS custom properties so the SVG inherits them.
    const themeVars = [
      `--bg: ${theme.bg};`,
      `--fg: ${theme.fg};`,
      theme.line ? `--line: ${theme.line};` : '',
      theme.accent ? `--accent: ${theme.accent};` : '',
      theme.muted ? `--muted: ${theme.muted};` : '',
      theme.surface ? `--surface: ${theme.surface};` : '',
      theme.border ? `--border: ${theme.border};` : '',
    ].filter(Boolean).join('\n      ');

    const themeStyleBlock = themeVars
      ? `.diagram-container svg {\n      ${themeVars}\n    }`
      : '';

    // Replace template placeholders
    let html = template
      .replace('{{CONTAINER_BG}}', containerBg)
      .replace('{{CONTAINER_FG}}', containerFg)
      .replace('{{THEME_STYLE_BLOCK}}', themeStyleBlock)
      .replace('{{SVG_CONTENT}}', svg);

    // Inject font import if specified
    if (options?.font && options.font !== 'Inter') {
      const fontImport = `@import url('https://fonts.googleapis.com/css2?family=${encodeURIComponent(options.font)}:wght@400;500;600;700&display=swap');`;
      html = html.replace('</style>', `  ${fontImport}\n  </style>`);
    }

    // Set title if provided
    if (options?.title) {
      html = html.replace('<title>Mermaid Diagram</title>', `<title>${escapeHtml(options.title)}</title>`);
    }

    await writeFile(outputPath, html, 'utf-8');
    return outputPath;
  } catch (err) {
    if (err instanceof RenderError) throw err;
    throw new RenderError(
      `HTML generation failed: ${err instanceof Error ? err.message : String(err)}`,
      'CONVERSION_FAILED',
    );
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
