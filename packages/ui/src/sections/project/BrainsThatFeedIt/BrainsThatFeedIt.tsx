import { useId, type ReactNode } from 'react';

import { Section, ThreadSection } from '../../../layout';
import { cx, Heading } from '../../../primitives';

/** A smaller brain that feeds this one. Its `id` is an anchor other pages link to. */
export interface FeedItem {
  id: string;
  name: string;
  line: ReactNode;
}

export interface BrainsThatFeedItProps {
  /** The section label ("Brains that feed it"). */
  title: ReactNode;
  items: readonly FeedItem[];
  /** The drawing: what it shows, for screen readers, and the words in the large ring. */
  diagram: { label: string; center: string };
  id?: string;
  /** Put a node on the thread beside the section. Default `true`. */
  node?: boolean;
  className?: string;
}

// The drawing's box is 120 by 100 (6:5), as on the board: small rings on the left, each joined to
// the large ring on the right by a line that runs from edge to edge.
const SMALL = { x: 20, r: 9 };
const LARGE = { x: 90, y: 50, r: 26 };

const feederY = (index: number, count: number) =>
  count === 1 ? 50 : 24 + (index * 52) / (count - 1);

/**
 * The brains that feed this one: a short list beside a drawing of small rings joined to a large
 * one. Each item has its own anchor. The drawing is one labelled image; nothing in it is
 * interactive and nothing moves.
 */
export function BrainsThatFeedIt({
  title,
  items,
  diagram,
  id,
  node = true,
  className,
}: BrainsThatFeedItProps) {
  const headingId = useId();
  const gradientId = useId();
  const Wrapper = node ? ThreadSection : Section;
  if (items.length === 0) return null;
  return (
    <Wrapper id={id} aria-labelledby={headingId} className={cx('z-1 scroll-mt-6', className)}>
      <Heading level={2} role="label" id={headingId} className="mb-5">
        {title}
      </Heading>
      <div className="grid max-w-[820px] grid-cols-[minmax(0,1fr)_clamp(170px,22vw,240px)] items-center gap-x-8 gap-y-4 max-[380px]:gap-x-4">
        <ul className="m-0 grid min-h-[clamp(116px,18vw,200px)] list-none auto-rows-fr p-0">
          {items.map((item, index) => (
            <li
              key={item.id}
              id={item.id}
              className={cx(
                'flex scroll-mt-6 flex-col justify-center gap-1.5 py-3',
                index < items.length - 1 &&
                  'border-b border-[color-mix(in_srgb,var(--line-hairline)_70%,var(--bg-ground))]',
              )}
            >
              <span className="text-[17px] font-semibold tracking-[-0.01em] text-primary">
                {item.name}
              </span>
              <span className="text-[15px] leading-normal text-secondary">{item.line}</span>
            </li>
          ))}
        </ul>
        <div role="img" aria-label={diagram.label} className="relative aspect-[6/5] w-full">
          <svg
            aria-hidden="true"
            viewBox="0 0 120 100"
            preserveAspectRatio="none"
            fill="none"
            className="absolute inset-0 size-full overflow-visible"
          >
            {items.map((item, index) => {
              const y = feederY(index, items.length);
              const dx = LARGE.x - SMALL.x;
              const dy = LARGE.y - y;
              const length = Math.hypot(dx, dy);
              const [ux, uy] = [dx / length, dy / length];
              const start = { x: SMALL.x + ux * SMALL.r, y: y + uy * SMALL.r };
              const end = { x: LARGE.x - ux * LARGE.r, y: LARGE.y - uy * LARGE.r };
              const gradient = `${gradientId}-${index}`;
              return (
                <g key={item.id}>
                  <linearGradient
                    id={gradient}
                    gradientUnits="userSpaceOnUse"
                    x1={start.x}
                    y1={start.y}
                    x2={end.x}
                    y2={end.y}
                  >
                    <stop offset="0" style={{ stopColor: 'var(--line-outline)' }} />
                    <stop offset="1" style={{ stopColor: 'var(--palette-signal-dim)' }} />
                  </linearGradient>
                  <line
                    x1={start.x}
                    y1={start.y}
                    x2={end.x}
                    y2={end.y}
                    stroke={`url(#${gradient})`}
                    strokeWidth={1}
                    vectorEffect="non-scaling-stroke"
                  />
                  <circle
                    cx={SMALL.x}
                    cy={y}
                    r={SMALL.r}
                    strokeWidth={1}
                    vectorEffect="non-scaling-stroke"
                    className="stroke-ash"
                  />
                </g>
              );
            })}
          </svg>
          <span
            aria-hidden="true"
            className="absolute top-1/2 left-3/4 box-border aspect-square w-[43.3%] -translate-1/2 rounded-full border border-signal-dim shadow-[0_0_18px_color-mix(in_srgb,var(--accent-signal)_18%,transparent)]"
          />
          <span
            aria-hidden="true"
            className="absolute top-1/2 left-3/4 w-2/5 -translate-1/2 text-center font-sans text-[clamp(9px,0.8vw,11px)] leading-[1.3] font-semibold tracking-[0.1em] text-primary uppercase"
          >
            {diagram.center}
          </span>
        </div>
      </div>
    </Wrapper>
  );
}
