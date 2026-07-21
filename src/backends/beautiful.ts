// beautiful-mermaid backend: SVG and ASCII rendering for 6 diagram types.
// Invariant: only called when diagram type is in BEAUTIFUL_TYPES set.

import { renderMermaidSVGAsync, renderMermaidASCII } from 'beautiful-mermaid';
import type { DiagramColors } from '../themes.js';
import { RenderError } from '../error.js';

export async function renderBeautifullSvg(
  source: string,
  theme: DiagramColors,
  options?: {
    font?: string;
    padding?: number;
    nodeSpacing?: number;
    layerSpacing?: number;
    interactive?: boolean;
  },
): Promise<string> {
  try {
    return await renderMermaidSVGAsync(source, {
      bg: theme.bg,
      fg: theme.fg,
      line: theme.line,
      accent: theme.accent,
      muted: theme.muted,
      surface: theme.surface,
      border: theme.border,
      font: options?.font ?? theme.font ?? 'Inter',
      padding: options?.padding,
      nodeSpacing: options?.nodeSpacing,
      layerSpacing: options?.layerSpacing,
      interactive: options?.interactive,
    });
  } catch (err) {
    throw new RenderError(
      `beautiful-mermaid render failed: ${err instanceof Error ? err.message : String(err)}`,
      'BACKEND_ERROR',
    );
  }
}

export function renderBeautifulAscii(
  source: string,
): string {
  try {
    return renderMermaidASCII(source, { colorMode: 'ansi256' });
  } catch (err) {
    throw new RenderError(
      `beautiful-mermaid ASCII render failed: ${err instanceof Error ? err.message : String(err)}`,
      'BACKEND_ERROR',
    );
  }
}
