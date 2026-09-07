import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { buildDomain } from './build-domain.js';

describe('buildDomain', () => {
  let workspaceDir: string;

  beforeEach(() => {
    workspaceDir = mkdtempSync(join(tmpdir(), 'pochete-build-domain-test-'));
  });

  afterEach(() => {
    rmSync(workspaceDir, { recursive: true, force: true });
  });

  function writeDomainFile(relativePath: string, content: string): void {
    const filePath = join(workspaceDir, 'domain', relativePath);
    mkdirSync(join(filePath, '..'), { recursive: true });
    writeFileSync(filePath, content, 'utf-8');
  }

  function outputPath(relativePath: string): string {
    return join(workspaceDir, '.claude', relativePath);
  }

  function readOutput(relativePath: string): string {
    return readFileSync(outputPath(relativePath), 'utf-8');
  }

  it('rejeita quando domain/ não existe', async () => {
    await expect(buildDomain(workspaceDir)).rejects.toThrow(/domain/);
  });

  it('mapeia um .mdx embrulhado em <Skill>, em qualquer profundidade, para .claude/skills/user__<nome>/SKILL.md', async () => {
    writeDomainFile(
      'time-a/onboarding/minha-skill.mdx',
      '<Skill name="minha-skill" description="descrição de teste">conteúdo</Skill>',
    );

    await buildDomain(workspaceDir);

    const skillMd = readOutput('skills/user__minha-skill/SKILL.md');
    expect(skillMd).toContain('name: minha-skill');
    expect(skillMd).toContain('conteúdo');
  });

  it('mapeia um .mdx embrulhado em <Rule>, em qualquer profundidade, para .claude/rules/user__<nome>.md', async () => {
    writeDomainFile('seguranca/csrf/minha-regra.mdx', '<Rule>conteúdo da regra</Rule>');

    await buildDomain(workspaceDir);

    expect(readOutput('rules/user__minha-regra.md')).toContain('conteúdo da regra');
  });

  it('mapeia um .mdx embrulhado em <Block>, em qualquer profundidade, para .claude/blocks/user__<nome>.md (sem espelhar o caminho)', async () => {
    writeDomainFile('notas/arquitetura/decisao.mdx', '<Block>conteúdo do bloco</Block>');

    await buildDomain(workspaceDir);

    expect(readOutput('blocks/user__decisao.md')).toContain('conteúdo do bloco');
  });

  it('mantém a classificação do wrapper mais externo mesmo com um <Block> aninhado por dentro (via <Include>)', async () => {
    writeDomainFile('bloco-interno.mdx', '<Block>conteúdo interno</Block>');
    writeDomainFile(
      'skill-com-include.mdx',
      '<Skill name="x" description="y"><Include skill="bloco-interno" />resto da skill</Skill>',
    );

    await buildDomain(workspaceDir);

    expect(readOutput('skills/user__skill-com-include/SKILL.md')).toContain('conteúdo interno');
    expect(readOutput('blocks/user__bloco-interno.md')).toContain('conteúdo interno');
  });

  it('sobrescreve incondicionalmente um arquivo de saída já existente', async () => {
    writeDomainFile('regra.mdx', '<Rule>versão nova</Rule>');
    const existingPath = join(workspaceDir, '.claude/rules/user__regra.md');
    mkdirSync(join(existingPath, '..'), { recursive: true });
    writeFileSync(existingPath, 'versão antiga gerada anteriormente', 'utf-8');

    await buildDomain(workspaceDir);

    expect(readOutput('rules/user__regra.md')).toContain('versão nova');
  });

  it('descarta um .mdx que não usa Skill, Rule nem Block', async () => {
    writeDomainFile('solto/rascunho.mdx', 'só texto solto, sem nenhum wrapper');

    await buildDomain(workspaceDir);

    expect(existsSync(outputPath('blocks/user__rascunho.md'))).toBe(false);
  });

  it('descarta um .mdx embrulhado só em outro componente nativo, sem Skill/Rule/Block por fora', async () => {
    writeDomainFile('solto/so-loop.mdx', '<Loop>até terminar</Loop>');

    await buildDomain(workspaceDir);

    expect(existsSync(outputPath('blocks/user__so-loop.md'))).toBe(false);
  });

  it('lança erro quando dois arquivos-fonte geram o mesmo destino', async () => {
    writeDomainFile('time-a/regra.mdx', '<Rule>versão do time A</Rule>');
    writeDomainFile('time-b/regra.mdx', '<Rule>versão do time B</Rule>');

    await expect(buildDomain(workspaceDir)).rejects.toThrow(/mesmo arquivo de destino/);
  });

  it('carrega um .tsx em qualquer profundidade via jiti e disponibiliza para os .mdx', async () => {
    writeDomainFile(
      'componentes/extra/saudacao.tsx',
      [
        "import type { ReactNode } from 'react';",
        '',
        'export function Saudacao({ children }: { children?: ReactNode }) {',
        '  return <>olá, {children}</>;',
        '}',
        '',
      ].join('\n'),
    );
    writeDomainFile('usa-custom.mdx', '<Rule><Saudacao>mundo</Saudacao></Rule>');

    await buildDomain(workspaceDir);

    expect(readOutput('rules/user__usa-custom.md')).toContain('olá, mundo');
  });

  it('disponibiliza os componentes nativos via pochete-cli/components para o custom do usuário', async () => {
    writeDomainFile(
      'componentes/destaque.tsx',
      [
        "import type { ReactNode } from 'react';",
        "import { Loop } from 'pochete-cli/components';",
        '',
        'export function Destaque({ children }: { children?: ReactNode }) {',
        '  return <Loop>{children}</Loop>;',
        '}',
        '',
      ].join('\n'),
    );
    writeDomainFile('usa-nativo.mdx', '<Rule><Destaque>até terminar</Destaque></Rule>');

    await buildDomain(workspaceDir);

    expect(readOutput('rules/user__usa-nativo.md')).toContain('**Loop:** até terminar');
  });
});
