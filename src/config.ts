// Project config discovery: walks up from cwd looking for mermaid.config.ts.
// First found wins. Returns undefined if none found.

import { existsSync } from 'node:fs';
import { resolve, dirname, join, parse } from 'node:path';
import type { DiagramColors } from './themes.js';

export interface MermaidConfig {
  themes?: Record<string, DiagramColors>;
  defaultTheme?: string;
  font?: string;
}

export async function discoverConfig(cwd?: string): Promise<MermaidConfig | undefined> {
  const searchPath = cwd ?? process.cwd();
  let currentDir = resolve(searchPath);

  while (true) {
    const configPath = join(currentDir, 'mermaid.config.ts');
    if (existsSync(configPath)) {
      return loadConfig(configPath);
    }

    // Also check .js and .mjs variants
    for (const ext of ['.js', '.mjs']) {
      const altPath = join(currentDir, `mermaid.config${ext}`);
      if (existsSync(altPath)) {
        return loadConfig(altPath);
      }
    }

    const parent = dirname(currentDir);
    if (parent === currentDir) break; // Reached filesystem root
    currentDir = parent;
  }

  return undefined;
}

async function loadConfig(path: string): Promise<MermaidConfig> {
  try {
    // Dynamic import for project config files
    const mod = await import(path);
    const config = mod.default ?? mod;

    // Validate
    if (!config || typeof config !== 'object') {
      console.warn(`mermaid.config at ${path} does not export a valid config object. Ignoring.`);
      return {};
    }

    const result: MermaidConfig = {};

    if (config.themes && typeof config.themes === 'object') {
      result.themes = config.themes as Record<string, DiagramColors>;
    }

    if (typeof config.defaultTheme === 'string') {
      result.defaultTheme = config.defaultTheme;
    }

    if (typeof config.font === 'string') {
      result.font = config.font;
    }

    return result;
  } catch (err) {
    console.warn(`Failed to load mermaid.config at ${path}: ${err instanceof Error ? err.message : String(err)}`.trim());
    return {};
  }
}
