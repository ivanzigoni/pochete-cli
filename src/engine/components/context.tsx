import type { ReactNode } from 'react';
import { Blockquote, Li, Ul } from './markdown.js';

interface ChildrenProps {
  children?: ReactNode;
}

export function Context({ children }: ChildrenProps) {
  return <Blockquote>{children}</Blockquote>;
}

export interface ConstraintsProps extends ChildrenProps {
  constraints?: string[];
}

export function Constraints({ constraints = [], children }: ConstraintsProps) {
  return (
    <Ul>
      {constraints.map((text) => (
        <Li key={text}>{text}</Li>
      ))}
      {children}
    </Ul>
  );
}

export function Constraint({ children }: ChildrenProps) {
  return <Li>{children}</Li>;
}
