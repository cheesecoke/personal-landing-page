import {
  useCallback,
  useEffect,
  useId,
  useState,
  type ComponentPropsWithoutRef,
  type ReactNode,
} from 'react';

import { cx } from '../cx';

export interface ExpanderProps extends Omit<ComponentPropsWithoutRef<'div'>, 'title'> {
  /** The row's title, in the H3 style. */
  title: ReactNode;
  /** A small readout on the right of the row ("3 artifacts"). */
  meta?: ReactNode;
  /** The body, shown when open. */
  children: ReactNode;
  /** Open on first render (uncontrolled). Expanders are closed by default. */
  defaultOpen?: boolean;
  /** Controlled open state. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** The heading element the row's button sits in. */
  headingLevel?: 2 | 3 | 4;
  /**
   * An id for the row. A link to `#id` scrolls to the row and opens it.
   */
  id?: string;
  bodyClassName?: string;
}

const headings = { 2: 'h2', 3: 'h3', 4: 'h4' } as const;

/**
 * One "go deeper" row: a full-width button with a hairline above it, a plus that becomes a minus,
 * and a body that opens below. The body opens by height and opacity; under reduced motion it
 * simply appears. Wrap a list of them in `ExpanderGroup` for the closing hairline.
 */
export function Expander({
  title,
  meta,
  children,
  defaultOpen = false,
  open: controlled,
  onOpenChange,
  headingLevel = 3,
  id,
  className,
  bodyClassName,
  ...rest
}: ExpanderProps) {
  const [uncontrolled, setUncontrolled] = useState(defaultOpen);
  const open = controlled ?? uncontrolled;
  const baseId = useId();
  const buttonId = `${baseId}-button`;
  const bodyId = `${baseId}-body`;
  const Heading = headings[headingLevel];

  const setOpen = useCallback(
    (next: boolean) => {
      setUncontrolled(next);
      onOpenChange?.(next);
    },
    [onOpenChange],
  );

  // A link to this row's id opens it.
  useEffect(() => {
    if (!id) return;
    const openIfTargeted = () => {
      if (window.location.hash === `#${id}`) setOpen(true);
    };
    openIfTargeted();
    window.addEventListener('hashchange', openIfTargeted);
    return () => window.removeEventListener('hashchange', openIfTargeted);
  }, [id, setOpen]);

  return (
    <div
      id={id}
      data-state={open ? 'open' : 'closed'}
      className={cx('scroll-mt-6 border-t border-hairline', className)}
      {...rest}
    >
      <Heading className="m-0">
        <button
          type="button"
          id={buttonId}
          aria-expanded={open}
          aria-controls={bodyId}
          onClick={() => setOpen(!open)}
          className="flex min-h-16 w-full cursor-pointer items-center justify-between gap-6 border-0 bg-transparent px-0 py-4.5 text-left type-h3 hover:text-signal motion-ok:transition-colors motion-ok:duration-hover motion-ok:ease-[ease]"
        >
          <span>{title}</span>
          {meta ? (
            <span className="ml-auto type-readout-status text-[10px] whitespace-nowrap text-label">
              {meta}
            </span>
          ) : null}
          <svg
            aria-hidden="true"
            width={14}
            height={14}
            viewBox="0 0 14 14"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.2}
            className="flex-none"
          >
            <path d="M1 7h12" />
            {open ? null : <path d="M7 1v12" />}
          </svg>
        </button>
      </Heading>
      <div
        id={bodyId}
        role="region"
        aria-labelledby={buttonId}
        inert={!open}
        className={cx(
          'grid motion-ok:transition-[grid-template-rows,opacity,visibility] motion-ok:duration-hover motion-ok:ease-out',
          open ? 'visible grid-rows-[1fr] opacity-100' : 'invisible grid-rows-[0fr] opacity-0',
        )}
      >
        {/* The side bleed keeps focus outlines inside the clip. */}
        <div className="-mx-2 min-h-0 overflow-hidden px-2">
          <div className={cx('pb-6', bodyClassName)}>{children}</div>
        </div>
      </div>
    </div>
  );
}

/** A list of expanders, closed off by a hairline under the last row. */
export function ExpanderGroup({ className, ...rest }: ComponentPropsWithoutRef<'div'>) {
  return <div className={cx('border-b border-hairline', className)} {...rest} />;
}
