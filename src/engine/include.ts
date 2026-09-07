import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const INCLUDE_PATTERN = /<Include\s+skill=["']([^"']+)["']\s*\/>/g;

export function resolveIncludes(
  source: string,
  filePath: string,
  visited: Set<string> = new Set(),
): string {
  const absolutePath = resolve(filePath);
  if (visited.has(absolutePath)) {
    throw new Error(`ciclo de <Include> detectado envolvendo '${absolutePath}'`);
  }
  const visitedWithCurrent = new Set(visited).add(absolutePath);

  return source.replace(INCLUDE_PATTERN, (_match, skillName: string) => {
    const includedPath = resolve(dirname(filePath), `${skillName}.mdx`);
    const includedSource = readFileSync(includedPath, 'utf-8');
    return resolveIncludes(includedSource, includedPath, visitedWithCurrent);
  });
}
