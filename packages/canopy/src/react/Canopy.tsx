import {
  type CSSProperties,
  type MouseEvent,
  type ReactNode,
  type Ref,
  useCallback,
  useEffect,
  useId,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';

import type { CanopyColors } from '../core/colors';
import type { CanopyHandle, CanopyMode, CanopyOptions, CanopySelection } from '../core/engine';
import { buildIndex, type IndexedNode, listRows, openShoots, statusTone } from '../core/tree';
import { type CanopyCopy, defaultCanopyCopy } from '../data/copy';
import { defaultCanopyData } from '../data/default';
import type { CanopyData, CanopyFresh, CanopyShootState, CanopyVariant } from '../types';
import s from './Canopy.module.css';
import { CanopyFlat } from './CanopyFlat';

export interface CanopyLinkProps {
  href: string;
  className?: string;
  children: ReactNode;
}

export interface CanopyRef {
  /** Open a project. */
  focus: (id: string) => void;
  /** Back to the whole tree. */
  reset: () => void;
  /** Open the shoot's project and draw the shoot solid. Ends in the `grown` state. */
  grow: (shootId: string) => void;
  /** The live stage, once it has loaded. `null` before that and in the flat drawing. */
  stage: () => CanopyHandle | null;
}

export interface CanopyProps {
  /** `teaser`: the picture only, for Home. `full`: the list, the stage and the project card. */
  variant: CanopyVariant;
  /** The tree to draw. Shoot `state` may change between renders; the stage animates the change. */
  data?: CanopyData;
  copy?: CanopyCopy;
  /**
   * Stage height on wide screens. Default 800px (`full`) or 460px (`teaser`). The full tree grows
   * past it when its list is longer, so the list and the key hints under it are never cut off.
   */
  height?: number | string;
  /** Render the card's link with the app's router. Left out, a plain `<a>` is used. */
  renderLink?: (props: CanopyLinkProps) => ReactNode;
  /** Called when the plain link is followed; call `event.preventDefault()` to route in the app. */
  onNavigate?: (href: string, event: MouseEvent<HTMLAnchorElement>) => void;
  /** The grow-in: once per browser session (default), every mount, or never. */
  intro?: 'once' | 'always' | 'never';
  /** Final state, no easing. Default: the OS setting or `[data-motion="reduce"]` on the root. */
  reducedMotion?: boolean;
  /** Never load three.js: show the flat drawing. */
  flat?: boolean;
  colors?: Partial<CanopyColors>;
  /** Passed to the stage: `forceStatic` (2D canvas drawing) and `watchdog`. */
  stage?: Pick<CanopyOptions, 'forceStatic' | 'watchdog'>;
  /** Called when the live stage has mounted, and with `null` when it is torn down. */
  onStage?: (handle: CanopyHandle | null) => void;
  className?: string;
  ref?: Ref<CanopyRef>;
}

const INTRO_KEY = 'cwc:canopy-grown';
const NONE: CanopySelection = { active: null, hover: null, hoverShoot: null, pinShoot: null };
const cx = (...names: (string | false | null | undefined)[]) => names.filter(Boolean).join(' ');

const REDUCE = '(prefers-reduced-motion: reduce)';
const media = (query: string) =>
  typeof window.matchMedia === 'function' ? window.matchMedia(query) : null;

function subscribeMotion(onChange: () => void) {
  const mq = media(REDUCE);
  mq?.addEventListener('change', onChange);
  const mo = new MutationObserver(onChange);
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-motion'] });
  return () => {
    mq?.removeEventListener('change', onChange);
    mo.disconnect();
  };
}
const motionReduced = () =>
  document.documentElement.dataset.motion === 'reduce' || !!media(REDUCE)?.matches;

function introPlayed() {
  try {
    return window.sessionStorage.getItem(INTRO_KEY) === '1';
  } catch {
    return false;
  }
}
function markIntroPlayed() {
  try {
    window.sessionStorage.setItem(INTRO_KEY, '1');
  } catch {
    /* storage is blocked: the grow-in simply plays again */
  }
}

/** Everything about the tree except shoot states: when this changes the stage is rebuilt. */
function shapeOf(data: CanopyData) {
  return JSON.stringify({
    ...data,
    nodes: data.nodes.map((n) => ({
      ...n,
      shoots: (n.shoots ?? []).filter((x) => x.state !== 'dropped').map((x) => [x.id, x.label]),
    })),
  });
}

function FreshRing({ fresh }: { fresh: CanopyFresh }) {
  return (
    <svg viewBox="0 0 14 14" aria-hidden="true" focusable="false">
      <circle cx="7" cy="7" r="6" fill="none" stroke="var(--fresh-track)" strokeWidth="1" />
      <circle
        cx="7"
        cy="7"
        r="6"
        fill="none"
        stroke="var(--fresh-ring)"
        strokeWidth="1.3"
        strokeLinecap="round"
        pathLength={100}
        strokeDasharray={`${Math.max(4, Math.round(fresh.left * 100))} 100`}
        transform="rotate(-90 7 7)"
      />
    </svg>
  );
}
const isFresh = (f: CanopyFresh | null | undefined): f is CanopyFresh => !!f && f.left > 0;

/**
 * The canopy: a tree of projects grown from one stump.
 *
 * The page renders without three.js: the list, the card and its links are plain markup and work on
 * their own, so they are the keyboard path through the tree. The 3D stage is a separate chunk,
 * loaded after mount, never during pre-render.
 */
export function Canopy({
  variant,
  data = defaultCanopyData,
  copy = defaultCanopyCopy,
  height,
  renderLink,
  onNavigate,
  intro = 'once',
  reducedMotion,
  flat = false,
  colors,
  stage,
  onStage,
  className,
  ref,
}: CanopyProps) {
  const full = variant === 'full';
  const rootRef = useRef<HTMLDivElement>(null);
  const hostRef = useRef<HTMLDivElement>(null);
  const headRef = useRef<HTMLDivElement>(null);
  const keyRef = useRef<HTMLUListElement>(null);
  const cardRef = useRef<HTMLElement>(null);
  const headId = useId();

  const index = useMemo(() => buildIndex(data), [data]);
  const rows = useMemo(() => listRows(index, data), [index, data]);
  const shape = useMemo(() => shapeOf(data), [data]);
  const systemReduced = useSyncExternalStore(subscribeMotion, motionReduced, () => false);
  const reduced = reducedMotion ?? systemReduced;

  const [selection, setSelection] = useState<CanopySelection>(NONE);
  const [width, setWidth] = useState(0);
  const [status, setStatus] = useState<'loading' | 'ready' | 'failed'>('loading');
  const [mode, setMode] = useState<CanopyMode | null>(null);
  /* the live stage, once its chunk has loaded */
  const [handle, setHandle] = useState<CanopyHandle | null>(null);
  const narrow = width > 0 && width < 761;

  /* The latest props, for the stage's callbacks: changing them must not rebuild the stage. */
  const live = useRef({ data, colors, copy, onStage });
  useEffect(() => {
    live.current = { data, colors, copy, onStage };
  });

  useEffect(() => {
    const el = rootRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(() => setWidth(Math.round(el.clientWidth)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  /* ---------- the stage: its own chunk, client only ---------- */
  const forceStatic = stage?.forceStatic;
  const watchdog = stage?.watchdog;
  useEffect(() => {
    const host = hostRef.current;
    if (flat || !host) return;
    let cancelled = false;
    let mounted: CanopyHandle | null = null;
    import('../core')
      .then(({ mountCanopy }) => {
        if (cancelled) return;
        const now = live.current;
        mounted = mountCanopy(host, {
          data: now.data,
          variant,
          colors: now.colors,
          container: rootRef.current ?? undefined,
          reducedMotion: reduced,
          intro: intro === 'always' || (intro === 'once' && !introPlayed()),
          forceStatic,
          watchdog,
          ui: {
            head: () => headRef.current,
            obstacles: () => [
              ...(headRef.current ? Array.from(headRef.current.children) : []),
              ...(keyRef.current ? [keyRef.current] : []),
            ],
            card: () => cardRef.current,
          },
          zoomHint: (mac) => live.current.copy.zoomHint(mac),
          onChange: setSelection,
          onMode: setMode,
          onIntroStart: markIntroPlayed,
        });
        setHandle(mounted);
        setStatus('ready');
        live.current.onStage?.(mounted);
      })
      .catch(() => {
        /* the chunk did not load, or the stage could not start here: fall back to the drawing */
        if (cancelled) return;
        host.replaceChildren();
        setStatus('failed');
      });
    return () => {
      cancelled = true;
      if (mounted) {
        mounted.destroy();
        setHandle(null);
        live.current.onStage?.(null);
      }
    };
    // `shape` stands in for `data`: shoot states alone do not rebuild the stage.
  }, [shape, variant, reduced, intro, flat, forceStatic, watchdog]);

  /* shoot states are props: the stage animates open -> grown and open -> answered */
  useEffect(() => {
    if (!handle) return;
    const states: Record<string, CanopyShootState> = {};
    for (const n of data.nodes) for (const shoot of n.shoots ?? []) states[shoot.id] = shoot.state;
    handle.setShootStates(states);
  }, [data, handle]);

  /* the card covers part of the stage: re-frame the tree in what is left */
  const active = full ? selection.active : null;
  useEffect(() => {
    handle?.relayout();
  }, [handle, active, width]);

  const pinned = selection.pinShoot?.i;
  useEffect(() => {
    if (pinned == null) return;
    cardRef.current
      ?.querySelector(`[data-shoot="${pinned}"]`)
      ?.scrollIntoView({ block: 'nearest', behavior: 'auto' });
  }, [pinned]);

  /* Without the stage the list still opens cards: selection then lives here alone. */
  const focus = useCallback(
    (id: string) => {
      if (handle) handle.focus(id);
      else setSelection({ ...NONE, active: id });
    },
    [handle],
  );
  const reset = useCallback(() => {
    if (handle) handle.reset();
    else setSelection(NONE);
  }, [handle]);
  const preview = (id: string | null) => {
    if (handle) handle.preview(id);
    else setSelection((cur) => (cur.hover === id ? cur : { ...cur, hover: id }));
  };
  const hoverShoot = (i: number | null) => handle?.hoverShoot(i);
  const pinShoot = (i: number) => handle?.pinShoot(i);

  useImperativeHandle(
    ref,
    () => ({
      focus,
      reset,
      grow: (shootId) => handle?.grow(shootId),
      stage: () => handle,
    }),
    [focus, reset, handle],
  );

  const node = active ? index.byId[active] : undefined;
  /*
   * Esc goes back to the whole tree. Heard on the document while a project is open, not on the
   * tree itself: after a click on the stage, or on a list row in Safari (which does not focus a
   * clicked button), the focus is not inside the tree and it would never hear the key.
   */
  useEffect(() => {
    if (!full || !active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') reset();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [full, active, reset]);

  function row({ id, depth }: { id: string; depth: number }) {
    const n = index.byId[id]!;
    const open = openShoots(n);
    const isStart = n.start >= 0;
    const fresh = isFresh(n.fresh) ? n.fresh : null;
    return (
      <button
        key={id}
        type="button"
        className={cx(
          s.row,
          depth === 1 && s.d1,
          depth === 2 && s.d2,
          isStart && s.start,
          selection.hover === id && active !== id && s.hov,
        )}
        data-id={id}
        aria-pressed={active === id}
        onClick={() => (active === id && narrow ? reset() : focus(id))}
        onMouseEnter={() => !narrow && preview(id)}
        onMouseLeave={() => preview(null)}
        onFocus={() => !narrow && preview(id)}
        onBlur={() => preview(null)}
      >
        <span className={s.nm}>{n.label}</span>
        {isStart && (
          <span className={s.st}>
            <i className={cx(s.sdot, s[statusTone(n)])}>{fresh && <FreshRing fresh={fresh} />}</i>
            {n.status}
            {fresh && <span className={s.nw}>{fresh.label}</span>}
          </span>
        )}
        {!isStart && fresh && <span className={cx(s.nw, s.solo)}>{fresh.label}</span>}
        {open > 0 && (
          <span className={s.ug} title={copy.shootCount(open)}>
            <span className={s.sr}>, {copy.shootCount(open)}</span>
            <span aria-hidden="true">{open}</span>
          </span>
        )}
      </button>
    );
  }

  function relation(name: string, items: { id: string; title?: string }[]) {
    if (!items.length) return null;
    return (
      <>
        <span>{name}</span>
        <div>
          {items.map((it) => (
            <button
              key={it.id}
              type="button"
              title={it.title}
              onClick={() => focus(it.id)}
              onMouseEnter={() => !narrow && preview(it.id)}
              onMouseLeave={() => preview(null)}
            >
              {index.byId[it.id]!.label}
            </button>
          ))}
        </div>
      </>
    );
  }

  function card(n: IndexedNode) {
    const parent = n.parent ? index.byId[n.parent] : undefined;
    const openText = n.open ?? (n.page === false && parent ? copy.openIn(parent.label) : copy.open);
    const linkBody = (
      <>
        {openText}
        <span className={s.href}>{n.href}</span>
      </>
    );
    const cur = selection.hoverShoot;
    const fresh = isFresh(n.fresh) ? n.fresh : null;
    const open = openShoots(n);
    const hasRel = !!parent || n.children.length || n.flowsOut.length || n.flowsIn.length;
    return (
      <aside ref={cardRef} className={s.card} aria-label={copy.cardLabel} data-canopy-card={n.id}>
        <p className={s.kind}>{copy.kinds[n.kind]}</p>
        <h3>{n.label}</h3>
        <p className={s.st}>
          <i className={cx(s.sdot, s[statusTone(n)])} />
          {n.status}
          {fresh && <span className={s.nw}>{fresh.label}</span>}
        </p>
        <p className={s.one}>{n.oneLine}</p>
        {renderLink ? (
          renderLink({ href: n.href, className: s.open, children: linkBody })
        ) : (
          <a
            className={s.open}
            href={n.href}
            onClick={onNavigate ? (e) => onNavigate(n.href, e) : undefined}
          >
            {linkBody}
          </a>
        )}
        {n.shoots.length > 0 && (
          <section className={s.ugs} aria-label={copy.shoots}>
            <h4>
              {copy.shoots} <span className={s.n}>{open}</span>
            </h4>
            <ul>
              {n.shoots.map((shoot, i) => (
                <li key={shoot.id}>
                  <button
                    type="button"
                    className={cx(
                      s.shoot,
                      shoot.state === 'grown' && s.grown,
                      shoot.state === 'answered' && s.answered,
                      cur && cur.id === n.id && cur.i === i && s.hov,
                    )}
                    data-shoot={i}
                    data-shoot-state={shoot.state}
                    aria-pressed={selection.pinShoot?.id === n.id && selection.pinShoot.i === i}
                    onClick={() => pinShoot(i)}
                    onMouseEnter={() => hoverShoot(i)}
                    onMouseLeave={() => hoverShoot(null)}
                    onFocus={() => hoverShoot(i)}
                    onBlur={() => hoverShoot(null)}
                  >
                    <b>
                      {shoot.label}
                      {shoot.state === 'grown' && (
                        <span className={s.state}>{copy.shootStates.grown}</span>
                      )}
                      {shoot.state === 'answered' && (
                        <span className={s.state}>{copy.shootStates.answered}</span>
                      )}
                    </b>
                    {shoot.note && <span className={s.text}>{shoot.note}</span>}
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}
        {hasRel ? (
          <div className={s.rel}>
            {parent && relation(copy.relations.partOf, [{ id: parent.id }])}
            {relation(
              copy.relations.inside,
              n.children.map((id) => ({ id })),
            )}
            {relation(
              copy.relations.feeds,
              n.flowsOut.map((f) => ({ id: f.to, title: f.label })),
            )}
            {relation(
              copy.relations.fedBy,
              n.flowsIn.map((f) => ({ id: f.from, title: f.label })),
            )}
          </div>
        ) : null}
        <button type="button" className={s.back} onClick={reset}>
          {copy.back}
        </button>
      </aside>
    );
  }

  const style = (
    height == null
      ? undefined
      : { '--canopy-height': typeof height === 'number' ? `${height}px` : height }
  ) as CSSProperties | undefined;
  const showFlat = flat || status === 'failed';
  const Stage = full ? 'section' : 'div';
  const drawing = <CanopyFlat data={data} variant={variant} colors={colors} />;
  const announce = node
    ? `${node.label}. ${node.status}.${openShoots(node) ? ` ${copy.shootCount(openShoots(node))}.` : ''}`
    : selection === NONE
      ? ''
      : copy.wholeTree;

  return (
    <div
      ref={rootRef}
      className={cx(s.root, full ? s.full : s.teaser, className)}
      style={style}
      data-canopy={variant}
      data-canopy-mode={showFlat ? 'flat' : (mode ?? 'loading')}
    >
      <Stage
        className={s.stage}
        role={full ? undefined : 'img'}
        aria-labelledby={full ? headId : undefined}
        aria-label={full ? undefined : copy.stageLabel}
      >
        <div ref={hostRef} className={s.view} />
        {showFlat ? drawing : <noscript>{drawing}</noscript>}
        {full && (
          <>
            <div ref={headRef} className={s.head}>
              <h2 id={headId}>{copy.headline}</h2>
              <p>{copy.hint}</p>
            </div>
            <p className={s.sr}>{copy.stageLabel}</p>
            <ul ref={keyRef} className={s.key} aria-hidden="true">
              <li>
                <i className={s.mark}>
                  <svg viewBox="0 0 26 26" aria-hidden="true" focusable="false">
                    <circle
                      cx="13"
                      cy="13"
                      r="11.5"
                      fill="none"
                      stroke="var(--palette-cedar)"
                      strokeOpacity="0.65"
                      strokeWidth="1.2"
                    />
                    <circle
                      cx="13"
                      cy="13"
                      r="7"
                      fill="none"
                      stroke="var(--palette-hinoki)"
                      strokeOpacity="0.55"
                      strokeWidth="1.1"
                    />
                    <circle
                      cx="13"
                      cy="13"
                      r="11.5"
                      pathLength={100}
                      strokeDasharray="25 100"
                      transform="rotate(-90 13 13)"
                      fill="none"
                      stroke="var(--palette-signal)"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                    <circle cx="13" cy="13" r="2.1" fill="var(--palette-bone)" />
                  </svg>
                </i>
                {copy.legend.start}
              </li>
              <li>
                <i className={s.dash} />
                {copy.legend.shoot}
              </li>
              <li>
                <i />
                {copy.legend.flow}
              </li>
            </ul>
            {status === 'failed' && <p className={s.nogl}>{copy.noTree}</p>}
          </>
        )}
      </Stage>
      {full && (
        <nav className={s.rail} aria-label={copy.listLabel}>
          <p className={s.lede}>
            <b>{copy.count(index.ids.length)}</b> {copy.lede}
          </p>
          <div className={s.list}>
            <h3 className={s.sec}>{copy.startHeading}</h3>
            {rows.start.map(row)}
            <h3 className={cx(s.sec, s.more)}>{copy.moreHeading}</h3>
            {rows.more.map(row)}
          </div>
          <p className={s.keys}>{copy.keys}</p>
        </nav>
      )}
      {full && node && card(node)}
      {full && (
        <p className={s.sr} aria-live="polite">
          {announce}
        </p>
      )}
    </div>
  );
}
