import { describe, expect, it } from 'vitest';
import { buildFrontmatter } from './frontmatter.js';

describe('buildFrontmatter', () => {
  it('retorna string vazia quando não há campos', () => {
    expect(buildFrontmatter({})).toBe('');
  });

  it('omite campos com valor undefined', () => {
    expect(buildFrontmatter({ a: 'x', b: undefined })).toBe('---\na: x\n---\n');
  });

  it('não quota um valor escalar simples', () => {
    expect(buildFrontmatter({ name: 'exemplo-simples' })).toBe('---\nname: exemplo-simples\n---\n');
  });

  it('quota string vazia', () => {
    expect(buildFrontmatter({ description: '' })).toBe('---\ndescription: ""\n---\n');
  });

  it('quota valor com espaço nas pontas', () => {
    expect(buildFrontmatter({ description: ' com espaço ' })).toBe(
      '---\ndescription: " com espaço "\n---\n',
    );
  });

  it('quota valor começando com caractere reservado', () => {
    for (const char of [
      '-',
      '?',
      ':',
      ',',
      '[',
      ']',
      '{',
      '}',
      '#',
      '&',
      '*',
      '!',
      '|',
      '>',
      "'",
      '%',
      '@',
      '`',
    ]) {
      expect(buildFrontmatter({ x: `${char}resto` })).toBe(`---\nx: "${char}resto"\n---\n`);
    }
  });

  it('quota e escapa valor começando com aspas duplas', () => {
    expect(buildFrontmatter({ x: '"resto' })).toBe('---\nx: "\\"resto"\n---\n');
  });

  it('quota valor contendo ": "', () => {
    expect(buildFrontmatter({ description: 'ex: assim' })).toBe(
      '---\ndescription: "ex: assim"\n---\n',
    );
  });

  it('quota valor contendo quebra de linha, escapando-a', () => {
    expect(buildFrontmatter({ description: 'linha um\nlinha dois' })).toBe(
      '---\ndescription: "linha um\\nlinha dois"\n---\n',
    );
  });

  it('escapa aspas duplas e barra invertida dentro do valor quotado', () => {
    expect(buildFrontmatter({ description: '"citado" e \\barra' })).toBe(
      '---\ndescription: "\\"citado\\" e \\\\barra"\n---\n',
    );
  });

  it('renderiza um array não vazio como sequência YAML, cada item quotado pela mesma regra', () => {
    expect(buildFrontmatter({ paths: ['**/*.ts', 'simples'] })).toBe(
      '---\npaths:\n  - "**/*.ts"\n  - simples\n---\n',
    );
  });

  it('omite o campo quando o array é vazio', () => {
    expect(buildFrontmatter({ paths: [] })).toBe('');
  });

  it('preserva a ordem de inserção das chaves', () => {
    expect(buildFrontmatter({ b: 'segundo-valor', a: 'primeiro-valor' })).toBe(
      '---\nb: segundo-valor\na: primeiro-valor\n---\n',
    );
  });
});
