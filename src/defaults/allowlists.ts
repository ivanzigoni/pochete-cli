import path from 'node:path';

export const GIT_ALLOWLIST_DEFAULT = {
  status: {},
  log: {},
  diff: {},
  show: {},
  blame: {},
  shortlog: {},
  describe: {},
  'rev-parse': {},
  'rev-list': {},
  'ls-files': {},
  grep: {},
  add: {},
  mv: {},
  clone: {},
  fetch: {},
  pull: {},
  merge: {},
  'cherry-pick': {},
  revert: {},
  worktree: {},
  restore: { requireFlag: '--staged' },
  rm: { requireFlag: '--cached' },
  config: { requireAnyFlag: ['--get', '--get-all', '--list', '-l'] },
  commit: { forbidLongFlags: ['--amend', '--no-verify'], forbidShortFlags: ['n'] },
  push: {
    forbidLongFlags: ['--force', '--force-with-lease', '--delete'],
    forbidShortFlags: ['f'],
    forbidTokenPrefix: ':',
  },
  branch: {
    forbidLongFlags: ['--delete', '--force'],
    forbidShortFlags: ['D', 'f'],
  },
  tag: {
    forbidLongFlags: ['--delete', '--force'],
    forbidShortFlags: ['d', 'D', 'f'],
  },
  switch: {
    forbidLongFlags: ['--force', '--discard-changes'],
    forbidShortFlags: ['f'],
  },
  reset: { forbidLongFlags: ['--hard'] },
  rebase: {
    forbidLongFlags: ['--interactive', '--onto'],
    forbidShortFlags: ['i'],
  },
  stash: {
    verbRule: {
      bareAllowed: true,
      flagImpliesAllowed: true,
      allowedVerbs: ['push', 'pop', 'list', 'show', 'apply'],
    },
  },
  remote: {
    verbRule: {
      bareAllowed: true,
      flagImpliesAllowed: false,
      allowedVerbs: ['-v', '--verbose', 'show'],
    },
  },
} as const;

export function buildPathAllowlistDefault(homedir: string): { paths: string[] } {
  return { paths: [path.join(homedir, '.claude', 'plans')] };
}
