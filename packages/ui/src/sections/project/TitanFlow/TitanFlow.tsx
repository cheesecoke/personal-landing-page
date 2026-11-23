import type { ComponentPropsWithoutRef, CSSProperties } from 'react';

import { cx } from '../../../primitives';

export interface TitanFlowProps extends Omit<ComponentPropsWithoutRef<'div'>, 'children'> {
  /** What the drawing shows, for screen readers. */
  label: string;
  /** The steps, in order. The last one is where the flow ends, and holds the light. */
  steps: readonly string[];
  /** The line on the return path ("Memory feeds lessons back"). */
  feedbackNote: string;
  /** The line on the measuring rule under the flow ("Harness measures each stage"). */
  measureNote: string;
  /** The step the return path feeds back into, counted from 0. Default: the middle step. */
  feedbackTo?: number;
}

const stepLabel = 'font-readout text-[13px] font-medium tracking-[0.06em] uppercase';
const laneLabel =
  'font-readout text-[11px] font-medium tracking-[0.12em] whitespace-nowrap uppercase';
// Tones between two palette steps, mixed from the tokens there are.
const tones = {
  '--flow-start': 'color-mix(in srgb, var(--palette-cedar) 47%, var(--bg-ground))',
  '--flow-dash': 'color-mix(in srgb, var(--palette-cedar) 73%, var(--bg-ground))',
  '--flow-faint': 'color-mix(in srgb, var(--line-hairline) 70%, var(--bg-ground))',
  '--flow-glow': '0 0 14px color-mix(in srgb, var(--accent-signal) 55%, transparent)',
} as CSSProperties;

const node = 'absolute box-border size-[11px] rounded-full border border-hinoki bg-ground';
const endRing =
  'absolute box-border size-[15px] rounded-full border border-signal bg-ground shadow-(--flow-glow)';
const endDot = 'absolute size-[5px] rounded-full bg-signal';
const dash = 'absolute border-dashed border-(--flow-dash)';

const pct = (value: number) => `${value}%`;

/** The flow across: for a slot at least 600px wide. */
function Across({ steps, feedbackNote, measureNote, back }: Flow) {
  const count = steps.length;
  const x = (index: number) => ((index + 0.5) / count) * 100;
  const first = x(0);
  const last = x(count - 1);
  const edge = 100 - last;
  return (
    <div className="relative px-gutter pt-14 pb-10 [zoom:1.12]">
      <div className="relative">
        <span
          className="absolute -top-[11px] -ml-[100px] size-[200px] rounded-full border border-(--flow-faint)"
          style={{ left: pct(last) }}
        />
        <span
          className="absolute top-[41px] -ml-12 size-24 -rotate-[35deg] rounded-full border border-hairline border-b-signal-dim"
          style={{ left: pct(last) }}
        />
        <div
          className="relative grid items-end"
          style={{ gridTemplateColumns: `repeat(${count}, minmax(0, 1fr))` }}
        >
          {steps.map((step, index) => (
            <span
              key={step}
              className={cx(
                stepLabel,
                // One line where there is room (as drawn); two where the slot is narrower.
                'px-1 pb-1 text-center leading-[1.3] text-balance',
                index === count - 1 ? 'text-primary' : 'text-diagram',
              )}
            >
              {step}
            </span>
          ))}
        </div>
        <div className="relative h-14">
          <span
            className="absolute top-1/2 h-px bg-[linear-gradient(90deg,var(--flow-start),var(--palette-cedar)_70%,var(--palette-signal))]"
            style={{ left: pct(first), right: pct(edge) }}
          />
          {steps.slice(0, -1).map((step, index) => (
            <svg
              key={step}
              width={8}
              height={10}
              viewBox="0 0 8 10"
              fill="none"
              className="absolute top-1/2 -mt-[5px] -ml-1 stroke-cedar"
              style={{ left: pct((x(index) + x(index + 1)) / 2) }}
            >
              <path d="M1 1l5 4-5 4" />
            </svg>
          ))}
          {steps.slice(0, -1).map((step, index) => (
            <span
              key={step}
              className={cx(node, 'top-1/2 -mt-[5.5px] -ml-[5.5px]')}
              style={{ left: pct(x(index)) }}
            />
          ))}
          <span
            className={cx(endRing, 'top-1/2 -mt-[7.5px] -ml-[7.5px]')}
            style={{ left: pct(last) }}
          />
          <span
            className={cx(endDot, 'top-1/2 -mt-[2.5px] -ml-[2.5px]')}
            style={{ left: pct(last) }}
          />
        </div>
        <div className="relative h-19">
          <span className={cx(dash, 'top-0 h-11 border-l')} style={{ left: pct(last) }} />
          <span
            className={cx(dash, 'top-11 border-t')}
            style={{ left: `calc(${x(back)}% + 18px)`, right: pct(edge) }}
          />
          <svg
            width={26}
            height={46}
            viewBox="0 0 26 46"
            fill="none"
            className="absolute top-0 -ml-1.5 overflow-visible stroke-hinoki"
            style={{ left: pct(x(back)) }}
          >
            <path d="M24 44.5 C 12 44.5 6.5 39 6.5 28 L6.5 4" />
            <path d="M2.5 9 L6.5 3 L10.5 9" />
          </svg>
          <span
            className={cx(laneLabel, 'absolute top-14 text-accent-warm')}
            style={{ left: `calc(${x(back)}% + 28px)` }}
          >
            {feedbackNote}
          </span>
        </div>
        <div className="relative mt-2 h-10">
          <span
            className="absolute top-[9px] border-t border-dotted border-line-outline"
            style={{ left: pct(first), right: pct(edge) }}
          />
          {steps.map((step, index) => (
            <span
              key={step}
              className="absolute top-0 h-[9px] w-px bg-line-outline"
              style={{ left: pct(x(index)) }}
            />
          ))}
          <span
            className={cx(laneLabel, 'absolute top-5 text-secondary')}
            style={{ left: pct(first) }}
          >
            {measureNote}
          </span>
        </div>
      </div>
    </div>
  );
}

