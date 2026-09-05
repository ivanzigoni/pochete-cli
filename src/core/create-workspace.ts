import { existsSync } from 'node:fs';
import path from 'node:path';
import { execa } from 'execa';
import { applyAllowlistDefaults } from '../scaffolding/apply-allowlist-defaults.js';

export const WORKSPACE_REPO = 'git@github.com:ivanzigoni/pochete-toolkit.git';

export interface CreateWorkspaceOptions {
  workspaceName: string;
  repos: string[];
  applyDefaults: boolean;
}

export async function createWorkspace(options: CreateWorkspaceOptions): Promise<void> {
  const { workspaceName, repos, applyDefaults } = options;

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

  if (applyDefaults) {
    await applyAllowlistDefaults(workspaceName);
    console.log('==> allowlists padrão aplicadas');
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
