// Diagram type detection and backend selection.
// Invariant: beautiful-mermaid handles flowchart, sequenceDiagram, classDiagram,
// erDiagram, stateDiagram, xychart-beta. Everything else → mermaid-cli.

const BEAUTIFUL_TYPES = new Set([
  'flowchart',
  'graph',          // alias for flowchart
  'sequencediagram',
  'classdiagram',
  'erdiagram',
  'statediagram',
  'stateDiagram-v2',
  'xychart-beta',
]);

export type Backend = 'beautiful-mermaid' | 'mermaid-cli';

export function detectType(source: string): string {
  const firstLine = source.trim().split('\n')[0]?.trim() ?? '';

  // graph TD / graph LR etc. → flowchart
  if (/^graph\s/i.test(firstLine)) return 'flowchart';

  // flowchart variants
  if (/^flowchart/i.test(firstLine)) return 'flowchart';

  // Diagrams identified by keyword
  const keyword = firstLine.split(/\s/)[0]?.toLowerCase() ?? '';
  if (keyword) return keyword;

  return 'unknown';
}

export function selectBackend(type: string): Backend {
  if (BEAUTIFUL_TYPES.has(type)) return 'beautiful-mermaid';
  return 'mermaid-cli';
}
