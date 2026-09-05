import { existsSync } from 'node:fs';
import path from 'node:path';
import { confirm } from '@inquirer/prompts';
import { execa } from 'execa';
import type { Command } from 'commander';
import { applyAllowlistDefaults } from '../scaffolding/apply-allowlist-defaults.js';

export const WORKSPACE_REPO = 'git@github.com:ivanzigoni/pochete-toolkit.git';

export interface CloneOptions {
  yes?: boolean;
  defaults?: boolean;
}

export function usage(): string {
  return 'uso: pochete clone [--yes] [--no-defaults] <repo1> [repo2 ...] <workspace-name>';
}

export function registerCloneCommand(program: Command): void {
  program
    .command('clone')
    .helpOption(false)
    .option('-y, --yes', 'aplica os defaults recomendados de allowlist sem perguntar')
    .option('--no-defaults', 'não aplica os defaults recomendados de allowlist')
    .argument('[items...]')
    .action(async (items: string[], options: CloneOptions) => {
      await runClone(items, options);
    });
}

export async function runClone(items: string[], options: CloneOptions = {}): Promise<void> {
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

  const applyDefaults = await shouldApplyDefaults(options);

  console.log(`==> clonando workspace pochete-toolkit em '${workspaceName}'`);
  await gitClone(WORKSPACE_REPO, workspaceName);

  for (const repo of repos) {
    console.log(`==> clonando ${repo} em project/`);
    await gitClone(repo, path.join(workspaceName, 'project', repoBasename(repo)));
  }

  if (applyDefaults) {
    await applyAllowlistDefaults(workspaceName);
    console.log('==> allowlists padrão aplicadas');
  }

  console.log(`==> pronto: ${workspaceName}`);
}

async function shouldApplyDefaults(options: CloneOptions): Promise<boolean> {
  if (options.yes) return true;
  if (options.defaults === false) return false;
  if (!process.stdin.isTTY) return true;

  return confirm({
    message:
      'Aplicar as configurações padrão recomendadas de allowlist (git e paths) neste workspace?',
    default: true,
  });
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
