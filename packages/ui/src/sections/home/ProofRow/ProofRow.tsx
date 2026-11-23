import type { ElementType } from 'react';

import { ThreadSection, type LinkComponent } from '../../../layout';
import { cx, TickScale, VisuallyHidden } from '../../../primitives';

/** One proof: a counted fact, or a short phrase, over a tick scale and a one-line caption. */
export interface ProofFact {
  key: string;
  /** The number as it reads ("177", "1,167"), or the whole phrase for `kind: 'phrase'`. */
  value: string;
  /** What is counted, set small after the number ("commits by Atti"). */
  unit?: string;
  /** `count`: a large numeral. `phrase`: a short line in the readout face, no numeral. */
  kind?: 'count' | 'phrase';
  /** The line under the tick scale. */
  caption: string;
  /** Where the proof goes. Without it the proof is plain text. */
  href?: string;
  /**
   * When the number was counted. `label` is the readable text ("As of 22 November 2026"); it is
   * read out after the fact and shown as the value's tooltip.
   */
  asOf?: { dateTime: string; label: string };
}

export interface ProofRowProps {
  /** Accessible name of the section ("Proof"). */
  'aria-label': string;
  facts: readonly ProofFact[];
  /** The element or component for the links. Default `a`. It receives `href`. */
  linkAs?: LinkComponent;
  className?: string;
}

const readout = 'font-readout text-accent-warm';

/**
 * The proof row under the Home hero: three facts side by side, one column on a phone. Each is a
 * numeral (or a short phrase) over a tick scale and a caption, and links to the work behind it.
 * It is a section on the Home thread.
 */
export function ProofRow({ 'aria-label': ariaLabel, facts, linkAs, className }: ProofRowProps) {
  if (facts.length === 0) return null;
  return (
    <ThreadSection
      placement="edge"
      nodeTop={36}
      aria-label={ariaLabel}
      className={cx('py-10', className)}
    >
      <div className="@container">
        <ul className="m-0 grid list-none grid-cols-1 gap-x-12 gap-y-10 border-t border-hairline p-0 pt-10 @md:grid-cols-3">
          {facts.map((fact) => {
            const Item: ElementType = fact.href === undefined ? 'div' : (linkAs ?? 'a');
            return (
              <li key={fact.key} className="min-w-0">
                <Item
                  href={fact.href}
                  className="group/proof flex flex-col text-primary no-underline"
                >
                  <span
                    title={fact.asOf?.label}
                    className={cx(
                      'flex min-h-[clamp(40px,4vw,56px)] items-end',
                      readout,
                      fact.kind === 'phrase'
                        ? 'text-[clamp(22px,2vw,26px)] leading-[1.1] font-normal'
                        : 'flex-wrap gap-x-[0.3em] text-[clamp(36px,3.6vw,54px)] leading-[0.95] font-light tracking-[-0.01em] lining-nums',
                    )}
                  >
                    {fact.value}
                    {fact.unit ? (
                      <span className="text-[0.42em] leading-[1.3] tracking-[0.02em] whitespace-nowrap">
                        {fact.unit}
                      </span>
                    ) : null}
                  </span>
                  <TickScale className="mt-4.5" />
                  <span
                    className={cx(
                      'mt-4 max-w-[34ch] type-body',
                      fact.href !== undefined &&
                        'group-hover/proof:text-signal motion-ok:transition-colors motion-ok:duration-hover',
                    )}
                  >
                    {fact.caption}
                  </span>
                  {fact.asOf ? (
                    <VisuallyHidden>
                      <time dateTime={fact.asOf.dateTime}>{fact.asOf.label}</time>
                    </VisuallyHidden>
                  ) : null}
                </Item>
              </li>
            );
          })}
        </ul>
      </div>
    </ThreadSection>
  );
}
