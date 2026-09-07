import type { ReactNode } from 'react';

interface ChildrenProps {
  children?: ReactNode;
}

function makePseudocodeLine(label: string) {
  return function PseudocodeLine({ children }: ChildrenProps) {
    return (
      <>
        **{label}:** {children}
        {'\n\n'}
      </>
    );
  };
}

export const Loop = makePseudocodeLine('Loop');
export const Condition = makePseudocodeLine('Condition');
export const Action = makePseudocodeLine('Action');
export const Fallback = makePseudocodeLine('Fallback');
export const OnError = makePseudocodeLine('On Error');

export const CallTool = makePseudocodeLine('Call Tool');
