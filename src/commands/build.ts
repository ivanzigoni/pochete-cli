import type { Command } from 'commander';
import { buildDomain } from '../core/build-domain.js';

export function usage(): string {
  return 'uso: pochete build';
}

export function registerBuildCommand(program: Command): void {
  program
    .command('build')
    .helpOption(false)
    .action(async () => {
      await runBuild();
    });
}

export async function runBuild(): Promise<void> {
  console.log('==> lendo domain/');
  await buildDomain(process.cwd());
  console.log('==> .claude/ atualizado a partir de domain/');
}
