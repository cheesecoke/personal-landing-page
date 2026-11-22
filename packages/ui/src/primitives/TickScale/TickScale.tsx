import type { ComponentPropsWithoutRef, CSSProperties } from 'react';

import { cx } from '../cx';

export interface TickScaleProps extends Omit<ComponentPropsWithoutRef<'span'>, 'children'> {
  /** Width in px (it never grows past its container). Keep it under 320: this is not a pattern. */
  width?: number;
  /**
   * The taller tick every fifth mark. `true` is the tone Home uses, `'strong'` the brighter one
   * on project pages, `false` leaves the 6px ticks only.
   */
  major?: boolean | 'strong';
}

const minor = 'repeating-linear-gradient(90deg, var(--line-tick) 0 1px, transparent 1px 8px)';
const majorTick = (colour: string) =>
  `repeating-linear-gradient(90deg, ${colour} 0 1px, transparent 1px 40px)`;

/**
 * A tick scale: 1px ticks every 8px, 6px tall, every fifth 10px tall. Instrument detail under a
 * numeral or along a rule. Decoration, hidden from assistive technology.
 */
export function TickScale({
  width = 160,
  major = true,
  className,
  style,
  ...rest
}: TickScaleProps) {
  const scale: CSSProperties = major
    ? {
        height: 10,
        backgroundImage: `${minor}, ${majorTick(major === 'strong' ? 'var(--line-outline)' : 'var(--line-tick-major)')}`,
        backgroundSize: '100% 6px, 100% 10px',
      }
    : { height: 6, backgroundImage: minor, backgroundSize: '100% 6px' };
  return (
    <span
      aria-hidden="true"
      className={cx('block max-w-full bg-bottom-left bg-no-repeat', className)}
      style={{ width, ...scale, ...style }}
      {...rest}
    />
  );
}
