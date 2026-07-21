// Theme resolution chain: explicit --theme → project config → zinc-light fallback.
// Invariant: never returns null.

import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { THEMES } from 'beautiful-mermaid';
import { RenderError } from './error.js';

// Extend beautiful-mermaid's DiagramColors with optional font
import type { DiagramColors as BmDiagramColors } from 'beautiful-mermaid';
export type { BmDiagramColors };

export interface DiagramColors extends BmDiagramColors {
  font?: string;
}

// All built-in theme names
export const BUILT_IN_THEMES = Object.keys(THEMES);

// The guaranteed fallback
const FALLBACK: DiagramColors = { bg: '#FFFFFF', fg: '#27272A' };

export function resolveTheme(
  themeArg?: string,
  projectConfig?: { themes?: Record<string, DiagramColors>; defaultTheme?: string },
): DiagramColors {
  // Priority 1: explicit --theme
  if (themeArg) {
    // Check built-in
    if (themeArg in THEMES) return THEMES[themeArg] as DiagramColors;

    // Check project config themes
    if (projectConfig?.themes?.[themeArg]) return projectConfig.themes[themeArg];

    // Check if it's a file path
    try {
      const absPath = resolve(themeArg);
      if (existsSync(absPath)) {
        return loadThemeFile(absPath);
      }
    } catch {
      // Not a file, continue
    }

    // Try .ts/.js extensions
    for (const ext of ['.ts', '.js', '.mjs', '.json']) {
      try {
        const absPath = resolve(themeArg + ext);
        if (existsSync(absPath)) {
          return loadThemeFile(absPath);
        }
      } catch {
        continue;
      }
    }

    throw new RenderError(
      `Theme "${themeArg}" not found. Available built-in: ${BUILT_IN_THEMES.join(', ')}`,
      'THEME_NOT_FOUND',
    );
  }

  // Priority 2: project config default
  if (projectConfig?.defaultTheme && projectConfig.themes?.[projectConfig.defaultTheme]) {
    return projectConfig.themes[projectConfig.defaultTheme];
  }

  // Priority 3: zinc-light fallback
  return FALLBACK;
}

function loadThemeFile(path: string): DiagramColors {
  // Theme files export DiagramColors (either directly or via default export)
  if (path.endsWith('.json')) {
    const raw = JSON.parse(readFileSync(path, 'utf-8'));
    return validateThemeColors(raw);
  }

  // For .ts/.js: dynamic import supported via project config, not direct file path
  throw new RenderError(
    `Cannot load theme file: ${path}. Use .json format or define themes in mermaid.config.ts.`,
    'THEME_NOT_FOUND',
  );
}

function validateThemeColors(obj: unknown): DiagramColors {
  if (!obj || typeof obj !== 'object') {
    throw new RenderError('Invalid theme: expected object with bg and fg', 'THEME_NOT_FOUND');
  }
  const colors = obj as Record<string, unknown>;
  if (typeof colors.bg !== 'string' || typeof colors.fg !== 'string') {
    throw new RenderError('Invalid theme: bg and fg must be color strings', 'THEME_NOT_FOUND');
  }
  return {
    bg: colors.bg as string,
    fg: colors.fg as string,
    line: typeof colors.line === 'string' ? colors.line : undefined,
    accent: typeof colors.accent === 'string' ? colors.accent : undefined,
    muted: typeof colors.muted === 'string' ? colors.muted : undefined,
    surface: typeof colors.surface === 'string' ? colors.surface : undefined,
    border: typeof colors.border === 'string' ? colors.border : undefined,
    font: typeof colors.font === 'string' ? colors.font : undefined,
  };
}

export function listThemes(projectConfig?: { themes?: Record<string, DiagramColors> }): string[] {
  const themes = [...BUILT_IN_THEMES];
  if (projectConfig?.themes) {
    for (const name of Object.keys(projectConfig.themes)) {
      if (!themes.includes(name)) themes.push(`${name} (project)`);
    }
  }
  return themes;
}
