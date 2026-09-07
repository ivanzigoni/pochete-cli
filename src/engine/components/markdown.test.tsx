import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { decodeReactTextEscaping } from '../entities.js';
import { A, Blockquote, Code, H1, H3, Hr, Li, Ol, P, Pre, Strong, Ul } from './markdown.js';

function render(node: React.ReactElement): string {
  return decodeReactTextEscaping(renderToStaticMarkup(node));
}

describe('overrides de heading e inline', () => {
  it('h1 gera "# " e h3 gera "### "', () => {
    expect(render(<H1>Título</H1>)).toBe('# Título\n\n');
    expect(render(<H3>Subtítulo</H3>)).toBe('### Subtítulo\n\n');
  });

  it('strong gera **texto**', () => {
    expect(render(<Strong>negrito</Strong>)).toBe('**negrito**');
  });

  it('a gera [texto](href)', () => {
    expect(render(<A href="https://example.com">link</A>)).toBe('[link](https://example.com)');
  });

  it('hr gera um separador de linha', () => {
    expect(render(<Hr />)).toBe('\n---\n\n');
  });

  it('p termina o parágrafo com linha em branco', () => {
    expect(render(<P>texto</P>)).toBe('texto\n\n');
  });
});

describe('Blockquote', () => {
  it('prefixa cada linha do conteúdo com "> "', () => {
    expect(render(<Blockquote>{'linha um\nlinha dois'}</Blockquote>)).toBe(
      '> linha um\n> linha dois\n\n',
    );
  });

  it('preserva caracteres especiais sem escapar duas vezes', () => {
    expect(render(<Blockquote>{'x < 2 && y > 0'}</Blockquote>)).toBe('> x < 2 && y > 0\n\n');
  });
});

describe('Pre/Code', () => {
  it('code sem className (inline) gera crases simples', () => {
    expect(render(<Code>inline</Code>)).toBe('`inline`');
  });

  it('pre envolvendo code com className gera bloco cercado com a linguagem extraída', () => {
    const tree = (
      <Pre>
        <Code className="language-ts">const x = 1;</Code>
      </Pre>
    );
    expect(render(tree)).toBe('```ts\nconst x = 1;\n```\n\n');
  });

  it('preserva < e > literais dentro do bloco cercado, sem escapar duas vezes', () => {
    const tree = (
      <Pre>
        <Code className="language-ts">{'const y = x < 2 && x > 0;'}</Code>
      </Pre>
    );
    expect(render(tree)).toBe('```ts\nconst y = x < 2 && x > 0;\n```\n\n');
  });

  it('bloco cercado sem linguagem informada gera fence vazio', () => {
    const tree = (
      <Pre>
        <Code>texto pré-formatado</Code>
      </Pre>
    );
    expect(render(tree)).toBe('```\ntexto pré-formatado\n```\n\n');
  });
});

describe('listas', () => {
  it('ul gera itens com marcador "- "', () => {
    const tree = (
      <Ul>
        <Li>um</Li>
        <Li>dois</Li>
      </Ul>
    );
    expect(render(tree)).toBe('- um\n- dois\n\n');
  });

  it('ol numera os itens sequencialmente a partir de 1', () => {
    const tree = (
      <Ol>
        <Li>primeiro</Li>
        <Li>segundo</Li>
        <Li>terceiro</Li>
      </Ol>
    );
    expect(render(tree)).toBe('1. primeiro\n2. segundo\n3. terceiro\n\n');
  });

  it('lista aninhada é indentada em 2 espaços por nível', () => {
    const tree = (
      <Ul>
        <Li>
          item
          <Ul>
            <Li>sub item</Li>
          </Ul>
        </Li>
      </Ul>
    );
    expect(render(tree)).toBe('- item\n  - sub item\n\n\n');
  });
});
