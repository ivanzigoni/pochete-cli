import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { resolveIncludes } from './include.js';

describe('resolveIncludes', () => {
  let dir: string;

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'pochete-include-test-'));
  });

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  function write(name: string, content: string): string {
    const filePath = join(dir, name);
    writeFileSync(filePath, content, 'utf-8');
    return filePath;
  }

  it('substitui <Include skill="..." /> pelo texto-fonte bruto do arquivo referenciado', () => {
    write('base.mdx', 'conteúdo base');
    const entryPath = write('entry.mdx', 'antes\n<Include skill="base" />\ndepois');

    const result = resolveIncludes('antes\n<Include skill="base" />\ndepois', entryPath);

    expect(result).toBe('antes\nconteúdo base\ndepois');
  });

  it('resolve includes aninhados recursivamente', () => {
    write('leaf.mdx', 'folha');
    write('middle.mdx', 'meio: <Include skill="leaf" />');
    const entryPath = write('entry.mdx', '<Include skill="middle" />');

    const result = resolveIncludes('<Include skill="middle" />', entryPath);

    expect(result).toBe('meio: folha');
  });

  it('permite a mesma inclusão em dois ramos diferentes sem falso positivo de ciclo', () => {
    write('shared.mdx', 'compartilhado');
    write('branchA.mdx', 'A: <Include skill="shared" />');
    write('branchB.mdx', 'B: <Include skill="shared" />');
    const entryPath = write(
      'entry.mdx',
      '<Include skill="branchA" />\n<Include skill="branchB" />',
    );

    const result = resolveIncludes(
      '<Include skill="branchA" />\n<Include skill="branchB" />',
      entryPath,
    );

    expect(result).toBe('A: compartilhado\nB: compartilhado');
  });

  it('detecta ciclo direto (A inclui A)', () => {
    const entryPath = write('self.mdx', '<Include skill="self" />');

    expect(() => resolveIncludes('<Include skill="self" />', entryPath)).toThrow(/ciclo/);
  });

  it('detecta ciclo indireto (A inclui B, B inclui A)', () => {
    write('a.mdx', '<Include skill="b" />');
    const bPath = write('b.mdx', '<Include skill="a" />');

    expect(() => resolveIncludes('<Include skill="a" />', bPath)).toThrow(/ciclo/);
  });
});
