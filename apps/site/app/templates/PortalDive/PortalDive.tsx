import {
  type ComponentType,
  type CSSProperties,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';

import {
  bestStore,
  DiveGame,
  type BestResult,
  type BestStore,
  type DiveGameHandle,
  type DiveResult,
} from '@cwc/dive/react';
import {
  Button,
  cx,
  Heading,
  Panel,
  type PortalSpiralProps,
  Readout,
  Text,
  TextLink,
  VisuallyHidden,
} from '@cwc/ui';

import s from './arrival.module.css';
import { diveCopy, type PortalDiveCopy } from './copy';
import type { FarFlockOptions } from './flockSky';
import { type Arrival, Garden } from './Garden';
import {
  type AudioContextFactory,
  type AudioFactory,
  browserAudio,
  browserAudioContext,
  createMusic,
  type Music,
} from './music';
import type { FishJumpOptions } from './pondFish';
import { gardenScene, type GardenScene, sceneVars } from './scene';
import { type SoundStore, soundStore } from './sound';
import { SoundToggle } from './SoundToggle';

type Screen = 'start' | 'running' | 'crashed' | 'won';

/** The garden's image: not asked for yet (before Start), on its way, ready, or failed. */
type SceneState = 'idle' | 'loading' | 'ready' | 'failed';

/** How long the "how to leave" hint stays on screen when the reader sits down. */
const HINT_MS = 6000;
/** How long without pointer or keyboard activity, while resting, before the top bar goes quiet. */
const IDLE_MS = 4000;

export interface PortalDiveProps {
  /** The page's mail link, for the win screen. */
  mailto: string;
  /** The page's LinkedIn link. When given, the win screen leads with it and mail comes second. */
  linkedin?: string;
  /** Leave the game: the Exit and "Back to Contact" buttons, and the portal in the garden. */
  onExit: () => void;
  /** Where the best result is kept. Default: localStorage, falling back to memory. */
  store?: BestStore;
  /** Where the sound choice is kept. Default: localStorage, falling back to memory. */
  sound?: SoundStore;
  /** Makes the music's audio element. Default: `new Audio()`. Stories pass a silent fake. */
  audio?: AudioFactory;
  /** Makes the Web Audio context the music plays through. Default: the browser's. */
  audioContext?: AudioContextFactory;
  /** Seeds the course. Default: a fresh course every run. */
  seed?: number;
  /** Open on an end screen with this result, for stories and visual checks. */
  preview?: DiveResult;
  /**
   * For stories and visual checks, with a won `preview`: hold the end screen until the garden has
   * loaded, then arrive the way a run does (the bloom), instead of showing the card over the
   * tunnel first.
   */
  previewArrival?: boolean;
  /** The garden. Default: the real scene. Stories pass a broken one to show the fallback. */
  scene?: GardenScene;
  /** For stories: the garden counts as ready only once this settles too (a slow image). */
  sceneHold?: Promise<unknown>;
  /**
   * The spiral in the garden's portal: the page's own `PortalSpiral`, passed in by the host. The
   * Contact page already has it; importing it here as well would make the build split it out of
   * the page into a chunk of its own, changing the page's first JavaScript.
   */
  spiral?: ComponentType<PortalSpiralProps>;
  /** The far flock's timing (stories: a pass at once). The page never passes it. */
  flock?: FarFlockOptions;
  /** The far fish jumps' timing (stories: a jump at once). The page never passes it. */
  fish?: FishJumpOptions;
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

/** Typing in a field never toggles the sound. */
function isEditable(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  return target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName);
}

/**
 * The music for as long as the game is on screen: made when the chunk mounts, paused while the
 * tab is hidden, faded out and let go when the overlay closes. Returns the controller (for the
 * Start press, which has to call it inside the click) and whether the track is available.
 */
function useMusic(enabled: boolean, audio: AudioFactory, audioContext: AudioContextFactory) {
  const music = useRef<Music | null>(null);
  const [available, setAvailable] = useState(true);
  const first = useRef({ enabled, audio, audioContext });
  useEffect(() => {
    const m = createMusic({
      enabled: first.current.enabled,
      create: first.current.audio,
      createContext: first.current.audioContext,
      onAvailable: setAvailable,
    });
    music.current = m;
    setAvailable(m.available());
    const onVisibility = () => m.setHidden(document.visibilityState === 'hidden');
    onVisibility();
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      m.dispose({ fade: document.visibilityState !== 'hidden' });
      if (music.current === m) music.current = null;
    };
  }, []);
  return { music, available };
}

