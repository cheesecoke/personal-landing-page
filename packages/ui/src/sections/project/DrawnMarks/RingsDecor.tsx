import type { ComponentPropsWithoutRef } from 'react';

import { cx } from '../../../primitives';

const faint = 'border-[color-mix(in_srgb,var(--line-hairline)_70%,var(--bg-ground))]';
const ring =
  'absolute top-[52%] left-1/2 box-border aspect-[2.8/1] -translate-1/2 rounded-[50%] border';

/**
 * The type-only hero of a page with no imagery (Thread Quest): a few flattened rings, one with a
 * lit top edge, the innermost dashed. Decoration, hidden from assistive technology.
 */
export function RingsDecor({
  className,
  ...rest
}: Omit<ComponentPropsWithoutRef<'div'>, 'children'>) {
  return (
    <div
      aria-hidden="true"
      className={cx('relative h-[clamp(140px,17vw,240px)] min-w-0 overflow-hidden', className)}
      {...rest}
    >
      <span className={cx(ring, 'w-[92%]', faint)} />
      <span className={cx(ring, 'w-[72%] border-hairline')} />
      <span className={cx(ring, 'w-[52%] border-hairline border-t-signal-dim')} />
      <span className={cx(ring, 'w-[32%] border-dashed border-tick')} />
      <span className="absolute top-[52%] left-1/2 size-[5px] -translate-1/2 rounded-full bg-line-outline" />
    </div>
  );
}
