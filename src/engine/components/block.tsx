import type { ReactNode } from 'react';
import { buildFrontmatter } from './frontmatter.js';

export interface BlockProps {
  children?: ReactNode;
}

export function Block({ children }: BlockProps) {
  const frontmatter = buildFrontmatter({});
  return (
    <>
      {frontmatter}
      {children}
    </>
  );
}
