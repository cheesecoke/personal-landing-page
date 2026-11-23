import type { ComponentPropsWithoutRef, ReactNode } from 'react';

import { cx, LitEdge } from '../../../primitives';

export interface BrainZonesProps extends Omit<ComponentPropsWithoutRef<'div'>, 'children'> {
  /** What the drawing shows, for screen readers. */
  label: string;
  /** Who writes in ("Writes": Atti, Skills, Pipelines). */
  writes: { title: string; items: readonly string[] };
  /** The open zone, its note and its strata. The last stratum is the one being written now. */
  open: { title: string; note: string; items: readonly string[] };
  /** The sealed zone beside it. */
  sealed: { title: string; note: string };
  /** The gate out ("Publish gate"). */
  gate: string;
  /** Where the gate leads ("Public folder"). */
  destination: string;
  /** Draw the open zone's lit edge with its glow. One glow per view: default `true`, as drawn. */
  glow?: boolean;
}

const node = 'font-sans text-[13px] leading-[1.3] font-medium';
const small = 'type-label';

function Arrow({ tone }: { tone: 'warm' | 'quiet' }) {
  return (
    <svg
      aria-hidden="true"
      width={40}
      height={12}
      viewBox="0 0 40 12"
      fill="none"
      className={cx(
        'block rotate-90 justify-self-center @[560px]:rotate-0',
        tone === 'warm' ? 'stroke-cedar' : 'stroke-line-outline',
      )}
    >
      <path d="M2 6h34" />
      <path d="M31 2l5 4-5 4" />
    </svg>
  );
}

function Row({ ring, children }: { ring: string; children: ReactNode }) {
  return (
    <div className="flex min-h-8 items-center gap-3">
      <span aria-hidden="true" className={cx('box-border flex-none rounded-full border', ring)} />
      {children}
    </div>
  );
}

/**
 * The Personal brain's drawn hero: who writes into the open zone, the sealed vault beside it, and
 * the one gate out. It is a single labelled image. The three parts run across in a wide slot and
 * down, with the arrows turned, in a narrow one.
 */
export function BrainZones({
  label,
  writes,
  open,
  sealed,
  gate,
  destination,
  glow = true,
  className,
  ...rest
}: BrainZonesProps) {
  return (
    <div role="img" aria-label={label} className={cx('@container', className)} {...rest}>
      <div className="grid grid-cols-[minmax(0,1fr)] items-center gap-2.5 @[560px]:grid-cols-[minmax(0,150px)_40px_minmax(0,1fr)_40px_minmax(0,130px)] @[560px]:gap-0">
        <div className="flex flex-col gap-2.5">
          <span className={cx(small, 'mb-1')}>{writes.title}</span>
          {writes.items.map((item) => (
            <Row key={item} ring="size-[11px] border-hinoki">
              <span className={cx(node, 'text-diagram')}>{item}</span>
            </Row>
          ))}
        </div>
        <Arrow tone="warm" />
        <div className="flex flex-col gap-3.5">
          <div className="relative rounded-panel border border-tick">
            <LitEdge glow={glow} className="left-3.5" />
            <div className="flex flex-col gap-1 px-3.5 py-3">
              <span className="font-sans text-[15px] font-semibold text-primary [font-stretch:112.5%]">
                {open.title}
              </span>
              <span className={small}>{open.note}</span>
            </div>
            {open.items.map((item, index) => (
              <div
                key={item}
                className="flex items-center gap-3 border-t border-hairline px-3.5 py-2.5"
              >
                <span
                  aria-hidden="true"
                  className={cx(
                    'h-px w-4.5 flex-none',
                    index === open.items.length - 1 ? 'bg-signal' : 'bg-line-outline',
                  )}
                />
                <span className={cx(node, 'text-diagram')}>{item}</span>
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-1 rounded-panel border border-dashed border-line-outline px-3.5 py-3">
            <span className="font-sans text-[15px] font-semibold text-secondary [font-stretch:112.5%]">
              {sealed.title}
            </span>
            <span className={small}>{sealed.note}</span>
          </div>
        </div>
        <Arrow tone="quiet" />
        <div className="flex flex-col gap-2.5">
          <Row ring="size-[13px] border-ash">
            <span className={cx(node, 'text-diagram')}>{gate}</span>
          </Row>
          <Row ring="size-[11px] border-line-outline">
            <span className={cx(node, 'text-secondary')}>{destination}</span>
          </Row>
        </div>
      </div>
    </div>
  );
}
