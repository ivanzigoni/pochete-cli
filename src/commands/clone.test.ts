import { beforeEach, describe, expect, it, vi } from 'vitest';
import { existsSync } from 'node:fs';
import { execa } from 'execa';
import { runClone, usage, WORKSPACE_REPO } from './clone.js';

vi.mock('node:fs', () => ({ existsSync: vi.fn() }));
vi.mock('execa', () => ({ execa: vi.fn() }));

const existsSyncMock = vi.mocked(existsSync);
const execaMock = vi.mocked(execa);

describe('runClone', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    existsSyncMock.mockReturnValue(false);
    execaMock.mockResolvedValue({} as never);
    vi.spyOn(console, 'log').mockImplementation(() => undefined);
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    vi.spyOn(process, 'exit').mockImplementation(() => undefined as never);
  });

  it('clona a toolkit e um repo em project/', async () => {
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
    execaMock.mockRejectedValueOnce(Object.assign(new Error('boom'), { exitCode: 128 }));

    await runClone(['repo.git', 'ws']);

    expect(process.exit).toHaveBeenCalledWith(128);
  });
});
