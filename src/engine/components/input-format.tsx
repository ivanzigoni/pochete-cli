import type { ReactNode } from 'react';
import { Code, Pre } from './markdown.js';

export interface InputFormatProps {
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

export function InputFormat({ schema, title, children }: InputFormatProps) {
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
