import type { ComponentPropsWithoutRef, ElementType, ReactNode } from 'react';

import { cx } from '../cx';

export interface BreadcrumbItem {
  label: ReactNode;
  /** Where it goes. The last item is the current page and is never a link. */
  href?: string;
}

export interface BreadcrumbProps extends Omit<ComponentPropsWithoutRef<'nav'>, 'children'> {
  /** The trail, from the top level to the current page. */
  items: BreadcrumbItem[];
  /**
   * The component used for links. It receives `href`, `className` and `children`; wrap a router
   * link so that `href` becomes its `to`.
   */
  linkAs?: ElementType;
  /** The nav landmark's name. */
  'aria-label'?: string;
}

/** The trail above a page title: "Projects / Duo Decide". */
export function Breadcrumb({
  items,
  linkAs: Link = 'a',
  className,
  'aria-label': label = 'Breadcrumb',
  ...rest
}: BreadcrumbProps) {
  return (
    <nav aria-label={label} className={cx('type-label', className)} {...rest}>
      <ol className="m-0 flex min-h-touch list-none flex-wrap items-center gap-x-2.5 p-0">
        {items.map((item, index) => {
          const current = index === items.length - 1;
          return (
            <li key={index} className="flex items-center gap-x-2.5">
              {index > 0 ? (
                <span aria-hidden="true" className="text-tick">
                  /
                </span>
              ) : null}
              {current || !item.href ? (
                <span aria-current={current ? 'page' : undefined}>{item.label}</span>
              ) : (
                <Link
                  href={item.href}
                  // A short name ("PAS") is narrower than a touch target: `after` widens what can
                  // be tapped to 44px without moving the trail.
                  className="relative inline-flex min-h-touch items-center text-secondary no-underline after:absolute after:inset-y-0 after:left-1/2 after:w-full after:min-w-touch after:-translate-x-1/2 hover:text-signal motion-ok:transition-colors motion-ok:duration-hover"
                >
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
