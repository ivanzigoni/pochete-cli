import { existsSync } from 'node:fs';
import { confirm, input } from '@inquirer/prompts';
import type { Command } from 'commander';
import { createWorkspace } from '../core/create-workspace.js';

export function registerInitCommand(program: Command): void {
  program
    .command('init')
    .helpOption(false)
    .action(async () => {
      await runInit();
    });
}

export async function runInit(): Promise<void> {
  const workspaceName = await input({
    message: 'Nome do workspace (diretório a criar):',
    validate: validateWorkspaceName,
  });

  const repos: string[] = [await input({ message: REPO_URL_MESSAGE, validate: validateRepoUrl })];

  while (await confirm({ message: 'Adicionar outro repositório de aplicação?', default: false })) {
    repos.push(await input({ message: REPO_URL_MESSAGE, validate: validateRepoUrl }));
  }

  const applyDefaults = await confirm({
    message:
      'Aplicar as configurações padrão recomendadas de allowlist (git e paths) neste workspace?',
    default: true,
  });

  await createWorkspace({ workspaceName, repos, applyDefaults });
}

const REPO_URL_MESSAGE = 'URL do repositório de aplicação a clonar em project/:';

function validateWorkspaceName(value: string): string | boolean {
  if (value.trim().length === 0) return 'informe um nome de workspace';
  if (existsSync(value)) return `'${value}' já existe`;
  return true;
}

function validateRepoUrl(value: string): string | boolean {
  if (value.trim().length === 0) return 'informe a URL do repositório';
  return true;
}
