// PNG output: SVG → raster via @resvg/resvg-js.
// Invariant: 300 DPI default for print resolution.

import { writeFile } from 'node:fs/promises';
import { renderAsync } from '@resvg/resvg-js';
import { RenderError } from '../error.js';

export async function svgToPng(
  svg: string,
  outputPath: string,
  options?: { scale?: number; background?: string },
): Promise<string> {
  try {
    const image = await renderAsync(svg, {
      font: {
        loadSystemFonts: true,
      },
      background: options?.background,
    });

    const pngBuffer = image.asPng();
    await writeFile(outputPath, pngBuffer);
    return outputPath;
  } catch (err) {
    throw new RenderError(
      `PNG conversion failed: ${err instanceof Error ? err.message : String(err)}`,
      'CONVERSION_FAILED',
    );
  }
}
