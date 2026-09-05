import type { Command } from 'commander';
import { createWorkspace } from '../core/create-workspace.js';

export interface CloneOptions {
  workspace?: string;
  repo?: string[];
  defaults?: boolean;
}

export function usage(): string {
  return 'uso: pochete clone --workspace <nome> --repo <url> [--repo <url> ...] [--no-defaults]';
}

export function registerCloneCommand(program: Command): void {
  program
    .command('clone')
    .helpOption(false)
    .option('--workspace <nome>', 'nome/caminho do workspace a criar')
    .option(
      '--repo <url>',
      'repositório de aplicação a clonar em project/ (repetível)',
      collectRepo,
      [] as string[],
    )
    .option('--no-defaults', 'não aplica os defaults recomendados de allowlist')
    .action(async (options: CloneOptions) => {
      await runClone(options);
    });
}

function collectRepo(value: string, previous: string[]): string[] {
  return previous.concat([value]);
}

export async function runClone(options: CloneOptions): Promise<void> {
  const repos = options.repo ?? [];

  if (!options.workspace || repos.length === 0) {
    console.error(usage());
    process.exit(1);
    return;
  }

  await createWorkspace({
    workspaceName: options.workspace,
    repos,
    applyDefaults: options.defaults !== false,
  });
}