/** True from `on` until `ms` without pointer or keyboard activity; any activity resets it. */
function useIdle(on: boolean, ms: number) {
  const [idle, setIdle] = useState(false);
  useEffect(() => {
    if (!on) return;
    let timer = setTimeout(() => setIdle(true), ms);
    const wake = () => {
      setIdle(false);
      clearTimeout(timer);
      timer = setTimeout(() => setIdle(true), ms);
    };
    const events = ['pointermove', 'pointerdown', 'keydown', 'wheel', 'touchstart'] as const;
    for (const type of events) document.addEventListener(type, wake, { passive: true });
    return () => {
      clearTimeout(timer);
      for (const type of events) document.removeEventListener(type, wake);
      setIdle(false);
    };
  }, [on, ms]);
  return on && idle;
}

/**
 * The Portal dive, full size inside the page's overlay: the start screen, the run, and the crash
 * and win screens over the tunnel. A win opens into a garden (once its image has loaded): the
 * tunnel's light blooms and the scene resolves out of it, with the win card on paper over the
 * water. "Sit for a while" leaves the reader in the scene, where the portal is a button back to
 * the Contact page. Loaded only after the reader chooses to enter (it is its own chunk), so the
 * game, the garden and every word of them stay out of the Contact page until then.
 */
export default function PortalDive({
  mailto,
  linkedin,
  onExit,
  store: storeIn,
  sound: soundIn,
  audio = browserAudio,
  audioContext = browserAudioContext,
  seed,
  preview,
  previewArrival = false,
  scene = gardenScene,
  sceneHold,
  spiral,
  flock,
  fish,
  copy = diveCopy,
}: PortalDiveProps) {
  const [store] = useState(() => storeIn ?? bestStore());
  const [screen, setScreen] = useState<Screen>(preview ? preview.status : 'start');
  const [result, setResult] = useState<DiveResult | null>(preview ?? null);
  const [best, setBest] = useState<BestResult | null>(() => store.read());
  const [sound] = useState(() => soundIn ?? soundStore());
  const [soundOn, setSoundOn] = useState(() => sound.read());
  const { music, available } = useMusic(soundOn, audio, audioContext);
  const touch = useSyncExternalStore(subscribePointer, touchFirst, () => false);
  const game = useRef<DiveGameHandle>(null);
  const root = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const gardenRef = useRef<HTMLDivElement>(null);
  // "Dive again" lays a new run out first; it starts once that run exists (after the commit).
  const startNext = useRef(false);
  const [round, setRound] = useState(0);

  // The garden's image is asked for when the run starts (or at once for a preview), never before.
  const [sceneState, setSceneState] = useState<SceneState>(preview ? 'loading' : 'idle');
  const sceneReady = sceneState === 'ready';
  const [arrival, setArrival] = useState<Arrival>('fade');
  const [flare, setFlare] = useState<{ x: number; y: number } | null>(null);
  // A preview that arrives as a run would: the end screen waits for the garden.
  const [holding, setHolding] = useState(previewArrival && preview?.status === 'won');
  const [resting, setResting] = useState(false);
  const [hintShown, setHintShown] = useState(false);

  const garden = screen === 'won' && sceneReady && !holding;
  const quiet = useIdle(garden && resting, IDLE_MS);

  /** Where the tunnel's vanishing point is, in the root's pixels: where the bloom starts. */
  const measureFlare = () => {
    const box = root.current?.getBoundingClientRect();
    const area = stage.current?.getBoundingClientRect();
    if (!box || !area) return null;
    // The tunnel's own layout (`viewportFor` in @cwc/dive): centred, nudged up a little.
    const wall = Math.min(area.width * 0.46, area.height * 0.4);
    return {
      x: area.left - box.left + area.width / 2,
      y: area.top - box.top + area.height / 2 - wall * 0.06,
    };
  };

  // A held preview arrives the moment the garden is ready, as a run that ends then would.
  const holdingRef = useRef(holding);
  const onSceneReady = () => {
    const finish = () => {
      setSceneState((state) => (state === 'loading' ? 'ready' : state));
      if (holdingRef.current) {
        holdingRef.current = false;
        setFlare(measureFlare());
        setArrival('bloom');
        setHolding(false);
      }
    };
    if (sceneHold) void sceneHold.then(finish, finish);
    else finish();
  };
  const onSceneFail = () => {
    setSceneState('failed');
    holdingRef.current = false;
    setHolding(false);
  };

  // Arriving hands the music over to the garden's ambience (or to quiet, without one).
  useEffect(() => {
    if (garden) music.current?.setMood('arrive');
  }, [garden, music]);

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
  }, [screen, round, holding]);

  // Sitting down: the card goes, focus moves to the scene (Tab reaches the portal), and a hint
  // says how to leave for a few seconds.
  useEffect(() => {
    if (!resting) return;
    gardenRef.current?.focus({ preventScroll: true });
    const timer = setTimeout(() => setHintShown(false), HINT_MS);
    return () => clearTimeout(timer);
  }, [resting]);

  const requestScene = () => setSceneState((state) => (state === 'idle' ? 'loading' : state));

  // The music starts inside these presses: they are the gesture browsers ask for before sound.
  const start = () => {
    game.current?.start();
    music.current?.unlock();
    music.current?.setMood('play');
    requestScene();
    setScreen('running');
  };
  const again = () => {
    music.current?.unlock();
    music.current?.setMood('play');
    requestScene();
    setResting(false);
    setHintShown(false);
    startNext.current = true;
    game.current?.restart(seed);
    setResult(null);
    setRound((n) => n + 1);
    setScreen('running');
  };
  const onEnd = (r: DiveResult) => {
    music.current?.setMood('duck');
    setBest(store.record(r));
    setResult(r);
    if (r.status === 'won') {
      // Ready now: the full arrival. Not yet: the card over the tunnel, and a cross-fade later.
      setArrival(sceneReady ? 'bloom' : 'fade');
      setFlare(measureFlare());
    }
    setScreen(r.status);
  };
  const sit = () => {
    setHintShown(true);
    setResting(true);
  };

  const soundOnRef = useRef(soundOn);
  const toggleSound = () => {
    const m = music.current;
    if (!m?.available()) return;
    const next = !soundOnRef.current;
    soundOnRef.current = next;
    sound.write(next);
    m.unlock();
    m.setEnabled(next);
    setSoundOn(next);
  };
  const toggleRef = useRef(toggleSound);
  useEffect(() => {
    toggleRef.current = toggleSound;
  });

  // M toggles the sound while the overlay is open (not while typing, not with a modifier).
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'm' && event.key !== 'M') return;
      if (event.repeat || event.ctrlKey || event.metaKey || event.altKey) return;
      if (isEditable(event.target)) return;
      event.preventDefault();
      toggleRef.current();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  // Over the garden the best line sits on paper, where the quieter label tone would be too faint.
  const bestLine = best ? (
    <Text tone={garden ? 'secondary' : 'label'} data-dive-best="">
      {copy.best(best)}
    </Text>
  ) : null;

  const showCard = screen !== 'running' && !holding && !(garden && resting);
  const hint = touch ? copy.garden.hintTouch : copy.garden.hint;

  return (
    <div
      ref={root}
      className={cx('relative flex h-full flex-col', s.root)}
      style={sceneVars(scene) as CSSProperties}
      data-dive-garden={garden ? (resting ? 'resting' : 'arrived') : undefined}
    >
      <div
        className={cx(
          'relative z-10 flex min-h-16 flex-none items-center justify-end border-b px-gutter',
          garden ? 'border-transparent bg-transparent' : 'border-hairline bg-ground',
        )}
      >
        <div
          className={cx('flex gap-3', garden && s.capsule, garden && s.paper)}
          data-dive-bar=""
          data-arrival={garden ? arrival : undefined}
          data-quiet={quiet ? '' : undefined}
        >
          <SoundToggle
            on={soundOn}
            available={available}
            onToggle={toggleSound}
            copy={copy.sound}
          />
          <Button variant="quiet" data-dive-exit="" onClick={onExit}>
            {copy.buttons.exit}
          </Button>
        </div>
      </div>
      <div
        ref={stage}
        tabIndex={-1}
        className="relative min-h-0 flex-1 outline-none"
        inert={garden}
      >
        <div className="absolute inset-0">
          <DiveGame ref={game} seed={seed} autoStart={false} onEnd={onEnd} copy={copy.game} />
        </div>
      </div>
      {sceneState === 'idle' || sceneState === 'failed' ? null : (
        <Garden
          ref={gardenRef}
          scene={scene}
          alt={copy.garden.alt}
          portalLabel={copy.garden.portal}
          spiral={spiral}
          flock={flock}
          fish={fish}
          shown={garden}
          portalReachable={!showCard}
          arrival={arrival}
          flare={flare}
          onPortal={onExit}
          onReady={onSceneReady}
          onFail={onSceneFail}
        />
      )}
      {showCard ? (
        // Over the tunnel the dimmed layer covers the whole screen; only Exit sits above it. Over
        // the garden there is no dimming: the card sits on paper over the scene. Either way it is
        // centred below the top bar, and a card taller than the space scrolls inside.
        <div
          className={cx(s.overlay, !garden && s.dim)}
          data-arrival={garden ? arrival : undefined}
          data-dive-overlay=""
        >
          <div ref={panel} className={s.slot}>
            <Panel
              padded
              data-dive-screen={screen}
              data-dive-card={garden ? 'garden' : 'tunnel'}
              className={cx('flex flex-col gap-3', s.card, garden && s.paper)}
            >
              {screen === 'start' ? (
                <>
                  <Heading level={2} role="h3">
                    {copy.name}
                  </Heading>
                  <Text tone="secondary">{copy.start}</Text>
                  <Text tone="secondary" data-dive-hint="">
                    {touch ? copy.touchHint : copy.keysHint}
                  </Text>
                  <Text tone="secondary" data-dive-sound-note="">
                    {touch ? copy.soundNoteTouch : copy.soundNote}
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
                  <Heading level={2} role={garden ? 'h2' : 'h3'}>
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
                    {garden ? (
                      <Button variant="quiet" data-dive-sit="" onClick={sit}>
                        {copy.buttons.sit}
                      </Button>
                    ) : null}
                    <Button variant="quiet" onClick={onExit}>
                      {copy.buttons.back}
                    </Button>
                  </div>
                </>
              )}
            </Panel>
          </div>
        </div>
      ) : null}
      {garden ? (
        <>
          <VisuallyHidden role="status" data-dive-rest-status="">
            {resting ? hint : ''}
          </VisuallyHidden>
          {resting ? (
            // Seen only; the status line above is what is read out.
            <p
              className={cx(s.hint, s.paper)}
              aria-hidden="true"
              data-dive-rest-hint=""
              data-visible={hintShown ? '' : undefined}
            >
              <Text as="span" tone="primary">
                {hint}
              </Text>
            </p>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
