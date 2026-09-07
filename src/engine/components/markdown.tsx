import { Children, cloneElement, isValidElement, type ReactElement, type ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { decodeReactTextEscaping } from '../entities.js';

interface ChildrenProps {
  children?: ReactNode;
}

function makeHeading(level: number) {
  return function Heading({ children }: ChildrenProps) {
    return (
      <>
        {'#'.repeat(level)} {children}
        {'\n\n'}
      </>
    );
  };
}

export const H1 = makeHeading(1);
export const H2 = makeHeading(2);
export const H3 = makeHeading(3);
export const H4 = makeHeading(4);
export const H5 = makeHeading(5);
export const H6 = makeHeading(6);

export function Strong({ children }: ChildrenProps) {
  return <>**{children}**</>;
}

export function Em({ children }: ChildrenProps) {
  return <>*{children}*</>;
}

export function Del({ children }: ChildrenProps) {
  return <>~~{children}~~</>;
}

interface AProps extends ChildrenProps {
  href?: string;
}

export function A({ children, href = '' }: AProps) {
  return (
    <>
      [{children}]({href})
    </>
  );
}

export function Hr() {
  return <>{'\n---\n\n'}</>;
}

export function Blockquote({ children }: ChildrenProps) {
  const rendered = decodeReactTextEscaping(renderToStaticMarkup(<>{children}</>)).trim();
  const quoted = rendered
    .split('\n')
    .map((line) => (line.length === 0 ? '>' : `> ${line}`))
    .join('\n');
  return `${quoted}\n\n`;
}

function extractLanguage(className?: string): string {
  if (!className) return '';
  const match = /language-(\S+)/.exec(className);
  return match?.[1] ?? '';
}

interface CodeProps extends ChildrenProps {
  className?: string;
}

export function Code({ children, className }: CodeProps) {
  if (className) {
    return <>{children}</>;
  }
  return <>`{children}`</>;
}

export function Pre({ children }: ChildrenProps) {
  const codeElement = children as ReactElement<CodeProps> | undefined;
  const isCodeElement = isValidElement(codeElement);
  const language = extractLanguage(isCodeElement ? codeElement.props.className : undefined);
  const innerChildren = isCodeElement ? codeElement.props.children : children;
  const innerText = decodeReactTextEscaping(renderToStaticMarkup(<>{innerChildren}</>)).replace(
    /\n$/,
    '',
  );
  return `\`\`\`${language}\n${innerText}\n\`\`\`\n\n`;
}

export function P({ children }: ChildrenProps) {
  return (
    <>
      {children}
      {'\n\n'}
    </>
  );
}

interface ListProps extends ChildrenProps {
  depth?: number;
}

interface ListItemProps extends ChildrenProps {
  marker?: string;
  depth?: number;
}

function isListElement(
  node: ReactNode,
  type: (props: ListProps) => ReactNode,
): node is ReactElement<ListProps> {
  return isValidElement(node) && node.type === type;
}

export function Li({ children, marker = '- ', depth = 0 }: ListItemProps) {
  const indent = '  '.repeat(depth);
  const propagatedChildren = Children.toArray(children).flatMap((child) => {
    if (isListElement(child, Ul) || isListElement(child, Ol)) {
      return ['\n', cloneElement(child, { depth: depth + 1 })];
    }
    return [child];
  });

  return (
    <>
      {indent}
      {marker}
      {propagatedChildren}
      {'\n'}
    </>
  );
}

function renderList({ children, depth = 0 }: ListProps, ordered: boolean): ReactNode {
  const items = Children.toArray(children).filter(isValidElement);
  const rendered = items.map((item, index) => {
    const marker = ordered ? `${index + 1}. ` : '- ';
    return cloneElement(item as ReactElement<ListItemProps>, {
      marker,
      depth,
      key: (item.key ?? index).toString(),
    });
  });

  return (
    <>
      {rendered}
      {depth === 0 ? '\n' : null}
    </>
  );
}

export function Ul(props: ListProps) {
  return renderList(props, false);
}

export function Ol(props: ListProps) {
  return renderList(props, true);
}

export const markdownComponents = {
  h1: H1,
  h2: H2,
  h3: H3,
  h4: H4,
  h5: H5,
  h6: H6,
  strong: Strong,
  em: Em,
  del: Del,
  a: A,
  hr: Hr,
  blockquote: Blockquote,
  pre: Pre,
  code: Code,
  p: P,
  ul: Ul,
  ol: Ol,
  li: Li,
};
