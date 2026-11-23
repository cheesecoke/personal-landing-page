import { Fragment, type ReactNode } from 'react';

import type { Paragraph, Span } from '@cwc/content/hand';
import { TextLink } from '@cwc/ui';

import { RouterLink } from '../shell/RouterLink';

type Run = Exclude<Span, string>;

// The same as `toSpans` in `@cwc/content/hand`, kept here so pages do not ship the schemas.
const toSpans = (paragraph: Paragraph): Run[] =>
  (typeof paragraph === 'string' ? [paragraph] : paragraph).map((run) =>
    typeof run === 'string' ? { text: run } : run,
  );

/** Runs of a hand-content paragraph as nodes: links and bold where the content marks them. */
export function renderRuns(runs: Run[]): ReactNode {
  // Plain text stays a string, so components that look at the text still can.
  if (runs.every((run) => !run.href && !run.strong)) return runs.map((run) => run.text).join('');
  return runs.map((run, index) => {
    const text = run.strong ? <b>{run.text}</b> : run.text;
    if (!run.href) return <Fragment key={index}>{text}</Fragment>;
    const internal = run.href.startsWith('/');
    return (
      <TextLink key={index} inline as={internal ? RouterLink : 'a'} href={run.href}>
        {text}
      </TextLink>
    );
  });
}

/** A hand-content paragraph as nodes. */
export const renderParagraph = (paragraph: Paragraph): ReactNode => renderRuns(toSpans(paragraph));

/**
 * A paragraph that may open with a bold lead-in, split in two: the lead-in's words, and the rest
 * with the space after the lead-in dropped (the component that sets the lead-in adds it back).
 */
export function splitLead(paragraph: Paragraph): { lead?: string; text: ReactNode } {
  const [first, ...rest] = toSpans(paragraph);
  if (!first?.strong || first.href) return { text: renderParagraph(paragraph) };
  const [next, ...others] = rest;
  const tail = next ? [{ ...next, text: next.text.replace(/^\s+/, '') }, ...others] : [];
  return { lead: first.text, text: renderRuns(tail) };
}
