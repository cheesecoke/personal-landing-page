import type { ReactNode } from 'react';

import { Button, HandoffLink } from '../../primitives';
import { cx } from '../internal/cx';
import type { LinkComponent } from '../internal/link';
import { Section } from '../Section/Section';
import { ThreadSection } from '../Thread/Thread';

/**
 * `page`: the foot of a main page ("Next" and the next page, in the H1 style).
 * `project`: the foot of a project page ("Next project", a smaller link, and the way back).
 */
export type HandoffFooterVariant = 'page' | 'project';

/** `page` only: the space around the hand-off. Projects 128/96, About 120/96, Beyond 40/80. */
export type HandoffFooterSpace = 'projects' | 'about' | 'beyond';

export interface HandoffFooterProps {
  variant?: HandoffFooterVariant;
  /** The small label above the link ("Next", "Next project"). */
  label: ReactNode;
  /** The name of the next page: the link text. */
  title: ReactNode;
  /** Where it goes. */
  href: string;
  /** The landmark's accessible name ("Next page", "Next"). */
  'aria-label': string;
  /** `project` only: the quiet button on the right ("Back to the map"). */
  back?: { label: ReactNode; href: string };
  /** `project` only: put a node on the thread beside it. Default `true`. */
  node?: boolean;
  /** `page` only. Default `projects`. */
  space?: HandoffFooterSpace;
  /** The element or component for the links. Default `a`. It receives `href`. */
  linkAs?: LinkComponent;
  className?: string;
}

const spaceClass: Record<HandoffFooterSpace, string> = {
  projects: 'pt-32 pb-24',
  about: 'pt-30 pb-24',
  beyond: 'pt-10 pb-20',
};

/** The hand-off at the foot of a page: where to go next. */
export function HandoffFooter({
  variant = 'page',
  label,
  title,
  href,
  'aria-label': ariaLabel,
  back,
  node = true,
  space = 'projects',
  linkAs,
  className,
}: HandoffFooterProps) {
  if (variant === 'page') {
    return (
      <nav aria-label={ariaLabel} className={cx(spaceClass[space], className)}>
        <HandoffLink as={linkAs} href={href} label={label} variant="page">
          {title}
        </HandoffLink>
      </nav>
    );
  }

  const Wrapper = node ? ThreadSection : Section;
  return (
    <Wrapper
      aria-label={ariaLabel}
      space="handoff"
      className={cx(
        'flex flex-wrap items-end justify-between gap-x-12 gap-y-7 pb-[clamp(64px,6vw,88px)]',
        className,
      )}
    >
      <HandoffLink as={linkAs} href={href} label={label} variant="project">
        {title}
      </HandoffLink>
      {back ? (
        <Button as={linkAs} href={back.href} variant="quiet">
          {back.label}
        </Button>
      ) : null}
    </Wrapper>
  );
}