/** The flow down: for a phone. Rows are 56px; the return path runs up the left. */
function Down({ steps, feedbackNote, measureNote, back }: Flow) {
  const last = steps.length - 1;
  const y = (index: number) => 28 + index * 56;
  return (
    <div className="relative py-2">
      <div className="relative">
        <span
          className="absolute left-14 w-px bg-[linear-gradient(180deg,var(--flow-start),var(--palette-cedar)_70%,var(--palette-signal))]"
          style={{ top: y(0), height: y(last) - y(0) }}
        />
        <span
          className={cx(dash, 'left-5.5 border-l')}
          style={{ top: y(back), height: y(last) - y(back) }}
        />
        <span className={cx(dash, 'left-5.5 w-8.5 border-t')} style={{ top: y(last) }} />
        <svg
          width={34}
          height={20}
          viewBox="0 0 34 20"
          fill="none"
          className="absolute left-5.5 overflow-visible stroke-hinoki"
          style={{ top: y(back) - 18 }}
        >
          <path d="M0.5 18 C 0.5 10 6 6 14 6 L27 6" />
          <path d="M22 2 L28 6 L22 10" />
        </svg>
        {steps.map((step, index) => (
          <div key={step} className="relative h-14">
            {index === last ? (
              <>
                <span className={cx(endRing, 'top-1/2 left-14 -mt-[7.5px] -ml-[7.5px]')} />
                <span className={cx(endDot, 'top-1/2 left-14 -mt-[2.5px] -ml-[2.5px]')} />
              </>
            ) : (
              <span className={cx(node, 'top-1/2 left-14 -mt-[5.5px] -ml-[5.5px]')} />
            )}
            <span
              className={cx(
                stepLabel,
                'absolute top-1/2 left-21 -translate-y-1/2',
                index === last ? 'text-primary' : 'text-diagram',
              )}
            >
              {step}
            </span>
          </div>
        ))}
      </div>
      <p className={cx(laneLabel, 'm-0 mt-5 ml-5.5 flex flex-col gap-2 whitespace-normal')}>
        <span className="text-accent-warm">{feedbackNote}</span>
        <span className="text-secondary">{measureNote}</span>
      </p>
    </div>
  );
}

interface Flow {
  steps: readonly string[];
  feedbackNote: string;
  measureNote: string;
  back: number;
}

/**
 * The job page's drawn hero: what the system does, as a flow. Steps on one warm line that ends in
 * the one lit node, a dashed return path that feeds back into an earlier step, and a dotted rule
 * under it that measures every stage. No work imagery, by design. It is a single labelled image:
 * it runs across in a wide slot and down in a narrow one, and nothing in it moves. Place it in
 * `HeroDrawn` with `padded={false}`.
 */
export function TitanFlow({
  label,
  steps,
  feedbackNote,
  measureNote,
  feedbackTo,
  className,
  style,
  ...rest
}: TitanFlowProps) {
  if (steps.length < 2) return null;
  const back = Math.max(0, Math.min(steps.length - 2, feedbackTo ?? Math.floor(steps.length / 2)));
  const flow = { steps, feedbackNote, measureNote, back };
  return (
    <div
      role="img"
      aria-label={label}
      className={cx('@container', className)}
      style={{ ...tones, ...style }}
      {...rest}
    >
      <div aria-hidden="true" data-flow="across" className="hidden @[600px]:block">
        <Across {...flow} />
      </div>
      <div aria-hidden="true" data-flow="down" className="@[600px]:hidden">
        <Down {...flow} />
      </div>
    </div>
  );
}
