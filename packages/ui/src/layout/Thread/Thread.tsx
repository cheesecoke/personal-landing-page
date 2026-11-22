import {
  useRef,
  type CSSProperties,
  type ElementType,
  type HTMLAttributes,
  type ReactNode,
} from 'react';

import { cx } from '../internal/cx';
import { Section, type SectionMeasure, type SectionSpace } from '../Section/Section';
import styles from './Thread.module.css';
import { useThreadProgress, type ThreadProgressOptions } from './useThreadProgress';

/**
 * Where the thread sits.
 * `gutter`: project pages, in the page gutter 32px left of the content.
 * `column`: Projects, About, Beyond, Contact, at the left of a column indented 44px.
 * `edge`: Home, 36px left of the page column, on a full-width wrapper.
 */
export type ThreadPlacement = 'gutter' | 'column' | 'edge';

const px = (value: number | undefined) => (value === undefined ? undefined : `${value}px`);

/* ----------------------------------------------------------------------------------------- */

export interface ThreadScopeProps extends HTMLAttributes<HTMLElement>, ThreadProgressOptions {
  /** The element to render. Default `div`. */
  as?: ElementType;
  children?: ReactNode;
}

/**
 * The page root for a thread. Everything inside it (every `Thread` rail and every node) is one
 * thread that follows the reader. Put one around the page content.
 */
export function ThreadScope({ as: Tag = 'div', hash, children, ...rest }: ThreadScopeProps) {
  const ref = useRef<HTMLElement>(null);
  useThreadProgress(ref, { hash });
  return (
    <Tag ref={ref} data-thread-scope="" {...rest}>
      {children}
    </Tag>
  );
}

/* ----------------------------------------------------------------------------------------- */

export interface ThreadNodeProps {
  /**
   * `rail`: inside a `column` rail (pass it as a child of `Thread`); set `top` or `bottom`.
   * Otherwise the placement of the thread it belongs to; it sits against the nearest positioned
   * ancestor (a `ThreadSection` does this for you).
   */
  placement?: ThreadPlacement | 'rail';
  /** Offset from the top of its box, in px. Default 3 on a section. */
  top?: number;
  /** `rail` only: offset from the foot of the rail, in px (0 puts the node at the very end). */
  bottom?: number;
  className?: string;
}

const nodeClass: Record<NonNullable<ThreadNodeProps['placement']>, string | undefined> = {
  rail: styles.nodeRail,
  gutter: styles.nodeGutter,
  column: styles.nodeColumn,
  edge: styles.nodeEdge,
};

/** One node on the thread. Decorative: hidden from assistive tech, never interactive. */
export function ThreadNode({ placement = 'gutter', top, bottom, className }: ThreadNodeProps) {
  const style = {
    '--thread-node-top': px(top),
    '--thread-node-bottom': px(bottom),
  } as CSSProperties;
  return (
    <span
      aria-hidden="true"
      data-thread-node=""
      className={cx(styles.node, nodeClass[placement], className)}
      style={style}
    />
  );
}

/* ----------------------------------------------------------------------------------------- */

export interface ThreadProps {
  placement?: ThreadPlacement;
  /** Distance from the top of the column to where the line starts, in px. Default 0. */
  top?: number;
  /** Distance from the foot of the column to where the line ends, in px. Default 0. */
  bottom?: number;
  /** How far down the line has faded in, in percent of its length (the boards use 2, 8, 30). */
  fadeIn?: 2 | 8 | 30;
  /** Fade the line out over its last 8%. Default: on for `gutter` and `edge`, off for `column`. */
  fadeOut?: boolean;
  /** The travelling light. Default `true`; it never runs with reduced motion. */
  pulse?: boolean;
  /** `column` placement: the nodes that sit on the rail itself (`<ThreadNode placement="rail">`). */
  children?: ReactNode;
  className?: string;
}

const railClass: Record<ThreadPlacement, string | undefined> = {
  gutter: styles.railGutter,
  column: styles.railColumn,
  edge: styles.railEdge,
};

/**
 * The line itself: a dim base, the lit fill that follows the reader, and the travelling light.
 * It is absolutely positioned against the nearest positioned ancestor (a `ThreadColumn`).
 */
export function Thread({
  placement = 'gutter',
  top,
  bottom,
  fadeIn = 8,
  fadeOut = placement !== 'column',
  pulse = true,
  children,
  className,
}: ThreadProps) {
  const style = {
    '--thread-top': px(top),
    '--thread-bottom': px(bottom),
    '--thread-fade': `${fadeIn}%`,
  } as CSSProperties;
  return (
    <div
      aria-hidden="true"
      data-thread=""
      className={cx(styles.rail, railClass[placement], className)}
      style={style}
    >
      <div className={cx(styles.line, fadeOut && styles.lineFadeEnd)} />
      <div data-thread-fill="" className={styles.fill} />
      {pulse ? (
        <div className={styles.pulseClip}>
          <div className={styles.pulse} />
        </div>
      ) : null}
      {children}
    </div>
  );
}

/* ----------------------------------------------------------------------------------------- */

export interface ThreadColumnProps extends HTMLAttributes<HTMLElement> {
  /** The element to render. Default `div`. */
  as?: ElementType;
  placement?: ThreadPlacement;
  children?: ReactNode;
}

const columnClass: Record<ThreadPlacement, string | undefined> = {
  gutter: styles.columnGutter,
  column: styles.columnColumn,
  edge: undefined,
};

/**
 * The positioned box a `Thread` hangs on, with the phone clearance built in.
 * `gutter`: place inside the page `Container`; under 700px the content steps 14px right.
 * `column`: place inside the page `Container`; the content is indented 44px (20px under 700px).
 * `edge`: a full-width wrapper; its sections are `ThreadSection placement="edge"`.
 */
export function ThreadColumn({
  as: Tag = 'div',
  placement = 'gutter',
  className,
  children,
  ...rest
}: ThreadColumnProps) {
  return (
    <Tag className={cx(styles.column, columnClass[placement], className)} {...rest}>
      {children}
    </Tag>
  );
}

/* ----------------------------------------------------------------------------------------- */

export interface ThreadSectionProps extends HTMLAttributes<HTMLElement> {
  /** The element to render. Default `section`. Give it `aria-labelledby` or `aria-label`. */
  as?: ElementType;
  placement?: ThreadPlacement;
  /** Offset of the node from the top of the section, in px. Default 3. */
  nodeTop?: number;
  /** Space above (see `Section`). Default `section`; `edge` sections set their own padding. */
  space?: SectionSpace;
  /** Max width (see `Section`). */
  measure?: SectionMeasure;
  children?: ReactNode;
}

/**
 * A page section with its node on the thread. The title stays a plain heading: the node is
 * decoration and nothing here is interactive.
 *
 * `edge` sections are full width; their children are wrapped in the page column, which steps
 * right on a phone to clear the thread.
 */
export function ThreadSection({
  as = 'section',
  placement = 'gutter',
  nodeTop,
  space = placement === 'edge' ? 'none' : 'section',
  measure,
  className,
  children,
  ...rest
}: ThreadSectionProps) {
  return (
    <Section as={as} space={space} measure={measure} className={className} {...rest}>
      <ThreadNode placement={placement} top={nodeTop} />
      {placement === 'edge' ? <div className={styles.clearance}>{children}</div> : children}
    </Section>
  );
}
