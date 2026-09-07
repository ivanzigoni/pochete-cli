import type { ReactNode } from 'react';

interface ChildrenProps {
  children?: ReactNode;
}

export function Procedure({ children }: ChildrenProps) {
  return <>{children}</>;
}

export interface StepProps extends ChildrenProps {
  id?: string;
  title?: string;
}

export function Step({ id, title, children }: StepProps) {
  const label = [id, title].filter((part) => part !== undefined).join('. ');
  return (
    <>
      {label ? (
        <>
          **{label}**{'\n\n'}
        </>
      ) : null}
      {children}
    </>
  );
}
