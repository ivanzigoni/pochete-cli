import type { ReactNode } from 'react';
import { buildFrontmatter } from './frontmatter.js';

export interface SkillProps {
  name: string;
  description: string;
  children?: ReactNode;
}

export function Skill({ name, description, children }: SkillProps) {
  const frontmatter = buildFrontmatter({ name, description });
  return (
    <>
      {frontmatter}
      {'\n'}
      {children}
    </>
  );
}
