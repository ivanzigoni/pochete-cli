import { existsSync } from 'node:fs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { confirm, input } from '@inquirer/prompts';
import { createWorkspace } from '../core/create-workspace.js';
import { runInit } from './init.js';

vi.mock('node:fs', () => ({ existsSync: vi.fn() }));
vi.mock('@inquirer/prompts', () => ({ input: vi.fn(), confirm: vi.fn() }));
vi.mock('../core/create-workspace.js', () => ({ createWorkspace: vi.fn() }));

const existsSyncMock = vi.mocked(existsSync);
const inputMock = vi.mocked(input);
const confirmMock = vi.mocked(confirm);
const createWorkspaceMock = vi.mocked(createWorkspace);

describe('runInit', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    existsSyncMock.mockReturnValue(false);
    createWorkspaceMock.mockResolvedValue(undefined);
  });

  it('pergunta nome, repo e aplica defaults quando não há mais repos e a resposta é sim', async () => {
    inputMock.mockResolvedValueOnce('meu-workspace').mockResolvedValueOnce('repo.git');
    confirmMock
      .mockResolvedValueOnce(false) // adicionar outro repositório?
      .mockResolvedValueOnce(true); // aplicar defaults?

    await runInit();

    expect(inputMock).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ message: 'Nome do workspace (diretório a criar):' }),
    );
    expect(inputMock).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ message: 'URL do repositório de aplicação a clonar em project/:' }),
    );
    expect(confirmMock).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        message: 'Adicionar outro repositório de aplicação?',
        default: false,
      }),
    );
    expect(confirmMock).toHaveBeenNthCalledWith(2, expect.objectContaining({ default: true }));
    expect(createWorkspaceMock).toHaveBeenCalledWith({
      workspaceName: 'meu-workspace',
      repos: ['repo.git'],
      applyDefaults: true,
    });
  });

  it('acumula repositórios extras enquanto o usuário confirmar', async () => {
    inputMock
      .mockResolvedValueOnce('ws')
      .mockResolvedValueOnce('repoA.git')
      .mockResolvedValueOnce('repoB.git')
      .mockResolvedValueOnce('repoC.git');
    confirmMock
      .mockResolvedValueOnce(true) // adicionar mais um (após repoA)
      .mockResolvedValueOnce(true) // adicionar mais um (após repoB)
      .mockResolvedValueOnce(false) // não adicionar mais (após repoC)
      .mockResolvedValueOnce(false); // não aplicar defaults

    await runInit();

    expect(createWorkspaceMock).toHaveBeenCalledWith({
      workspaceName: 'ws',
      repos: ['repoA.git', 'repoB.git', 'repoC.git'],
      applyDefaults: false,
    });
  });

  it('valida que o nome do workspace não pode já existir', async () => {
    inputMock.mockResolvedValueOnce('ws-existente').mockResolvedValueOnce('repo.git');
    confirmMock.mockResolvedValueOnce(false).mockResolvedValueOnce(false);

    await runInit();

    const validate = (
      inputMock.mock.calls[0]?.[0] as { validate: (value: string) => string | boolean }
    ).validate;

    existsSyncMock.mockReturnValue(false);
    expect(validate('workspace-novo')).toBe(true);

    existsSyncMock.mockReturnValue(true);
    expect(validate('ws-existente')).toBe("'ws-existente' já existe");

    expect(validate('')).toBe('informe um nome de workspace');
  });
});
