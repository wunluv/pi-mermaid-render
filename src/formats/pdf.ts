// PDF output: rasterize SVG to PNG, then embed in a PDF via pdf-lib.
// Invariant: PDF is single-page, sized to the diagram dimensions.

import { writeFile } from 'node:fs/promises';
import { PDFDocument } from 'pdf-lib';
import { renderAsync } from '@resvg/resvg-js';
import { RenderError } from '../error.js';
import type { DiagramColors } from '../themes.js';

export async function svgToPdf(
  svg: string,
  outputPath: string,
  theme: DiagramColors,
): Promise<string> {
  try {
    // Render SVG to PNG buffer at print resolution
    const image = await renderAsync(svg, {
      font: { loadSystemFonts: true },
      background: theme.bg,
    });
    const pngBuffer = image.asPng();

    // Get dimensions from the SVG
    const widthMatch = svg.match(/width="([^"]+)"/);
    const heightMatch = svg.match(/height="([^"]+)"/);
    const svgWidth = widthMatch ? parseFloat(widthMatch[1]) : 800;
    const svgHeight = heightMatch ? parseFloat(heightMatch[1]) : 600;

    // Create PDF with diagram dimensions (points = pixels at 72 DPI)
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([svgWidth, svgHeight]);

    const pngImage = await pdfDoc.embedPng(pngBuffer);
    page.drawImage(pngImage, {
      x: 0,
      y: 0,
      width: svgWidth,
      height: svgHeight,
    });

    const pdfBytes = await pdfDoc.save();
    await writeFile(outputPath, pdfBytes);
    return outputPath;
  } catch (err) {
    if (err instanceof RenderError) throw err;
    throw new RenderError(
      `PDF generation failed: ${err instanceof Error ? err.message : String(err)}`,
      'CONVERSION_FAILED',
    );
  }
}
