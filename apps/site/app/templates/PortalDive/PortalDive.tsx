import { useEffect, useRef, useState, useSyncExternalStore } from 'react';

import {
  bestStore,
  DiveGame,
  type BestResult,
  type BestStore,
  type DiveGameHandle,
  type DiveResult,
} from '@cwc/dive/react';
import { Button, Heading, Panel, Readout, Text, TextLink } from '@cwc/ui';

import { diveCopy, type PortalDiveCopy } from './copy';

type Screen = 'start' | 'running' | 'crashed' | 'won';

export interface PortalDiveProps {
  /** The page's mail link, for the win screen. */
  mailto: string;
  /** The page's LinkedIn link. When given, the win screen leads with it and mail comes second. */
  linkedin?: string;
  /** Leave the game: the Exit and "Back to Contact" buttons. */
  onExit: () => void;
  /** Where the best result is kept. Default: localStorage, falling back to memory. */
  store?: BestStore;
  /** Seeds the course. Default: a fresh course every run. */
  seed?: number;
  /** Open on an end screen with this result, for stories and visual checks. */
  preview?: DiveResult;
  copy?: PortalDiveCopy;
}

const COARSE = '(pointer: coarse)';
function subscribePointer(onChange: () => void) {
  const mq = typeof window.matchMedia === 'function' ? window.matchMedia(COARSE) : null;
  mq?.addEventListener('change', onChange);
  return () => mq?.removeEventListener('change', onChange);
}
const touchFirst = () =>
  typeof window.matchMedia === 'function' && window.matchMedia(COARSE).matches;

/**
 * The Portal dive, full size inside the page's overlay: the start screen, the run, and the crash
 * and win screens over the tunnel. Loaded only after the reader chooses to enter (it is its own
 * chunk), so the game and every word of it stay out of the Contact page until then.
 */
export default function PortalDive({
  mailto,
  linkedin,
  onExit,
  store: storeIn,
  seed,
  preview,
  copy = diveCopy,
}: PortalDiveProps) {
  const [store] = useState(() => storeIn ?? bestStore());
  const [screen, setScreen] = useState<Screen>(preview ? preview.status : 'start');
  const [result, setResult] = useState<DiveResult | null>(preview ?? null);
  const [best, setBest] = useState<BestResult | null>(() => store.read());
  const touch = useSyncExternalStore(subscribePointer, touchFirst, () => false);
  const game = useRef<DiveGameHandle>(null);
  const stage = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  // "Dive again" lays a new run out first; it starts once that run exists (after the commit).
  const startNext = useRef(false);
  const [round, setRound] = useState(0);

  // Focus follows the screen: the panel's first button, or the game area while running.
  useEffect(() => {
    if (screen === 'running') {
      if (startNext.current) {
        startNext.current = false;
        game.current?.start();
      }
      stage.current?.focus({ preventScroll: true });
      return;
    }
    panel.current
      ?.querySelector<HTMLElement>('[data-dive-primary]')
      ?.focus({ preventScroll: true });
  }, [screen, round]);

  const start = () => {
    game.current?.start();
    setScreen('running');
  };
  const again = () => {
    startNext.current = true;
    game.current?.restart(seed);
    setResult(null);
    setRound((n) => n + 1);
    setScreen('running');
  };
  const onEnd = (r: DiveResult) => {
    setBest(store.record(r));
    setResult(r);
    setScreen(r.status);
  };

  const bestLine = best ? (
    <Text tone="label" data-dive-best="">
      {copy.best(best)}
    </Text>
  ) : null;

  return (
    <div className="flex h-full flex-col">
      <div className="relative z-10 flex min-h-16 flex-none items-center justify-end border-b border-hairline bg-ground px-gutter">
        <Button variant="quiet" data-dive-exit="" onClick={onExit}>
          {copy.buttons.exit}
        </Button>
      </div>
      <div ref={stage} tabIndex={-1} className="relative min-h-0 flex-1 outline-none">
        <div className="absolute inset-0">
          <DiveGame ref={game} seed={seed} autoStart={false} onEnd={onEnd} copy={copy.game} />
        </div>
        {screen === 'running' ? null : (
          // The dimmed layer covers the whole screen; only Exit sits above it.
          <div className="fixed inset-0 flex items-center justify-center overflow-y-auto bg-ground/80 px-gutter py-20">
            <div ref={panel} className="w-full max-w-110">
              <Panel padded data-dive-screen={screen} className="flex flex-col gap-3">
                {screen === 'start' ? (
                  <>
                    <Heading level={2} role="h3">
                      {copy.name}
                    </Heading>
                    <Text tone="secondary">{copy.start}</Text>
                    <Text tone="secondary" data-dive-hint="">
                      {touch ? copy.touchHint : copy.keysHint}
                    </Text>
                    {bestLine}
                    <div className="mt-3 flex flex-wrap gap-3">
                      <Button data-dive-primary="" onClick={start}>
                        {copy.buttons.start}
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <Heading level={2} role="h3">
                      {screen === 'won' ? copy.won : copy.crashed}
                    </Heading>
                    {result?.clean ? (
                      <Readout kind="status" tone="signal" data-dive-clean="">
                        {copy.clean}
                      </Readout>
                    ) : null}
                    {result ? (
                      <ul className="m-0 flex list-none flex-col gap-1 p-0">
                        <li>
                          <Text tone="secondary">
                            {copy.rings(result.ringsPassed, result.ringsTotal)}
                          </Text>
                        </li>
                        <li>
                          <Text tone="secondary">{copy.lives(result.livesLeft)}</Text>
                        </li>
                      </ul>
                    ) : null}
                    {bestLine}
                    {screen === 'won' ? (
                      <div className="mt-2 flex flex-col gap-2 border-t border-hairline pt-4">
                        <Text data-dive-note="">{copy.note}</Text>
                        {linkedin ? (
                          <TextLink
                            href={linkedin}
                            target="_blank"
                            rel="noopener"
                            className="self-start"
                          >
                            {copy.linkedin}
                          </TextLink>
                        ) : null}
                        <TextLink href={mailto} className="self-start">
                          {copy.email}
                        </TextLink>
                      </div>
                    ) : null}
                    <div className="mt-3 flex flex-wrap gap-3">
                      <Button data-dive-primary="" onClick={again}>
                        {copy.buttons.again}
                      </Button>
                      <Button variant="quiet" onClick={onExit}>
                        {copy.buttons.back}
                      </Button>
                    </div>
                  </>
                )}
              </Panel>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
