import { useCallback, useEffect, useId, useRef, useState, type CSSProperties } from 'react';

import { Grain, VisuallyHidden } from '../../primitives';
import { Container } from '../Container/Container';
import { cx } from '../internal/cx';
import type { LinkComponent } from '../internal/link';
import { NavMark } from './NavMark';
import type { SiteNavItem } from './SiteNav';

/** The words of the phone menu. */
export interface SiteNavMenuLabels {
  /** The button that opens the menu, and the menu's accessible name ("Menu"). */
  open: string;
  /** The button that closes it ("Close"). */
  close: string;
  /** The Home row at the top of the list ("Home"). */
  home: string;
}

export interface SiteNavMenuProps {
  name: string;
  homeHref: string;
  items: readonly SiteNavItem[];
  current?: string;
  labels: SiteNavMenuLabels;
  /** Changes when the reader moves to another URL; the menu closes when it does. */
  locationKey?: string;
  linkAs: LinkComponent;
}

const controlClass =
  'inline-flex h-11 min-w-touch cursor-pointer items-center gap-2.5 self-center border-0 bg-transparent px-3 type-nav text-primary hover:text-signal -mr-3 motion-ok:transition-colors motion-ok:duration-hover motion-ok:ease-[ease]';

const glyphProps = {
  'aria-hidden': true,
  viewBox: '0 0 16 16',
  className: 'size-4 flex-none fill-none stroke-current',
  strokeWidth: 1.25,
  strokeLinecap: 'round',
} as const;

/**
 * The phone nav (under `md`): one labelled button in the header, and the full-height panel it
 * opens. The panel is a modal `<dialog>`, so the page behind is inert and focus stays inside. The
 * pages are large rows near the thumb, and the nav timeline turns the corner: the teal line runs
 * down the panel's edge to a lit circle beside the page the reader is on.
 *
 * It closes on a link, the close button, Escape, a change of URL, and when the header grows its
 * desktop row. The button also names the dialog with `commandfor`, so browsers that support
 * invoker commands open it before (or without) the script.
 */
