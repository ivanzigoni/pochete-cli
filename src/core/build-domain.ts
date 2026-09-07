import { existsSync } from 'node:fs';
import { mkdir, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { createJiti } from 'jiti';
import type { ReactNode } from 'react';
import * as react from 'react';
import * as reactJsxDevRuntime from 'react/jsx-dev-runtime';
import * as reactJsxRuntime from 'react/jsx-runtime';
import * as nativeComponents from '../engine/components/index.js';
import { renderMarkdownDoc } from '../engine/render.js';

type DomainFileKind = 'skill' | 'rule' | 'block';

interface RenderedDomainFile {
  sourcePath: string;
  destinationPath: string;
  markdown: string;
}

export async function buildDomain(workspaceDir: string): Promise<void> {
  const domainDir = path.join(workspaceDir, 'domain');
  const claudeDir = path.join(workspaceDir, '.claude');

  if (!existsSync(domainDir)) {
    throw new Error(
      `'domain/' não encontrado em '${workspaceDir}' — rode 'pochete build' a partir da raiz do workspace`,
    );
  }

  const domainFiles = await listFilesRecursively(domainDir);
  const tsxFiles = domainFiles.filter((file) => file.endsWith('.tsx'));
  const mdxFiles = domainFiles.filter((file) => file.endsWith('.mdx'));

  const userComponents = await loadUserComponents(tsxFiles);
  const baseComponents = {
    ...nativeComponents,
    ...nativeComponents.markdownComponents,
    ...userComponents,
  };

  const renderedFiles = await renderDomainFiles(mdxFiles, domainDir, claudeDir, baseComponents);

  for (const file of renderedFiles) {
    await mkdir(path.dirname(file.destinationPath), { recursive: true });
    await writeFile(file.destinationPath, file.markdown, 'utf-8');
  }
}

async function renderDomainFiles(
  mdxFiles: string[],
  domainDir: string,
  claudeDir: string,
  baseComponents: Record<string, unknown>,
): Promise<RenderedDomainFile[]> {
  const renderedFiles: RenderedDomainFile[] = [];
  const destinationOwners = new Map<string, string>();

  for (const mdxFile of mdxFiles) {
    const tracker: { kind: DomainFileKind | null } = { kind: null };
    const componentsForFile = {
      ...baseComponents,
      Skill: trackInvocation('skill', nativeComponents.Skill, tracker),
      Rule: trackInvocation('rule', nativeComponents.Rule, tracker),
      Block: trackInvocation('block', nativeComponents.Block, tracker),
    };

    const markdown = await renderMarkdownDoc({ filePath: mdxFile, components: componentsForFile });

    if (tracker.kind === null) {
      console.log(
        `==> '${path.relative(domainDir, mdxFile)}' não usa Skill, Rule nem Block — ignorado`,
      );
      continue;
    }

    const destinationPath = resolveDestinationPath(tracker.kind, claudeDir, mdxFile);
    const owner = destinationOwners.get(destinationPath);
    if (owner !== undefined) {
      throw new Error(
        `'${owner}' e '${mdxFile}' geram o mesmo arquivo de destino '${destinationPath}'`,
      );
    }
    destinationOwners.set(destinationPath, mdxFile);
    renderedFiles.push({ sourcePath: mdxFile, destinationPath, markdown });
  }

  return renderedFiles;
}

function trackInvocation<P>(
  kind: DomainFileKind,
  Component: (props: P) => ReactNode,
  tracker: { kind: DomainFileKind | null },
): (props: P) => ReactNode {
  return (props: P) => {
    if (tracker.kind === null) tracker.kind = kind;
    return Component(props);
  };
}

function resolveDestinationPath(kind: DomainFileKind, claudeDir: string, mdxFile: string): string {
  const basename = path.basename(mdxFile, '.mdx');

  if (kind === 'skill') {
    return path.join(claudeDir, 'skills', `user__${basename}`, 'SKILL.md');
  }

  if (kind === 'rule') {
    return path.join(claudeDir, 'rules', `user__${basename}.md`);
  }

  return path.join(claudeDir, 'blocks', `user__${basename}.md`);
}

async function loadUserComponents(tsxFiles: string[]): Promise<Record<string, unknown>> {
  if (tsxFiles.length === 0) return {};

  const jiti = createJiti(__filename, {
    jsx: { runtime: 'automatic' },
    virtualModules: {
      'pochete-cli/components': nativeComponents,
      react,
      'react/jsx-runtime': reactJsxRuntime,
      'react/jsx-dev-runtime': reactJsxDevRuntime,
    },
  });

  const merged: Record<string, unknown> = {};
  for (const tsxFile of tsxFiles) {
    const moduleExports = await jiti.import<Record<string, unknown>>(tsxFile);
    Object.assign(merged, moduleExports);
  }

  return merged;
}

async function listFilesRecursively(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { recursive: true, withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile())
    .map((entry) => path.join(entry.parentPath, entry.name));
}
