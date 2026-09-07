const RESERVED_LEADING_CHARS = new Set([
  '-',
  '?',
  ':',
  ',',
  '[',
  ']',
  '{',
  '}',
  '#',
  '&',
  '*',
  '!',
  '|',
  '>',
  "'",
  '"',
  '%',
  '@',
  '`',
]);

function needsQuoting(value: string): boolean {
  if (value === '') return true;
  if (value !== value.trim()) return true;
  if (RESERVED_LEADING_CHARS.has(value.charAt(0))) return true;
  if (value.includes(': ')) return true;
  if (value.includes('\n')) return true;
  return false;
}

function quoteYamlString(value: string): string {
  const escaped = value.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n');
  return `"${escaped}"`;
}

function formatYamlScalar(value: string): string {
  return needsQuoting(value) ? quoteYamlString(value) : value;
}

export type FrontmatterValue = string | string[] | undefined;

export function buildFrontmatter(fields: Record<string, FrontmatterValue>): string {
  const lines: string[] = [];

  for (const [key, value] of Object.entries(fields)) {
    if (value === undefined) continue;

    if (Array.isArray(value)) {
      if (value.length === 0) continue;
      lines.push(`${key}:`);
      for (const item of value) {
        lines.push(`  - ${formatYamlScalar(item)}`);
      }
      continue;
    }

    lines.push(`${key}: ${formatYamlScalar(value)}`);
  }

  if (lines.length === 0) return '';

  return `---\n${lines.join('\n')}\n---\n`;
}