export function SiteNavMenu({
  name,
  homeHref,
  items,
  current,
  labels,
  locationKey,
  linkAs: Link,
}: SiteNavMenuProps) {
  const id = `site-menu-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);

  const openMenu = () => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (!dialog.open) dialog.showModal();
    // Focus goes to the panel itself: it is announced by name, and no control shows a focus ring
    // to a reader who opened it by touch. Tab then starts at the top.
    dialog.focus({ preventScroll: true });
    setOpen(true);
  };

  const closeMenu = useCallback(() => {
    const dialog = dialogRef.current;
    if (!dialog?.open) return;
    dialog.close();
    buttonRef.current?.focus({ preventScroll: true });
    setOpen(false);
  }, []);

  // A new URL (a link in the panel, or the back button) closes the menu.
  const place = locationKey ?? current;
  const lastPlace = useRef(place);
  useEffect(() => {
    if (lastPlace.current === place) return;
    lastPlace.current = place;
    closeMenu();
  }, [place, closeMenu]);

  // While it is open the page behind does not scroll, and it closes if the viewport grows past
  // the phone layout (the menu button is then not rendered).
  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    const overflow = root.style.overflow;
    root.style.overflow = 'hidden';
    const onResize = () => {
      if (buttonRef.current?.offsetParent === null) closeMenu();
    };
    window.addEventListener('resize', onResize);
    return () => {
      root.style.overflow = overflow;
      window.removeEventListener('resize', onResize);
    };
  }, [open, closeMenu]);

  // Keys are handled on the panel itself, before they reach the page: one Escape closes one
  // thing (the page's own Escape handlers do not also run), and Tab stays inside the panel.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        closeMenu();
        return;
      }
      if (event.key !== 'Tab') return;
      const stops = [...dialog.querySelectorAll<HTMLElement>('a[href], button')];
      const first = stops[0];
      const last = stops[stops.length - 1];
      const from = document.activeElement;
      if (!first || !last) return;
      if (event.shiftKey && (from === first || from === dialog)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && from === last) {
        event.preventDefault();
        first.focus();
      }
    };
    dialog.addEventListener('keydown', onKeyDown);
    return () => dialog.removeEventListener('keydown', onKeyDown);
  }, [closeMenu]);

  const rows: readonly SiteNavItem[] = [{ label: labels.home, href: homeHref }, ...items];
  const currentRow = rows.findIndex((row) => row.href === current);
  // Rows between the centre of the current row and the foot of the list.
  const rowsBelow = rows.length - currentRow - 0.5;

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls={id}
        aria-haspopup="dialog"
        data-nav-menu-button=""
        onClick={openMenu}
        className={cx(controlClass, 'md:hidden noscript:hidden')}
        {...{ commandfor: id, command: 'show-modal' }}
      >
        <span>{labels.open}</span>
        <svg {...glyphProps}>
          <path d="M1 5.5h14M1 10.5h14" />
        </svg>
      </button>
      <dialog
        ref={dialogRef}
        id={id}
        aria-label={labels.open}
        data-nav-menu=""
        onClose={() => setOpen(false)}
        tabIndex={-1}
        className={cx(
          'fixed inset-0 m-0 box-border h-dvh max-h-none w-full max-w-none overflow-y-auto overscroll-contain border-0 bg-ground p-0 text-primary opacity-0 outline-none backdrop:bg-ground open:opacity-100',
          'pt-[env(safe-area-inset-top)] pr-[env(safe-area-inset-right)] pl-[env(safe-area-inset-left)]',
          'motion-ok:transition-[opacity,display,overlay] motion-ok:transition-discrete motion-ok:duration-hover motion-ok:ease-out motion-ok:open:starting:opacity-0',
        )}
      >
        <Grain position="fixed" />
        <Container className="relative flex min-h-full flex-col pb-[max(env(safe-area-inset-bottom),--spacing(6))]">
          <div className="flex min-h-14 flex-none items-center justify-between gap-x-8 border-b border-hairline">
            <NavMark
              name={name}
              href={homeHref}
              current={current === homeHref}
              linkAs={Link}
              onClick={closeMenu}
            />
            <button
              type="button"
              data-nav-menu-close=""
              onClick={closeMenu}
              className={controlClass}
              {...{ commandfor: id, command: 'close' }}
            >
              <span>{labels.close}</span>
              <svg {...glyphProps}>
                <path d="M2.5 2.5l11 11M13.5 2.5l-11 11" />
              </svg>
            </button>
          </div>
          <div className="relative flex flex-1 flex-col justify-end border-l border-hairline">
            {currentRow < 0 ? null : (
              <span
                aria-hidden="true"
                data-nav-menu-timeline=""
                className="pointer-events-none absolute top-0 bottom-[calc(var(--rows-below)*--spacing(16))] -left-px w-px"
                style={{ '--rows-below': rowsBelow } as CSSProperties}
              >
                <span className="absolute inset-x-0 top-0 bottom-[4.5px] origin-top bg-signal shadow-glow-signal motion-ok:transition-transform motion-ok:duration-nav motion-ok:ease-out motion-ok:starting:scale-y-0" />
                <span className="absolute -bottom-[4.5px] -left-1 box-border size-[9px] rounded-full border border-signal bg-ground shadow-[0_0_10px_color-mix(in_srgb,var(--palette-signal)_35%,transparent)] motion-ok:transition-opacity motion-ok:duration-nav motion-ok:ease-out motion-ok:starting:opacity-0" />
              </span>
            )}
            <ul className="m-0 list-none p-0 pt-10">
              {rows.map((row, index) => {
                const on = index === currentRow;
                return (
                  <li key={row.href}>
                    <Link
                      href={row.href}
                      data-nav-menu-item={row.href}
                      aria-current={on ? 'page' : undefined}
                      onClick={closeMenu}
                      className={cx(
                        'flex h-16 items-center gap-2.5 pl-7 type-h2 no-underline hover:text-signal',
                        on ? 'text-primary' : row.quiet ? 'text-label' : 'text-secondary',
                        'motion-ok:transition-colors motion-ok:duration-hover motion-ok:ease-[ease]',
                      )}
                    >
                      {row.label}
                      {row.ring ? (
                        <>
                          <span
                            aria-hidden="true"
                            data-nav-ring=""
                            className="box-border size-[9px] flex-none rounded-full border border-fresh-ring"
                          />
                          <VisuallyHidden>{row.ring.label}</VisuallyHidden>
                        </>
                      ) : null}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </Container>
      </dialog>
    </>
  );
}
