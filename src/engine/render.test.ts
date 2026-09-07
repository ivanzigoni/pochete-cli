import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { markdownComponents } from './components/markdown.js';
import { renderMarkdownDoc } from './render.js';

describe('renderMarkdownDoc', () => {
  let dir: string;

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'pochete-render-test-'));
  });

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  function write(name: string, content: string): string {
    const filePath = join(dir, name);
    writeFileSync(filePath, content, 'utf-8');
    return filePath;
  }

  it('compila markdown simples e remove quebras de linha líderes', async () => {
    const filePath = write('doc.mdx', '\n\n# Título');

    const result = await renderMarkdownDoc({ filePath, components: markdownComponents });

    expect(result).toBe('# Título\n\n');
  });

  it('resolve <Include> antes de compilar, permitindo composição entre arquivos', async () => {
    write('base.mdx', 'conteúdo incluído');
    const filePath = write('entry.mdx', 'antes: <Include skill="base" />');

    const result = await renderMarkdownDoc({ filePath, components: markdownComponents });

    expect(result).toBe('antes: conteúdo incluído\n\n');
  });

  it('injeta e usa componentes customizados passados via options', async () => {
    const filePath = write('entry.mdx', '<Custom nome="mundo" />');

    function Custom({ nome }: { nome: string }) {
      return `olá, ${nome}`;
    }

    const result = await renderMarkdownDoc({ filePath, components: { Custom } });

    expect(result).toBe('olá, mundo');
  });
});
