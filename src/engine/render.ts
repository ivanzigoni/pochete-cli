import { randomUUID } from 'node:crypto';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { compileMDXPromptFile } from 'mdx-prompt';
import { renderToStaticMarkup } from 'react-dom/server';
import { decodeReactTextEscaping } from './entities.js';
import { resolveIncludes } from './include.js';

export interface RenderMarkdownDocOptions {
  filePath: string;
  data?: unknown;
  components?: Record<string, unknown>;
}

export async function renderMarkdownDoc(options: RenderMarkdownDocOptions): Promise<string> {
  const { filePath, data, components } = options;

  const rawSource = readFileSync(filePath, 'utf-8');
  const assembledSource = resolveIncludes(rawSource, filePath);

  const tempDir = mkdtempSync(join(tmpdir(), 'pochete-build-'));
  const tempFilePath = join(tempDir, `${randomUUID()}.mdx`);

  try {
    writeFileSync(tempFilePath, assembledSource, 'utf-8');
    const content = await compileMDXPromptFile(tempFilePath, data, components);
    const rawHtml = renderToStaticMarkup(content);
    const decoded = decodeReactTextEscaping(rawHtml);
    return decoded.replace(/^\n+/, '');
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
}
