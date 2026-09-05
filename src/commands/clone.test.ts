import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { existsSync } from 'node:fs';
import { confirm } from '@inquirer/prompts';
import { execa } from 'execa';
import { applyAllowlistDefaults } from '../scaffolding/apply-allowlist-defaults.js';
import { runClone, usage, WORKSPACE_REPO } from './clone.js';

vi.mock('node:fs', () => ({ existsSync: vi.fn() }));
vi.mock('execa', () => ({ execa: vi.fn() }));
vi.mock('@inquirer/prompts', () => ({ confirm: vi.fn() }));
vi.mock('../scaffolding/apply-allowlist-defaults.js', () => ({
  applyAllowlistDefaults: vi.fn(),
}));

const existsSyncMock = vi.mocked(existsSync);
const execaMock = vi.mocked(execa);
const confirmMock = vi.mocked(confirm);
const applyAllowlistDefaultsMock = vi.mocked(applyAllowlistDefaults);

describe('runClone', () => {
  const originalIsTTY = process.stdin.isTTY;

  beforeEach(() => {
    vi.clearAllMocks();
    existsSyncMock.mockReturnValue(false);
    execaMock.mockResolvedValue({} as never);
    applyAllowlistDefaultsMock.mockResolvedValue(undefined);
    process.stdin.isTTY = true;
    vi.spyOn(console, 'log').mockImplementation(() => undefined);
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    vi.spyOn(process, 'exit').mockImplementation(() => undefined as never);
  });

  afterEach(() => {
    process.stdin.isTTY = originalIsTTY;
  });

  it('clona a toolkit e um repo em project/', async () => {
    confirmMock.mockResolvedValue(false);

    await runClone(['git@github.com:org/servico.git', 'meu-workspace']);

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
    confirmMock.mockResolvedValue(false);

    await runClone(['repoA.git', 'repoB.git', 'ws']);

    expect(execaMock).toHaveBeenCalledTimes(3);
    expect(execaMock).toHaveBeenNthCalledWith(
      2,
      'git',
      ['clone', 'repoA.git', 'ws/project/repoA'],
      { stdio: 'inherit' },
    );
    expect(execaMock).toHaveBeenNthCalledWith(
      3,
      'git',
      ['clone', 'repoB.git', 'ws/project/repoB'],
      { stdio: 'inherit' },
    );
  });

  it('falha quando o workspace já existe', async () => {
    existsSyncMock.mockReturnValue(true);

    await runClone(['repo.git', 'ws-existente']);

    expect(console.error).toHaveBeenCalledWith("erro: 'ws-existente' já existe");
    expect(execaMock).not.toHaveBeenCalled();
    expect(process.exit).toHaveBeenCalledWith(1);
  });

  it('falha quando faltam argumentos', async () => {
    await runClone(['apenas-um-arg']);

    expect(console.error).toHaveBeenCalledWith(usage());
    expect(existsSyncMock).not.toHaveBeenCalled();
    expect(process.exit).toHaveBeenCalledWith(1);
  });

  it('propaga o exit code do git quando o clone falha', async () => {
    confirmMock.mockResolvedValue(false);
    execaMock.mockRejectedValueOnce(Object.assign(new Error('boom'), { exitCode: 128 }));

    await runClone(['repo.git', 'ws']);

    expect(process.exit).toHaveBeenCalledWith(128);
  });

  describe('defaults de allowlist', () => {
    it('pergunta e aplica os defaults quando o usuário confirma', async () => {
      confirmMock.mockResolvedValue(true);

      await runClone(['repo.git', 'ws']);

      expect(confirmMock).toHaveBeenCalledWith({
        message:
          'Aplicar as configurações padrão recomendadas de allowlist (git e paths) neste workspace?',
        default: true,
      });
      expect(applyAllowlistDefaultsMock).toHaveBeenCalledWith('ws');
      expect(console.log).toHaveBeenCalledWith('==> allowlists padrão aplicadas');
    });

    it('pergunta e não aplica os defaults quando o usuário recusa', async () => {
      confirmMock.mockResolvedValue(false);

      await runClone(['repo.git', 'ws']);

      expect(confirmMock).toHaveBeenCalled();
      expect(applyAllowlistDefaultsMock).not.toHaveBeenCalled();
    });

    it('--yes aplica sem perguntar', async () => {
      await runClone(['repo.git', 'ws'], { yes: true });

      expect(confirmMock).not.toHaveBeenCalled();
      expect(applyAllowlistDefaultsMock).toHaveBeenCalledWith('ws');
    });

    it('--no-defaults não aplica sem perguntar', async () => {
      await runClone(['repo.git', 'ws'], { defaults: false });

      expect(confirmMock).not.toHaveBeenCalled();
      expect(applyAllowlistDefaultsMock).not.toHaveBeenCalled();
    });

    it('sem TTY, aplica sem perguntar', async () => {
      process.stdin.isTTY = false;

      await runClone(['repo.git', 'ws']);

      expect(confirmMock).not.toHaveBeenCalled();
      expect(applyAllowlistDefaultsMock).toHaveBeenCalledWith('ws');
    });
  });
});
