const REACT_TEXT_ENTITIES: Record<string, string> = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#x27;': "'",
  '&#39;': "'",
};

const ENTITY_PATTERN = /&amp;|&lt;|&gt;|&quot;|&#x27;|&#39;/g;

export function decodeReactTextEscaping(html: string): string {
  return html.replace(ENTITY_PATTERN, (match) => {
    const decoded = REACT_TEXT_ENTITIES[match];
    if (decoded === undefined) {
      throw new Error(`entidade não mapeada: '${match}'`);
    }
    return decoded;
  });
}
