import { beforeEach, describe, expect, it, vi } from 'vitest';
import { existsSync } from 'node:fs';
import { execa } from 'execa';
import { applyAllowlistDefaults } from '../scaffolding/apply-allowlist-defaults.js';
import { createWorkspace, WORKSPACE_REPO } from './create-workspace.js';

vi.mock('node:fs', () => ({ existsSync: vi.fn() }));
vi.mock('execa', () => ({ execa: vi.fn() }));
vi.mock('../scaffolding/apply-allowlist-defaults.js', () => ({
  applyAllowlistDefaults: vi.fn(),
}));

const existsSyncMock = vi.mocked(existsSync);
const execaMock = vi.mocked(execa);
const applyAllowlistDefaultsMock = vi.mocked(applyAllowlistDefaults);

describe('createWorkspace', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    existsSyncMock.mockReturnValue(false);
    execaMock.mockResolvedValue({} as never);
    applyAllowlistDefaultsMock.mockResolvedValue(undefined);
    vi.spyOn(console, 'log').mockImplementation(() => undefined);
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    vi.spyOn(process, 'exit').mockImplementation(() => undefined as never);
  });

  it('clona a toolkit e um repo em project/', async () => {
    await createWorkspace({
      workspaceName: 'meu-workspace',
      repos: ['git@github.com:org/servico.git'],
      applyDefaults: false,
    });

    expect(execaMock).toHaveBeenNthCalledWith(
      1,
      'git',
      ['clone', WORKSPACE_REPO, 'meu-workspace'],
      { stdio: 'inherit' },
    );
    expect(execaMock).toHaveBeenNthCalledWith(
      2,
      'git',
      ['clone', 'git@github.com:org/servico.git', 'meu-workspace/project/servico'],
      { stdio: 'inherit' },
    );
    expect(console.log).toHaveBeenCalledWith('==> pronto: meu-workspace');
    expect(process.exit).not.toHaveBeenCalled();
  });

  it('clona múltiplos repos em project/', async () => {
    await createWorkspace({
      workspaceName: 'ws',
      repos: ['repoA.git', 'repoB.git'],
      applyDefaults: false,
    });

    expect(execaMock).toHaveBeenCalledTimes(3);
    expect(execaMock).toHaveBeenNthCalledWith(
      2,
      'git',
      ['clone', 'repoA.git', 'ws/project/repoA'],
      {
        stdio: 'inherit',
      },
    );
    expect(execaMock).toHaveBeenNthCalledWith(
      3,
      'git',
      ['clone', 'repoB.git', 'ws/project/repoB'],
      {
        stdio: 'inherit',
      },
    );
  });

  it('falha quando o workspace já existe', async () => {
    existsSyncMock.mockReturnValue(true);

    await createWorkspace({
      workspaceName: 'ws-existente',
      repos: ['repo.git'],
      applyDefaults: false,
    });

    expect(console.error).toHaveBeenCalledWith("erro: 'ws-existente' já existe");
    expect(execaMock).not.toHaveBeenCalled();
    expect(process.exit).toHaveBeenCalledWith(1);
  });

  it('propaga o exit code do git quando o clone falha', async () => {
    execaMock.mockRejectedValueOnce(Object.assign(new Error('boom'), { exitCode: 128 }));

    await createWorkspace({ workspaceName: 'ws', repos: ['repo.git'], applyDefaults: false });

    expect(process.exit).toHaveBeenCalledWith(128);
  });

  it('aplica os defaults de allowlist quando applyDefaults é true', async () => {
    await createWorkspace({ workspaceName: 'ws', repos: ['repo.git'], applyDefaults: true });

    expect(applyAllowlistDefaultsMock).toHaveBeenCalledWith('ws');
    expect(console.log).toHaveBeenCalledWith('==> allowlists padrão aplicadas');
  });

  it('não aplica os defaults de allowlist quando applyDefaults é false', async () => {
    await createWorkspace({ workspaceName: 'ws', repos: ['repo.git'], applyDefaults: false });

    expect(applyAllowlistDefaultsMock).not.toHaveBeenCalled();
  });
});
