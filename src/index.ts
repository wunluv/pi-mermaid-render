#!/usr/bin/env node

import { Command } from 'commander';
import { readFile } from 'node:fs/promises';
import { render, listThemes, discoverConfig, RenderError } from './render.js';

const program = new Command();

program
  .name('mermaid-render')
  .description('Render Mermaid diagrams to SVG, PNG, HTML, PDF, or ASCII with theming')
  .version('0.1.0')
  .argument('[source]', 'Path to .mmd file, or inline Mermaid string with -i')
  .option('-i, --inline', 'Treat source argument as inline Mermaid code')
  .option('-f, --format <format>', 'Output format: svg, png, html, pdf, ascii', 'svg')
  .option('-t, --theme <theme>', 'Theme name (dracula, tokyo-night, etc.), path to theme file, or "list" to enumerate')
  .option('-o, --output <path>', 'Output file path')
  .option('-s, --scale <number>', 'PNG scale factor (1-4)', '2')
  .option('--dpi <number>', 'Print DPI for PNG', '300')
  .option('--font <family>', 'Font family', 'Inter')
  .option('--interactive', 'Enable hover tooltips on XY chart output')
  .option('--width <pixels>', 'Override output width')
  .option('--height <pixels>', 'Override output height')
  .action(async (source: string | undefined, options: Record<string, unknown>) => {
    try {
      // Handle --theme list (no source needed)
      if (options.theme === 'list') {
        const config = await discoverConfig();
        const themes = listThemes(config);
        console.log('Available themes:');
        for (const theme of themes) {
          console.log(`  ${theme}`);
        }
        process.exit(0);
      }

      // Source is required for rendering
      if (!source) {
        console.error('Error: source argument is required for rendering');
        process.exit(1);
      }

      // Read source from file or use inline
      let sourceText: string;
      if (options.inline) {
        sourceText = source;
      } else {
        try {
          sourceText = await readFile(source, 'utf-8');
        } catch {
          console.error(`Error: Cannot read source file: ${source}`);
          process.exit(1);
        }
      }

      const result = await render({
        source: sourceText,
        format: options.format as 'svg' | 'png' | 'html' | 'pdf' | 'ascii',
        theme: options.theme as string | undefined,
        output: options.output as string | undefined,
        font: options.font as string | undefined,
        scale: parseInt(options.scale as string, 10),
        dpi: parseInt(options.dpi as string, 10),
        interactive: !!options.interactive,
        width: options.width ? parseInt(options.width as string, 10) : undefined,
        height: options.height ? parseInt(options.height as string, 10) : undefined,
      });

      console.log(`Rendered ${result.format.toUpperCase()} (${result.diagramType}, ${result.backend})`);
      console.log(`Output: ${result.path}`);
    } catch (err) {
      if (err instanceof RenderError) {
        console.error(`Error [${err.code}]: ${err.message}`);
        process.exit(1);
      }
      console.error(`Error: ${err instanceof Error ? err.message : String(err)}`);
      process.exit(1);
    }
  });

program.parse();
