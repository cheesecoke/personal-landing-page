import { useId, type ComponentPropsWithoutRef, type ReactNode } from 'react';

import { cx, Heading } from '../../../primitives';
import { ShootItem, type ShootData, type ShootLabels } from './ShootItem';

export interface ShootListProps extends Omit<ComponentPropsWithoutRef<'div'>, 'title'> {
  /** The list's label ("Not yet grown"). */
  title: ReactNode;
  shoots: readonly ShootData[];
  labels: ShootLabels;
  /** New marks by shoot id, as plain numbers, for shoots that just grew or were answered. */
  fresh?: Readonly<Record<string, { ageDays: number; lifeDays: number }>>;
  /** `raised`: inside the log panel. `ground`: on the page, in "Open questions and next". */
  surface?: 'raised' | 'ground';
  /** The heading element of the label. Default 3. */
  headingLevel?: 3 | 4;
  /** As `NewMarker`'s: leave it out, or pass `false` to see the page without script. */
  hydrated?: boolean;
}

/**
 * A project's shoots: what has not grown yet, with what has since grown or been answered. Dropped
 * shoots are left out; with nothing to show, the whole list (label included) renders nothing.
 */
export function ShootList({
  title,
  shoots,
  labels,
  fresh,
  surface = 'raised',
  headingLevel = 3,
  hydrated,
  className,
  ...rest
}: ShootListProps) {
  const headingId = useId();
  const shown = shoots.filter((shoot) => shoot.state !== 'dropped');
  if (shown.length === 0) return null;
  return (
    <div className={cx('flex flex-col gap-2.5', className)} {...rest}>
      <Heading
        level={headingLevel}
        role="label"
        tone={surface === 'raised' ? 'secondary' : 'label'}
        id={headingId}
      >
        {title}
      </Heading>
      <ul aria-labelledby={headingId} className="m-0 flex list-none flex-col p-0">
        {shown.map((shoot) => (
          <ShootItem
            key={shoot.id}
            shoot={shoot}
            labels={labels}
            fresh={fresh?.[shoot.id]}
            surface={surface}
            hydrated={hydrated}
          />
        ))}
      </ul>
    </div>
  );
}
