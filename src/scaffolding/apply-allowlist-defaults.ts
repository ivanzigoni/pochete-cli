import { mkdir, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { buildPathAllowlistDefault, GIT_ALLOWLIST_DEFAULT } from '../defaults/allowlists.js';

export async function applyAllowlistDefaults(workspaceDir: string): Promise<void> {
  await writeJson(
    path.join(workspaceDir, '.claude/hooks/pctk__enforce-git-allowlist/git-allowlist.json'),
    GIT_ALLOWLIST_DEFAULT,
  );
  await writeJson(
    path.join(workspaceDir, '.claude/hooks/pctk__enforce-path-allowlist/path-allowlist.json'),
    buildPathAllowlistDefault(os.homedir()),
  );
}

async function writeJson(filePath: string, content: unknown): Promise<void> {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, `${JSON.stringify(content, null, 2)}\n`, 'utf8');
}
