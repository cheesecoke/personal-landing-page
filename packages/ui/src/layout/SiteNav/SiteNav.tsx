import { useRef, type HTMLAttributes } from 'react';

import { RingMark, VisuallyHidden } from '../../primitives';
import { Container } from '../Container/Container';
import { cx } from '../internal/cx';
import type { LinkComponent, SiteLink } from '../internal/link';
import { useNavTimeline, type NavTimelineState } from './useNavTimeline';

export interface SiteNavItem extends SiteLink {
  /**
   * The release ring: a small Hinoki ring after the label, shown for the first days of a release.
   * `label` is read out by assistive tech, so colour is not the only signal.
   */
  ring?: { label: string };
}

export interface SiteNavProps extends HTMLAttributes<HTMLElement> {
  /** The site name; links home. */
  name: string;
  /** Where the name links. Default `/`. */
  homeHref?: string;
  /** The nav items, in order. */
  items: readonly SiteNavItem[];
  /**
   * The `href` of the item the reader is on: `homeHref` for Home, an item's `href` for that page
   * and the pages under it. The teal line runs to it. Omit it and no line is drawn.
   */
  current?: string;
  /** Accessible name of the nav. */
  label: string;
  /** The element or component for the links. Default `a`. It receives `href`. */
  linkAs?: LinkComponent;
}

const linkMotion = 'motion-ok:transition-colors motion-ok:duration-hover motion-ok:ease-[ease]';

export interface NavTimelineProps extends NavTimelineState {
  /** Hide the line under `md` (Home on a phone: the name has its own row). */
  hideOnPhone?: boolean;
}

/**
 * The teal line along the header's bottom edge, ending in a small lit circle under the active
 * item. Its width transitions over the `nav` duration; with reduced motion it jumps.
 */
export function NavTimeline({ x, measured, animate, hideOnPhone = false }: NavTimelineProps) {
  return (
    <span
      aria-hidden="true"
      data-nav-timeline=""
      className={cx(
        'pointer-events-none absolute -bottom-px left-0 h-px',
        measured ? 'opacity-100' : 'opacity-0',
        animate && 'motion-ok:transition-[width] motion-ok:duration-nav motion-ok:ease-out',
        hideOnPhone && 'max-md:hidden',
      )}
      style={{ width: `${x}px` }}
    >
      <span className="absolute right-[4.5px] bottom-0 left-0 h-px bg-signal shadow-glow-signal" />
      <span className="absolute -right-[4.5px] -bottom-1 box-border size-[9px] rounded-full border border-signal bg-ground shadow-[0_0_10px_color-mix(in_srgb,var(--palette-signal)_35%,transparent)]" />
    </span>
  );
}

/**
 * The site header nav: the name and logo on the left, the pages on the right, and the timeline
 * line that grows to the page the reader is on. Under `md` the name takes its own row and the
 * links spread across the row below.
 */
export function SiteNav({
  name,
  homeHref = '/',
  items,
  current,
  label,
  linkAs: Link = 'a',
  className,
  ...rest
}: SiteNavProps) {
  const rowRef = useRef<HTMLDivElement>(null);
  const homeRef = useRef<HTMLDivElement>(null);
  const linksRef = useRef<HTMLDivElement>(null);

  const isHome = current === homeHref;
  const getTarget = () => {
    if (current === undefined) return null;
    if (isHome) return homeRef.current;
    return (
      [...(linksRef.current?.querySelectorAll<HTMLElement>('[data-nav-item]') ?? [])].find(
        (el) => el.dataset.navItem === current,
      ) ?? null
    );
  };
  const timeline = useNavTimeline(rowRef, getTarget, current, [homeRef, linksRef]);

  return (
    <Container as="nav" aria-label={label} className={className} {...rest}>
      <div
        ref={rowRef}
        className="relative flex flex-wrap items-stretch justify-between gap-x-8 border-b border-hairline pt-2.5 md:min-h-[88px] md:pt-0"
      >
        <div
          ref={homeRef}
          className="relative flex min-h-12 basis-full items-center md:min-h-0 md:basis-auto"
        >
          {/* TODO(tokens): the wordmark (18px, 600, 125% width) has no type role yet. */}
          <Link
            href={homeHref}
            aria-current={isHome ? 'page' : undefined}
            className={cx(
              'group/mark inline-flex h-12 items-center gap-2.5 md:h-auto md:min-h-touch font-sans text-[18px] leading-none font-semibold tracking-[-0.01em] whitespace-nowrap text-primary no-underline [font-stretch:125%] hover:text-signal',
              linkMotion,
            )}
          >
            <RingMark size={24} />
            <span>{name}</span>
          </Link>
        </div>
        <div
          ref={linksRef}
          className="-mx-3 flex basis-full items-stretch justify-between md:-mr-3 md:ml-0 md:basis-auto md:justify-start md:gap-2"
        >
          {items.map((item) => {
            const on = item.href === current;
            return (
              <Link
                key={item.href}
                href={item.href}
                data-nav-item={item.href}
                aria-current={on ? 'page' : undefined}
                className={cx(
                  'relative flex h-12 items-center px-3 type-nav no-underline hover:text-signal md:h-auto md:min-h-touch',
                  on ? 'text-primary' : item.quiet ? 'text-label' : 'text-secondary',
                  item.ring && 'gap-1.5',
                  linkMotion,
                )}
              >
                {item.label}
                {item.ring ? (
                  <>
                    <span
                      aria-hidden="true"
                      data-nav-ring=""
                      className="box-border size-[9px] flex-none rounded-full border border-fresh-ring"
                    />
                    <VisuallyHidden>{item.ring.label}</VisuallyHidden>
                  </>
                ) : null}
              </Link>
            );
          })}
        </div>
        {current === undefined ? null : <NavTimeline {...timeline} hideOnPhone={isHome} />}
      </div>
    </Container>
  );
}
