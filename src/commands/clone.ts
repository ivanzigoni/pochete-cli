import { existsSync } from 'node:fs';
import path from 'node:path';
import { execa } from 'execa';
import type { Command } from 'commander';

export const WORKSPACE_REPO = 'git@github.com:ivanzigoni/pochete-toolkit.git';

export function usage(): string {
  return 'uso: pochete clone <repo1> [repo2 ...] <workspace-name>';
}

export function registerCloneCommand(program: Command): void {
  program
    .command('clone')
    .helpOption(false)
    .argument('[items...]')
    .action(async (items: string[]) => {
      await runClone(items);
    });
}

export async function runClone(items: string[]): Promise<void> {
  if (items.length < 2) {
    console.error(usage());
    process.exit(1);
    return;
  }

  const workspaceName = items[items.length - 1] as string;
  const repos = items.slice(0, -1);

  if (existsSync(workspaceName)) {
    console.error(`erro: '${workspaceName}' já existe`);
    process.exit(1);
    return;
  }

  console.log(`==> clonando workspace pochete-toolkit em '${workspaceName}'`);
  await gitClone(WORKSPACE_REPO, workspaceName);

  for (const repo of repos) {
    console.log(`==> clonando ${repo} em project/`);
    await gitClone(repo, path.join(workspaceName, 'project', repoBasename(repo)));
  }

  console.log(`==> pronto: ${workspaceName}`);
}

async function gitClone(source: string, destination: string): Promise<void> {
  try {
    await execa('git', ['clone', source, destination], { stdio: 'inherit' });
  } catch (error) {
    process.exit(extractExitCode(error));
  }
}

function extractExitCode(error: unknown): number {
  if (typeof error === 'object' && error !== null && 'exitCode' in error) {
    const { exitCode } = error as { exitCode?: unknown };
    if (typeof exitCode === 'number') return exitCode;
  }
  return 1;
}

function repoBasename(repo: string): string {
  const base = path.basename(repo);
  return base.endsWith('.git') ? base.slice(0, -'.git'.length) : base;
}
