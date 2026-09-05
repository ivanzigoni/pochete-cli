import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { buildPathAllowlistDefault, GIT_ALLOWLIST_DEFAULT } from './allowlists.js';

describe('GIT_ALLOWLIST_DEFAULT', () => {
  it('permite os subcomandos de leitura sem restrição', () => {
    expect(GIT_ALLOWLIST_DEFAULT.status).toEqual({});
    expect(GIT_ALLOWLIST_DEFAULT.log).toEqual({});
    expect(GIT_ALLOWLIST_DEFAULT.clone).toEqual({});
  });

  it('restringe subcomandos destrutivos', () => {
    expect(GIT_ALLOWLIST_DEFAULT.push.forbidLongFlags).toContain('--force');
    expect(GIT_ALLOWLIST_DEFAULT.reset.forbidLongFlags).toContain('--hard');
    expect(GIT_ALLOWLIST_DEFAULT.commit.forbidLongFlags).toContain('--no-verify');
  });
});

describe('buildPathAllowlistDefault', () => {
  it('aponta para a pasta de planos dentro do homedir informado', () => {
    expect(buildPathAllowlistDefault('/home/alguem')).toEqual({
      paths: [path.join('/home/alguem', '.claude', 'plans')],
    });
  });
});
