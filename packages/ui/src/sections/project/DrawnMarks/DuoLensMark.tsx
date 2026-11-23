import { useId, type ComponentPropsWithoutRef } from 'react';

import { cx } from '../../../primitives';

/**
 * The Duo Decide mark: two overlapping rings, the overlap lit. Two people, one decision. It is
 * decoration (hidden from assistive technology) and sits under the "Where it's at" text.
 */
export function DuoLensMark({
  className,
  ...rest
}: Omit<ComponentPropsWithoutRef<'svg'>, 'children'>) {
  const clipId = useId();
  return (
    <svg
      aria-hidden="true"
      width={112}
      height={61}
      viewBox="0 0 132 72"
      fill="none"
      className={cx('block', className)}
      {...rest}
    >
      <defs>
        <clipPath id={clipId}>
          <circle cx={46} cy={36} r={34} />
        </clipPath>
      </defs>
      <circle
        cx={86}
        cy={36}
        r={34}
        clipPath={`url(#${clipId})`}
        fillOpacity={0.14}
        className="fill-signal"
      />
      <circle cx={46} cy={36} r={34} className="stroke-line-outline" />
      <circle cx={86} cy={36} r={34} className="stroke-line-outline" />
      <path
        d="M66 8.4 A34 34 0 0 1 66 63.6 A34 34 0 0 1 66 8.4 Z"
        strokeWidth={1.2}
        className="stroke-signal"
      />
    </svg>
  );
}
