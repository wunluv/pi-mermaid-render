// SVG output: write raw SVG string to file.

import { writeFile } from 'node:fs/promises';

export async function writeSvg(svg: string, outputPath: string): Promise<string> {
  await writeFile(outputPath, svg, 'utf-8');
  return outputPath;
}
