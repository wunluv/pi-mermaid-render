// Core render function: the public API that implements the Gate 2 interface.
// Invariant: never returns partial output. Cleanup on error.

import { resolve, dirname, basename, extname } from 'node:path';
import { mkdir } from 'node:fs/promises';
import { resolveTheme, listThemes, type DiagramColors } from './themes.js';
import { detectType, selectBackend } from './detect.js';
import { discoverConfig } from './config.js';
import { RenderError } from './error.js';
import { renderBeautifullSvg, renderBeautifulAscii } from './backends/beautiful.js';
import { renderMermaidCli } from './backends/mermaid-cli.js';
import { writeSvg } from './formats/svg.js';
import { svgToPng } from './formats/png.js';
import { svgToHtml } from './formats/html.js';
import { svgToPdf } from './formats/pdf.js';
import { writeAscii } from './formats/ascii.js';

export interface RenderOptions {
  source: string;
  format: 'svg' | 'png' | 'html' | 'pdf' | 'ascii';
  theme?: string | DiagramColors;
  output?: string;
  font?: string;
  scale?: number;
  dpi?: number;
  interactive?: boolean;
  width?: number;
  height?: number;
}

export interface RenderResult {
  path: string;
  format: string;
  diagramType: string;
  backend: 'beautiful-mermaid' | 'mermaid-cli';
}

const VALID_FORMATS = ['svg', 'png', 'html', 'pdf', 'ascii'] as const;

export async function render(options: RenderOptions): Promise<RenderResult> {
  // Validate format
  if (!VALID_FORMATS.includes(options.format)) {
    throw new RenderError(
      `Invalid format "${options.format}". Valid: ${VALID_FORMATS.join(', ')}`,
      'INVALID_SOURCE',
    );
  }

  // Validate source
  if (!options.source || !options.source.trim()) {
    throw new RenderError('Source is empty', 'INVALID_SOURCE');
  }

  // Detect diagram type
  const diagramType = detectType(options.source);
  if (diagramType === 'unknown') {
    throw new RenderError(
      'Could not detect diagram type. Source must start with a Mermaid diagram keyword (graph, flowchart, sequenceDiagram, etc.)',
      'UNSUPPORTED_TYPE',
    );
  }

  // Select backend
  const backend = selectBackend(diagramType);

  // Resolve theme
  const projectConfig = await discoverConfig();
  const theme: DiagramColors = typeof options.theme === 'object'
    ? options.theme
    : resolveTheme(options.theme, projectConfig);

  // Use project config font as default if not explicitly provided
  const font = options.font ?? projectConfig?.font ?? 'Inter';

  // Determine output path
  const outputPath = options.output ?? deriveOutputPath(options.source, options.format);

  // Ensure output directory exists
  await mkdir(dirname(resolve(outputPath)), { recursive: true });

  // Render SVG (or ASCII)
  let svg: string;

  if (options.format === 'ascii') {
    // ASCII only works with beautiful-mermaid
    if (backend !== 'beautiful-mermaid') {
      throw new RenderError(
        `ASCII output not supported for diagram type "${diagramType}". Use SVG, PNG, HTML, or PDF.`,
        'UNSUPPORTED_TYPE',
      );
    }
    await writeAscii(options.source, outputPath);
    return { path: outputPath, format: 'ascii', diagramType, backend };
  }

  // Get SVG from the appropriate backend
  if (backend === 'beautiful-mermaid') {
    svg = await renderBeautifullSvg(options.source, theme, {
      font,
      interactive: options.interactive,
    });
  } else {
    svg = await renderMermaidCli(options.source, theme, { font });
  }

  // Convert/format based on output type
  switch (options.format) {
    case 'svg':
      await writeSvg(svg, outputPath);
      break;

    case 'png':
      await svgToPng(svg, outputPath, {
        background: theme.bg,
      });
      break;

    case 'html':
      await svgToHtml(svg, outputPath, theme, { font });
      break;

    case 'pdf':
      await svgToPdf(svg, outputPath, theme);
      break;
  }

  return { path: outputPath, format: options.format, diagramType, backend };
}

function deriveOutputPath(source: string, format: string): string {
  const ext = format === 'ascii' ? '.txt' : `.${format}`;
  // If source is a file path, derive from it
  if (source.includes('\n')) {
    // Inline source — use diagram type as base name
    return `diagram${ext}`;
  }
  const base = basename(source, extname(source));
  return `${base}${ext}`;
}

// Re-export for convenience
export { listThemes, resolveTheme, discoverConfig };
export { RenderError };
