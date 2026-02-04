/**
 * Enhanced Markdown Component
 * Uses native HTML elements for better rendering performance
 */

import React from 'react';
import Markdown from 'react-native-markdown-display';
import {
  H1 as ExpoH1,
  H2 as ExpoH2,
  H3 as ExpoH3,
  H4 as ExpoH4,
  H5 as ExpoH5,
  H6 as ExpoH6,
  Code as ExpoCode,
  Pre as ExpoPre,
  UL as ExpoUl,
  LI as ExpoLI,
  Strong as ExpoStrong,
  A as ExpoA,
  P as ExpoP,
  Div as ExpoDiv,
} from '@expo/html-elements';
import { cssInterop } from 'nativewind';

// Enable NativeWind support for Expo HTML elements
const H1 = cssInterop(ExpoH1, { className: 'style' });
const H2 = cssInterop(ExpoH2, { className: 'style' });
const H3 = cssInterop(ExpoH3, { className: 'style' });
const H4 = cssInterop(ExpoH4, { className: 'style' });
const H5 = cssInterop(ExpoH5, { className: 'style' });
const H6 = cssInterop(ExpoH6, { className: 'style' });
const Code = cssInterop(ExpoCode, { className: 'style' });
const Pre = cssInterop(ExpoPre, { className: 'style' });
const Ol = cssInterop(ExpoUl, { className: 'style' });
const Ul = cssInterop(ExpoUl, { className: 'style' });
const Li = cssInterop(ExpoLI, { className: 'style' });
const Strong = cssInterop(ExpoStrong, { className: 'style' });
const A = cssInterop(ExpoA, { className: 'style' });
const P = cssInterop(ExpoP, { className: 'style' });
const Div = cssInterop(ExpoDiv, { className: 'style' });

// Custom rendering rules for markdown elements
const rules = {
  heading1: (node: any, children: any) => (
    <H4 className="mb-4 mt-4 font-outfit-bold text-primary">{children}</H4>
  ),
  heading2: (node: any, children: any) => (
    <H4 className="mb-4 mt-4 font-outfit-bold text-primary">{children}</H4>
  ),
  heading3: (node: any, children: any) => (
    <P className="mb-2 mt-2 font-outfit-bold text-primary">{children}</P>
  ),
  heading4: (node: any, children: any) => (
    <P className="mb-2 mt-2 font-outfit-bold text-primary">{children}</P>
  ),
  heading5: (node: any, children: any) => (
    <P className="mb-2 mt-2 font-outfit-bold text-primary">{children}</P>
  ),
  heading6: (node: any, children: any) => (
    <P className="mb-2 mt-2 font-outfit-bold text-primary">{children}</P>
  ),
  code: (node: any, children: any, parent: any) => {
    return parent.length > 1 ? (
      <Pre className="mt-2 w-[80vw] overflow-x-scroll rounded-lg bg-zinc-800 dark:bg-zinc-900 p-3 text-sm">
        <Code className="text-zinc-100">{children}</Code>
      </Pre>
    ) : (
      <Code className="rounded-md bg-zinc-800 dark:bg-zinc-900 px-1.5 py-0.5 text-sm text-zinc-100">
        {children}
      </Code>
    );
  },
  list_item: (node: any, children: any) => (
    <Li className="py-1 text-primary">{children}</Li>
  ),
  ordered_list: (node: any, children: any) => (
    <Ol className="ml-4 list-outside list-decimal">{children}</Ol>
  ),
  unordered_list: (node: any, children: any) => (
    <Ul className="ml-4 list-outside list-disc">{children}</Ul>
  ),
  strong: (node: any, children: any) => (
    <Strong className="font-outfit-bold">{children}</Strong>
  ),
  link: (node: any, children: any) => (
    <A
      className="text-blue-500 hover:underline"
      // @ts-ignore
      target="_blank"
      rel="noreferrer"
      href={node.attributes.href}
    >
      {children}
    </A>
  ),
  text: (node: any) => {
    return <P className="text-primary">{node.content}</P>;
  },
  body: (node: any, children: any) => {
    return <Div className="">{children}</Div>;
  },
};

interface CustomMarkdownProps {
  content: string;
  isVoiceMessage?: boolean;
}

export function CustomMarkdown({ content, isVoiceMessage = false }: CustomMarkdownProps) {
  // Safety check: ensure content is a valid string
  if (!content || typeof content !== 'string') {
    console.warn('CustomMarkdown received invalid content:', content);
    return null;
  }

  const customRules = {
    ...rules,
    text: (node: any) => {
      return (
        <P className={`text-primary ${isVoiceMessage ? 'italic' : ''}`}>
          {node.content}
        </P>
      );
    },
  };

  return <Markdown rules={customRules}>{content}</Markdown>;
}

export default CustomMarkdown;
