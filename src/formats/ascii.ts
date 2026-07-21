// ASCII output: terminal-friendly diagram via beautiful-mermaid's ASCII renderer.

import { renderBeautifulAscii } from '../backends/beautiful.js';
import { writeFile } from 'node:fs/promises';

export async function writeAscii(source: string, outputPath: string): Promise<string> {
  const ascii = renderBeautifulAscii(source);
  await writeFile(outputPath, ascii, 'utf-8');
  return outputPath;
}
