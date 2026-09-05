import { mkdir, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GIT_ALLOWLIST_DEFAULT } from '../defaults/allowlists.js';
import { applyAllowlistDefaults } from './apply-allowlist-defaults.js';

vi.mock('node:fs/promises', () => ({ mkdir: vi.fn(), writeFile: vi.fn() }));
vi.mock('node:os', () => ({ default: { homedir: vi.fn() } }));

const mkdirMock = vi.mocked(mkdir);
const writeFileMock = vi.mocked(writeFile);
const homedirMock = vi.mocked(os.homedir);

describe('applyAllowlistDefaults', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mkdirMock.mockResolvedValue(undefined);
    writeFileMock.mockResolvedValue(undefined);
    homedirMock.mockReturnValue('/home/alguem');
  });

  it('escreve o git-allowlist.json com o default estático', async () => {
    await applyAllowlistDefaults('/tmp/ws');

    const gitAllowlistPath = path.join(
      '/tmp/ws',
      '.claude/hooks/pctk__enforce-git-allowlist/git-allowlist.json',
    );
    expect(mkdirMock).toHaveBeenCalledWith(path.dirname(gitAllowlistPath), { recursive: true });
    expect(writeFileMock).toHaveBeenCalledWith(
      gitAllowlistPath,
      `${JSON.stringify(GIT_ALLOWLIST_DEFAULT, null, 2)}\n`,
      'utf8',
    );
  });

  it('escreve o path-allowlist.json com a pasta de planos do homedir do sistema', async () => {
    await applyAllowlistDefaults('/tmp/ws');

    const pathAllowlistPath = path.join(
      '/tmp/ws',
      '.claude/hooks/pctk__enforce-path-allowlist/path-allowlist.json',
    );
    expect(writeFileMock).toHaveBeenCalledWith(
      pathAllowlistPath,
      `${JSON.stringify({ paths: [path.join('/home/alguem', '.claude', 'plans')] }, null, 2)}\n`,
      'utf8',
    );
  });
});
