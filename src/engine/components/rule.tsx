import type { ReactNode } from 'react';
import { buildFrontmatter } from './frontmatter.js';

export interface RuleProps {
  paths?: string[];
  children?: ReactNode;
}

export function Rule({ paths, children }: RuleProps) {
  const frontmatter = buildFrontmatter({ paths });
  return (
    <>
      {frontmatter}
      {frontmatter ? '\n' : ''}
      {children}
    </>
  );
}
