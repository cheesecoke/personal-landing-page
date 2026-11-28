import { useEffect, useRef, useState, type ComponentType } from 'react';

import { Button, cx, PortalSpiral, Text } from '@cwc/ui';

// Types only: the game and its words are a separate chunk, loaded after "Enter".
import type { PortalDiveProps } from './PortalDive';

/** The few words the overlay needs before the game has loaded (from `contact.json`). */
export interface PortalDiveWords {
  /** The overlay's accessible name. */
  label: string;
  /** While the game's chunk loads. */
  loading: string;
  /** When it did not load. */
  failed: string;
  /** The button that leaves without playing. */
  back: string;
}

type GameModule = { default: ComponentType<PortalDiveProps> };

export interface PortalDiveHostProps {
  /** Shown while true. */
  open: boolean;
  /** Exit, Escape, or "Back to Contact". The caller sets `open` false. */
  onClose: () => void;
  /** The page's mail link, for the win screen. */
  mailto: string;
  /** The page's LinkedIn link: the win screen's first way to get in touch. */
  linkedin?: string;
  words: PortalDiveWords;
  /** Loads the game. Default: its own chunk. Stories pass a stand-in. */
  load?: () => Promise<GameModule>;
  /** Props for the game itself (stories: a seed, a store, a preview). */
  gameProps?: Partial<Omit<PortalDiveProps, 'mailto' | 'linkedin' | 'onExit'>>;
}

const loadGame = () => import('./PortalDive');

/**
 * The full-screen layer the Portal dive plays in: a modal `<dialog>` over the page (the page is
 * inert and does not scroll), Ground to the edges, sized in dvh and padded by the safe areas. It
 * fetches the game's chunk the first time it opens, shows a quiet line while that loads and a way
 * back if it fails. Escape leaves at any time; focus goes back where it came from (the portal).
 */
export function PortalDiveHost({
  open,
  onClose,
  mailto,
  linkedin,
  words,
  load = loadGame,
  gameProps,
}: PortalDiveHostProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [game, setGame] = useState<GameModule['default'] | null>(null);
  const [failed, setFailed] = useState(false);

  const onCloseRef = useRef(onClose);
  const loadRef = useRef(load);
  useEffect(() => {
    onCloseRef.current = onClose;
    loadRef.current = load;
  });

  // The chunk: fetched on the first open (and again after a failure), then kept.
  useEffect(() => {
    if (!open || game) return;
    let cancelled = false;
    loadRef
      .current()
      .then((mod) => {
        if (!cancelled) setGame(() => mod.default);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
      // Closing clears a failure, so the next open tries again from the loading line.
      setFailed(false);
    };
  }, [open, game]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!open || !dialog) return;
    const from = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    if (!dialog.open) dialog.showModal();
    dialog.focus({ preventScroll: true });

    const root = document.documentElement;
    const overflow = root.style.overflow;
    root.style.overflow = 'hidden';

    // Escape, as a key (before the page sees it) and as the browser's own cancel.
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      event.stopPropagation();
      onCloseRef.current();
    };
    const onCancel = (event: Event) => {
      event.preventDefault();
      onCloseRef.current();
    };
    dialog.addEventListener('keydown', onKeyDown);
    dialog.addEventListener('cancel', onCancel);
    return () => {
      dialog.removeEventListener('keydown', onKeyDown);
      dialog.removeEventListener('cancel', onCancel);
      root.style.overflow = overflow;
      if (dialog.open) dialog.close();
      from?.focus({ preventScroll: true });
    };
  }, [open]);

  const Game = game;
  return (
    <dialog
      ref={dialogRef}
      aria-label={words.label}
      data-portal-dive=""
      tabIndex={-1}
      className={cx(
        'fixed inset-0 m-0 box-border h-dvh max-h-none w-full max-w-none overflow-hidden overscroll-contain border-0 bg-ground p-0 text-primary opacity-0 outline-none backdrop:bg-ground open:opacity-100',
        'pt-[env(safe-area-inset-top)] pr-[env(safe-area-inset-right)] pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)]',
        'motion-ok:transition-[opacity,display,overlay] motion-ok:transition-discrete motion-ok:duration-hover motion-ok:ease-out motion-ok:open:starting:opacity-0',
      )}
    >
      {!open ? null : Game ? (
        // The page's own spiral goes in for the garden's portal (see `PortalDiveProps.spiral`).
        <Game
          mailto={mailto}
          linkedin={linkedin}
          onExit={onClose}
          spiral={PortalSpiral}
          {...gameProps}
        />
      ) : (
        <div className="flex h-full flex-col items-center justify-center gap-6 px-gutter text-center">
          <div role="status" data-portal-dive-state={failed ? 'failed' : 'loading'}>
            <Text tone="secondary">{failed ? words.failed : words.loading}</Text>
          </div>
          <Button variant="quiet" onClick={onClose}>
            {words.back}
          </Button>
        </div>
      )}
    </dialog>
  );
}
