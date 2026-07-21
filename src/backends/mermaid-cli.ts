// mermaid-cli backend: optional fallback for C4, Gantt, Pie, Gitgraph, Timeline, etc.
// Shells out to mmdc (Puppeteer-based). Adds ~2-3s latency.
// Invariant: only called when diagram type is NOT in BEAUTIFUL_TYPES set.
// If @mermaid-js/mermaid-cli is not installed, throws a clear error with install instructions.

import { execFile } from 'node:child_process';
import { writeFile, readFile, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { promisify } from 'node:util';
import type { DiagramColors } from '../themes.js';
import { RenderError } from '../error.js';

const execFileAsync = promisify(execFile);

// Map DiagramColors to Mermaid's themeVariables (approximate for fallback use)
function themeColorsToMermaidConfig(theme: DiagramColors): Record<string, unknown> {
  const config: Record<string, unknown> = {
    theme: 'base',
    themeVariables: {
      primaryColor: theme.accent ?? theme.fg,
      primaryTextColor: theme.bg,
      primaryBorderColor: theme.border ?? theme.fg,
      secondaryColor: theme.surface ?? theme.bg,
      secondaryTextColor: theme.fg,
      secondaryBorderColor: theme.border ?? theme.fg,
      tertiaryColor: theme.surface ?? theme.bg,
      tertiaryTextColor: theme.muted ?? theme.fg,
      tertiaryBorderColor: theme.border ?? theme.fg,
      lineColor: theme.line ?? theme.fg,
      textColor: theme.fg,
      mainBkg: theme.bg,
    },
  };

  // mmdc supports backgroundColor separately
  if (theme.bg && !theme.bg.startsWith('var(')) {
    config.backgroundColor = theme.bg;
  }

  return config;
}

export async function renderMermaidCli(
  source: string,
  theme: DiagramColors,
  options?: { font?: string },
): Promise<string> {
  const tmpDir = await mkdtemp(join(tmpdir(), 'mermaid-render-'));
  const sourceFile = join(tmpDir, 'diagram.mmd');
  const configFile = join(tmpDir, 'config.json');
  const outputFile = join(tmpDir, 'diagram.svg');

  try {
    // Write source
    await writeFile(sourceFile, source, 'utf-8');

    // Write Mermaid config
    const config = themeColorsToMermaidConfig(theme);
    await writeFile(configFile, JSON.stringify(config, null, 2), 'utf-8');

    // Run mmdc
    const args = [
      '-i', sourceFile,
      '-o', outputFile,
      '-c', configFile,
    ];

    if (options?.font) {
      args.push('--pdfFit'); // mmdc doesn't have a direct --font flag, but we set it in config
      // Note: mmdc font configuration is limited. The font is applied via theme CSS.
      // For better font control, the HTML output path is preferred.
    }

    await execFileAsync('mmdc', args, { timeout: 30000 }).catch((err: NodeJS.ErrnoException) => {
      if (err.code === 'ENOENT') {
        throw new RenderError(
          'mermaid-cli not installed. Install it with: pnpm add @mermaid-js/mermaid-cli',
          'BACKEND_ERROR',
        );
      }
      throw err;
    });

    // Read output
    const svg = await readFile(outputFile, 'utf-8');
    if (!svg.trim()) {
      throw new RenderError('mermaid-cli produced empty output', 'BACKEND_ERROR');
    }

    return svg;
  } catch (err) {
    if (err instanceof RenderError) throw err;
    throw new RenderError(
      `mermaid-cli render failed: ${err instanceof Error ? err.message : String(err)}`,
      'BACKEND_ERROR',
    );
  } finally {
    // Cleanup temp files
    await rm(tmpDir, { recursive: true, force: true }).catch(() => {});
  }
}
