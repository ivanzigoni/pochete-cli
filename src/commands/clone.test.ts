import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createWorkspace } from '../core/create-workspace.js';
import { runClone, usage } from './clone.js';

vi.mock('../core/create-workspace.js', () => ({ createWorkspace: vi.fn() }));

const createWorkspaceMock = vi.mocked(createWorkspace);

describe('runClone', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    createWorkspaceMock.mockResolvedValue(undefined);
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    vi.spyOn(process, 'exit').mockImplementation(() => undefined as never);
  });

  it('delega para createWorkspace com workspace, repos e defaults aplicados', async () => {
    await runClone({ workspace: 'ws', repo: ['repoA.git', 'repoB.git'] });

    expect(createWorkspaceMock).toHaveBeenCalledWith({
      workspaceName: 'ws',
      repos: ['repoA.git', 'repoB.git'],
      applyDefaults: true,
    });
    expect(process.exit).not.toHaveBeenCalled();
  });

  it('repassa --no-defaults como applyDefaults: false', async () => {
    await runClone({ workspace: 'ws', repo: ['repo.git'], defaults: false });

    expect(createWorkspaceMock).toHaveBeenCalledWith({
      workspaceName: 'ws',
      repos: ['repo.git'],
      applyDefaults: false,
    });
  });

  it('falha quando --workspace está ausente', async () => {
    await runClone({ repo: ['repo.git'] });

    expect(console.error).toHaveBeenCalledWith(usage());
    expect(createWorkspaceMock).not.toHaveBeenCalled();
    expect(process.exit).toHaveBeenCalledWith(1);
  });

  it('falha quando nenhum --repo é informado', async () => {
    await runClone({ workspace: 'ws' });

    expect(console.error).toHaveBeenCalledWith(usage());
    expect(createWorkspaceMock).not.toHaveBeenCalled();
    expect(process.exit).toHaveBeenCalledWith(1);
  });
});
