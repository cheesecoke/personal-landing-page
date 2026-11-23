import type { ComponentPropsWithoutRef } from 'react';

import type { LinkComponent } from '../../../layout';
import { cx, Panel, Readout, StatusDot, type Status } from '../../../primitives';

/** A page inside this one: its name, status and one line. */
export interface LinkCardData {
  name: string;
  /** The status word ("Daily use", "Experiment"). */
  status: string;
  /** Which dot: `live` (Signal), `build` (Ember), `private` (hollow). Default `live`. */
  tone?: Status;
  line: string;
  href: string;
}

export interface LinkCardsProps extends Omit<ComponentPropsWithoutRef<'ul'>, 'children'> {
  /** Accessible name of the list ("The projects inside PAS"). */
  label: string;
  cards: readonly LinkCardData[];
  /** The element used for the links. Default `a`. It receives `href`. */
  linkAs?: LinkComponent;
}

/**
 * Cards for the pages inside a project (PAS: Atti and Lifebox), at the top of "Go deeper". The
 * whole card is the link; it lifts on hover. With no cards it renders nothing.
 */
export function LinkCards({ label, cards, linkAs, className, ...rest }: LinkCardsProps) {
  if (cards.length === 0) return null;
  return (
    <ul
      aria-label={label}
      className={cx(
        'm-0 mb-10 grid list-none grid-cols-[repeat(auto-fit,minmax(min(260px,100%),1fr))] gap-4 p-0',
        className,
      )}
      {...rest}
    >
      {cards.map((card) => (
        <li key={card.href} className="flex min-w-0">
          <Panel
            as={linkAs ?? 'a'}
            href={card.href}
            rise
            className="flex min-h-touch flex-1 flex-col gap-2.5 px-6 pt-5.5 pb-6 text-primary no-underline"
          >
            <span className="flex items-center justify-between gap-4">
              <span className="font-sans text-[24px] leading-[1.1] font-medium tracking-[-0.02em] [font-stretch:112.5%]">
                {card.name}
              </span>
              <svg
                aria-hidden="true"
                width={28}
                height={12}
                viewBox="0 0 28 12"
                fill="none"
                stroke="currentColor"
                className="flex-none"
              >
                <path d="M0 6h26M21 1l5 5-5 5" />
              </svg>
            </span>
            <Readout kind="status" tone="secondary" className="flex items-center gap-2.5">
              <StatusDot status={card.tone ?? 'live'} />
              {card.status}
            </Readout>
            <span className="text-[15px] leading-normal text-secondary">{card.line}</span>
          </Panel>
        </li>
      ))}
    </ul>
  );
}
