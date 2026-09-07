import { describe, expect, it } from 'vitest';
import { decodeReactTextEscaping } from './entities.js';

describe('decodeReactTextEscaping', () => {
  it('decodifica cada uma das 5 entidades que o React escapa em texto', () => {
    expect(decodeReactTextEscaping('&amp;')).toBe('&');
    expect(decodeReactTextEscaping('&lt;')).toBe('<');
    expect(decodeReactTextEscaping('&gt;')).toBe('>');
    expect(decodeReactTextEscaping('&quot;')).toBe('"');
    expect(decodeReactTextEscaping('&#x27;')).toBe("'");
    expect(decodeReactTextEscaping('&#39;')).toBe("'");
  });

  it('decodifica múltiplas entidades na mesma string em uma única passada', () => {
    expect(decodeReactTextEscaping('x &lt; 2 &amp;&amp; x &gt; 0')).toBe('x < 2 && x > 0');
  });

  it('não decodifica em cascata: &amp;lt; volta a ser o literal &lt;, não <', () => {
    expect(decodeReactTextEscaping('&amp;lt;')).toBe('&lt;');
  });

  it('deixa texto sem entidades intacto', () => {
    expect(decodeReactTextEscaping('sem entidades aqui')).toBe('sem entidades aqui');
  });
});
