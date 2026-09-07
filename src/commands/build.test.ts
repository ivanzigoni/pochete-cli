import { beforeEach, describe, expect, it, vi } from 'vitest';
import { buildDomain } from '../core/build-domain.js';
import { runBuild } from './build.js';

vi.mock('../core/build-domain.js', () => ({ buildDomain: vi.fn() }));

const buildDomainMock = vi.mocked(buildDomain);

describe('runBuild', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    buildDomainMock.mockResolvedValue(undefined);
  });

  it('roda buildDomain a partir do diretório de trabalho atual', async () => {
    await runBuild();

    expect(buildDomainMock).toHaveBeenCalledWith(process.cwd());
  });

  it('propaga o erro de buildDomain sem engoli-lo', async () => {
    const error = new Error("'domain/' não encontrado");
    buildDomainMock.mockRejectedValue(error);

    await expect(runBuild()).rejects.toThrow(error);
  });
});
