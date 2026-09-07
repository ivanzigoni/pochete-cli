import type { ReactNode } from 'react';
import { Code, Pre } from './markdown.js';

export interface OutputFormatProps {
  schema?: unknown;
  title?: string;
  children?: ReactNode;
}

function serializeSchema(schema: unknown): string | undefined {
  if (schema === undefined) return undefined;
  if (typeof schema === 'object' && schema !== null) {
    return JSON.stringify(schema, null, 2);
  }
  return String(schema);
}

export function OutputFormat({ schema, title, children }: OutputFormatProps) {
  const serializedSchema = serializeSchema(schema);

  return (
    <>
      {title ? (
        <>
          **{title}**{'\n\n'}
        </>
      ) : null}
      {children}
      {serializedSchema !== undefined ? (
        <Pre>
          <Code className="language-json">{serializedSchema}</Code>
        </Pre>
      ) : null}
    </>
  );
}
