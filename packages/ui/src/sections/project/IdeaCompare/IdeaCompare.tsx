import { useId, type ReactNode } from 'react';

import { Section, ThreadSection } from '../../../layout';
import { cx, Heading, Panel, Readout, Text } from '../../../primitives';
import { ProjectFigure, type FigureCrop, type ProjectImage } from '../ProjectFigure/ProjectFigure';

/** One of the two drawn cards. */
export interface CompareCard {
  title: string;
  /** A small readout beside the title ("n = 1"). */
  tag?: string;
  /** The marks drawn in the card: two group letters ("A", "B") or the blocks ("W1" to "W4"). */
  marks: readonly string[];
  text: ReactNode;
  /** What the drawing shows, for screen readers. */
  label: string;
  /** `crowd`: dots split into two groups. `blocks`: a row of blocks, the later half lit. */
  drawing?: 'crowd' | 'blocks';
}

export interface IdeaCompareProps {
  /** The section label ("The idea"). */
  title: ReactNode;
  /** The idea in one line, set large ("Stable frame, adaptive content."). */
  lead: ReactNode;
  intro: ReactNode;
  /** Two cards set against each other. The second holds the lit edge. */
  cards: readonly CompareCard[];
  outro?: ReactNode;
  figure?: { image: ProjectImage; caption?: ReactNode; crop?: FigureCrop };
  id?: string;
  /** Put a node on the thread beside the section. Default `true`. */
  node?: boolean;
  className?: string;
}

const tiny = 'type-readout-status text-[10px]';

/** Four rows of eight dots, split down the middle: filled on one side, hollow on the other. */
function Crowd({ marks }: { marks: readonly string[] }) {
  const dots = [];
  for (let row = 0; row < 4; row += 1) {
    for (let column = 0; column < 8; column += 1) {
      const second = column >= 4;
      dots.push(
        <span
          key={`${row}-${column}`}
          className={cx(
            'absolute -mt-[3.5px] -ml-[3.5px] size-[7px] rounded-full',
            second ? 'box-border border border-ash' : 'bg-line-outline',
          )}
          style={{ left: `${6 + column * 11.5 + (second ? 8 : 0)}%`, top: `${18 + row * 21}%` }}
        />,
      );
    }
  }
  return (
    <div aria-hidden="true" className="relative h-24">
      {dots}
      <span className="absolute top-[6%] bottom-[6%] left-[49.5%] w-px bg-tick" />
      <span className={cx(tiny, 'absolute -bottom-1.5 left-[6%] text-secondary')}>{marks[0]}</span>
      <span className={cx(tiny, 'absolute -bottom-1.5 left-[54%] text-secondary')}>{marks[1]}</span>
    </div>
  );
}

/** One person, then a row of blocks: the first days of each are hatched out, the later half lit. */
function Blocks({ marks }: { marks: readonly string[] }) {
  const from = Math.ceil(marks.length / 2);
  return (
    <div aria-hidden="true" className="flex h-24 flex-col justify-center gap-3">
      <div className="flex items-center gap-2.5">
        <span className="box-border size-[9px] flex-none rounded-full border border-signal" />
        <span className="h-px flex-1 bg-[linear-gradient(90deg,var(--palette-signal-dim),transparent)]" />
      </div>
      <div className="flex gap-1.5">
        {marks.map((mark, index) => {
          const on = index >= from;
          return (
            <span
              key={mark}
              className={cx(
                'relative h-7 min-w-0 flex-1 overflow-hidden rounded-[2px] border',
                on ? 'border-signal-dim' : 'border-tick',
              )}
            >
              <span className="absolute inset-y-0 left-0 w-[26%] bg-[repeating-linear-gradient(135deg,var(--line-hairline)_0_1px,transparent_1px_5px)]" />
              {on ? <span className="absolute inset-y-0 right-0 left-[26%] bg-signal/10" /> : null}
              <span
                className={cx(
                  tiny,
                  'absolute top-1/2 right-1.5 -translate-y-1/2',
                  on ? 'text-primary' : 'text-secondary',
                )}
              >
                {mark}
              </span>
            </span>
          );
        })}
      </div>
    </div>
  );
}

/**
 * An idea set against the usual way of doing it (Lifebox: testing for a crowd against an app built
 * for one person): the idea in one large line, a paragraph, two small drawn cards, a closing line
 * and a figure. Each drawing is one labelled image. Nothing here moves.
 */
export function IdeaCompare({
  title,
  lead,
  intro,
  cards,
  outro,
  figure,
  id,
  node = true,
  className,
}: IdeaCompareProps) {
  const headingId = useId();
  const Wrapper = node ? ThreadSection : Section;
  return (
    <Wrapper id={id} aria-labelledby={headingId} className={cx('z-1 scroll-mt-6', className)}>
      <Heading level={2} role="label" id={headingId} className="mb-4">
        {title}
      </Heading>
      <Text role="h2">{lead}</Text>
      <Text measure className="mt-4">
        {intro}
      </Text>
      <div className="mt-9 grid max-w-[980px] grid-cols-[repeat(auto-fit,minmax(min(320px,100%),1fr))] gap-4">
        {cards.map((card, index) => {
          const drawing = card.drawing ?? (index === 0 ? 'crowd' : 'blocks');
          return (
            <Panel
              key={card.title}
              role="img"
              aria-label={card.label}
              litEdge={index === 1}
              className="flex flex-col gap-3.5 px-5.5 pt-5 pb-5.5"
            >
              <span className="font-sans text-[15px] font-semibold tracking-[-0.01em] text-primary [font-stretch:112.5%]">
                {card.title}
                {card.tag ? (
                  <Readout kind="status" tone="warm" className="ml-3">
                    {card.tag}
                  </Readout>
                ) : null}
              </span>
              {drawing === 'crowd' ? <Crowd marks={card.marks} /> : <Blocks marks={card.marks} />}
              <span className="text-[15px] leading-normal text-secondary">{card.text}</span>
            </Panel>
          );
        })}
      </div>
      {outro ? (
        <p className="relative z-1 m-0 mt-5 max-w-[60ch] text-[15px] leading-normal text-secondary">
          {outro}
        </p>
      ) : null}
      {figure ? (
        <ProjectFigure
          image={figure.image}
          caption={figure.caption}
          crop={figure.crop}
          className="mt-2 max-w-[980px]"
        />
      ) : null}
    </Wrapper>
  );
}
