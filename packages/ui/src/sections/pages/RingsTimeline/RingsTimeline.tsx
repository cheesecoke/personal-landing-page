import {
  useCallback,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';

import { cx, Heading, Readout, Text, TextLink } from '../../../primitives';
import type { LinkComponent, SectionLink } from '../internal/link';
import styles from './RingsTimeline.module.css';

/** One growth ring traced over the image, in the image's own coordinate space. */
export interface RingGeometry {
  /** The ring as polygon points. */
  points: string;
  /** Where the leader leaves the ring. */
  x: number;
  y: number;
}

/** How the rings sit on the image. It belongs to one image (see `stumpRings`). */
export interface RingsArtGeometry {
  /** The image's coordinate space. */
  viewBox: { width: number; height: number };
  /** The frame the image is cropped into: only the ratio matters. */
  frame: { width: number; height: number };
  /** Where the image sits in the frame, in percent of the frame. */
  crop: { left: number; top: number; width: number; height: number };
  /** The x, in image space, where the frame's right edge falls: leaders end there. */
  edge: number;
  /** The scar on the warm ring, shown with it. */
  scar?: { x: number; y: number; r: number };
  /** The rings, from the centre out. A ring is a year or so; a chapter spans one or more. */
  rings: RingGeometry[];
}

export interface RingsArt extends RingsArtGeometry {
  src: string;
  alt: string;
}

/** One paragraph inside an open chapter. `lead` is the few words set in Bone at its start. */
export interface RingsDetail {
  lead?: ReactNode;
  text: ReactNode;
}

/** The newest line from a chapter's log, shown under its row whether or not it is open. */
export interface RingsLatest {
  /** The readout above the line ("Latest from the log · October 2026"). */
  label: ReactNode;
  text: ReactNode;
  link?: SectionLink;
}

export interface RingsChapter {
  kind?: 'chapter';
  id: string;
  label: ReactNode;
  /** The years readout ("2014–2019"). */
  years?: ReactNode;
  /** The one or two sentences always shown. */
  summary: ReactNode;
  /** Which rings this chapter lights, as indexes into `art.rings`. The leader leaves the last. */
  rings: number[];
  /** `ember` for the one warm chapter. Default `signal`. */
  tone?: 'signal' | 'ember';
  /** `ring` (default), `root` (a dashed ring, the label in italic Hinoki) or `dot` (filled). */
  marker?: 'ring' | 'root' | 'dot';
  /** A dashed rule above: time passed between this chapter and the one before. */
  gapBefore?: boolean;
  /** Shown when the chapter is open. */
  details?: RingsDetail[];
  /** A link at the foot of the open chapter. */
  link?: SectionLink;
  latest?: RingsLatest | null;
}

/** A line between chapters that is not a ring: it cannot be selected. */
export interface RingsNote {
  kind: 'note';
  id: string;
  label: ReactNode;
  years?: ReactNode;
  text: ReactNode;
}

export type RingsItem = RingsChapter | RingsNote;

export interface RingsTimelineProps {
  /** The title above the image. */
  title: ReactNode;
  /** The title's heading level. Default 1: on About it is the page title. */
  headingLevel?: 1 | 2;
  lead?: ReactNode;
  art: RingsArt;
  /** Chapters and notes, oldest first. */
  items: RingsItem[];
  /** The last line of the list, after the newest chapter ("Not yet grown."). */
  ending?: ReactNode;
  /** The chapter selected at first. Default: the last one. */
  defaultSelected?: string;
  /** Whether the selected chapter starts open. Default `true`. */
  defaultOpen?: boolean;
  /** The element or component for links. Default `a`. It receives `href`. */
  linkAs?: LinkComponent;
  className?: string;
}

interface Geo {
  x0: number;
  y0: number;
  ex: number;
  my: number;
}

const isChapter = (item: RingsItem): item is RingsChapter => item.kind !== 'note';
const pct = (value: number) => `${value}%`;
/** "Digital Arts, BA" + ", 2013." joins without a space; a sentence after a lead gets one. */
const startsWithPunctuation = (text: ReactNode) => typeof text === 'string' && /^[,.;:]/.test(text);

/**
 * The About chapters as growth rings. Selecting a chapter lights its rings on the image and opens
 * its details; a dotted connector runs from the lit leader's end to the chapter's marker.
 */
export function RingsTimeline({
  title,
  headingLevel = 1,
  lead,
  art,
  items,
  ending,
  defaultSelected,
  defaultOpen = true,
  linkAs,
  className,
}: RingsTimelineProps) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const chapters = items.filter(isChapter);
  const [selected, setSelected] = useState(defaultSelected ?? chapters[chapters.length - 1]?.id);
  const [open, setOpen] = useState(defaultOpen);
  const [geo, setGeo] = useState<Record<string, Geo>>({});
  const geoKey = useRef('');
  const ringsRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLDivElement>(null);

  // Measure the lit leader's end and each chapter's marker, in px relative to the grid.
  const measure = useCallback(() => {
    const grid = ringsRef.current;
    const img = imgRef.current;
    if (!grid || !img) return;
    const gridBox = grid.getBoundingClientRect();
    const imgBox = img.getBoundingClientRect();
    const next: Record<string, Geo> = {};
    grid.querySelectorAll<HTMLElement>('[data-ring-marker]').forEach((marker) => {
      const id = marker.dataset.ringMarker ?? '';
      const line = img.querySelector(`[data-ring-leader="${CSS.escape(id)}"] line`);
      if (!line) return;
      const lineBox = line.getBoundingClientRect();
      const markerBox = marker.getBoundingClientRect();
      next[id] = {
        x0: Math.round(Math.min(lineBox.right, imgBox.right) - gridBox.left) + 0.5,
        y0: Math.round(lineBox.top + lineBox.height / 2 - gridBox.top) + 0.5,
        // End at the marker's visible edge: its box, plus the 4px ring a selected dot draws
        // (a box-shadow, which the box does not include).
        ex: markerBox.left - (marker.dataset.ringMarkerKind === 'dot' ? 4 : 0) - gridBox.left,
        my: markerBox.top + markerBox.height / 2 - gridBox.top,
      };
    });
    const key = JSON.stringify(next);
    if (key !== geoKey.current) {
      geoKey.current = key;
      setGeo(next);
    }
  }, []);

  // Re-measure after every render (a chapter opening moves the markers below it).
  useLayoutEffect(() => {
    measure();
  });

  useLayoutEffect(() => {
    const grid = ringsRef.current;
    window.addEventListener('resize', measure);
    const observer = typeof ResizeObserver === 'function' ? new ResizeObserver(measure) : null;
    if (grid) observer?.observe(grid);
    void document.fonts?.ready.then(measure);
    return () => {
      window.removeEventListener('resize', measure);
      observer?.disconnect();
    };
  }, [measure]);

  const pick = (id: string) => {
    if (id === selected) setOpen((value) => !value);
    else {
      setSelected(id);
      setOpen(true);
    }
  };

  const current = chapters.find((chapter) => chapter.id === selected);
  const artStyle = {
    '--art-left': pct(art.crop.left),
    '--art-top': pct(art.crop.top),
    '--art-width': pct(art.crop.width),
    '--art-height': pct(art.crop.height),
  } as CSSProperties;
  const emberRing = (index: number) =>
    chapters.some((chapter) => chapter.tone === 'ember' && chapter.rings.includes(index));

  return (
    <div className={cx(styles.root, className)}>
      <div ref={ringsRef} className={styles.rings}>
        <header className={styles.head}>
          <Heading level={headingLevel} role="h1">
            {title}
          </Heading>
          {lead ? (
            <Text role="lead" className={styles.lead}>
              {lead}
            </Text>
          ) : null}
        </header>

        <div
          ref={imgRef}
          className={styles.img}
          style={{ aspectRatio: `${art.frame.width} / ${art.frame.height}`, ...artStyle }}
        >
          <div className={styles.imgClip}>
            <img src={art.src} alt={art.alt} className={styles.art} />
          </div>
          <div aria-hidden="true" className={styles.overlay}>
            <svg
              viewBox={`0 0 ${art.viewBox.width} ${art.viewBox.height}`}
              preserveAspectRatio="none"
              className={cx(styles.art, styles.artSvg)}
            >
              {art.rings.map((ring, index) => (
                <polygon
                  key={index}
                  points={ring.points}
                  vectorEffect="non-scaling-stroke"
                  className={cx(
                    styles.lit,
                    emberRing(index) && styles.litEmber,
                    current?.rings.includes(index) && styles.on,
                  )}
                />
              ))}
              {chapters.map((chapter) => {
                const ring = art.rings[chapter.rings[chapter.rings.length - 1] ?? -1];
                if (!ring) return null;
                return (
                  <g
                    key={chapter.id}
                    data-ring-leader={chapter.id}
                    className={cx(
                      styles.leader,
                      chapter.tone === 'ember' && styles.leaderEmber,
                      chapter.id === selected && styles.leaderOn,
                    )}
                  >
                    <line
                      x1={ring.x}
                      y1={ring.y}
                      x2={art.edge}
                      y2={ring.y}
                      strokeWidth={1}
                      vectorEffect="non-scaling-stroke"
                    />
                    <circle
                      cx={ring.x}
                      cy={ring.y}
                      r={9}
                      vectorEffect="non-scaling-stroke"
                      className={styles.leaderDot}
                    />
                  </g>
                );
              })}
              {art.scar ? (
                <circle
                  cx={art.scar.x}
                  cy={art.scar.y}
                  r={art.scar.r}
                  className={cx(
                    styles.lit,
                    styles.litEmber,
                    styles.scar,
                    current?.tone === 'ember' && styles.on,
                  )}
                />
              ) : null}
            </svg>
          </div>
        </div>

        <svg aria-hidden="true" data-ring-connectors="" className={styles.connector}>
          {chapters.map((chapter) => {
            const g = geo[chapter.id];
            if (!g) return null;
            const d = `M${g.x0} ${g.y0} V${g.my} H${g.ex}`;
            const maskId = `${uid}-cn-${chapter.id}`;
            const on = chapter.id === selected;
            return (
              <g
                key={chapter.id}
                data-ring-connector={chapter.id}
                data-on={on ? '' : undefined}
                className={cx(
                  styles.connectorGroup,
                  chapter.tone === 'ember' && styles.connectorEmber,
                  on && styles.connectorOn,
                )}
              >
                <mask id={maskId} maskUnits="userSpaceOnUse" x="0" y="0" width="100%" height="100%">
                  <path d={d} pathLength={1} className={styles.connectorDraw} />
                </mask>
                <path d={d} mask={`url(#${maskId})`} className={styles.connectorPath} />
                <circle cx={g.x0} cy={g.y0} r={3} className={styles.connectorDot} />
              </g>
            );
          })}
        </svg>

        <ol className={styles.list}>
          {items.map((item) => {
            if (!isChapter(item)) {
              return (
                <li key={item.id} className={styles.itemGap}>
                  <div className={styles.note}>
                    <span aria-hidden="true" className={styles.noteMark} />
                    <span className={styles.rowText}>
                      <span className={styles.rowTop}>
                        <span className={cx(styles.noteLabel, styles.italic)}>{item.label}</span>
                        {item.years ? (
                          <Readout kind="status" tone="label" className={styles.years}>
                            {item.years}
                          </Readout>
                        ) : null}
                      </span>
                      <span className={cx(styles.small, styles.italic)}>{item.text}</span>
                    </span>
                  </div>
                </li>
              );
            }

            const on = item.id === selected;
            const expanded = on && open;
            const ember = item.tone === 'ember';
            const marker = item.marker ?? 'ring';
            const deepId = `${uid}-deep-${item.id}`;
            const hasDeep = Boolean(item.details?.length || item.link);
            return (
              <li key={item.id} className={item.gapBefore ? styles.itemGap : styles.item}>
                <button
                  type="button"
                  className={styles.row}
                  aria-expanded={hasDeep ? expanded : undefined}
                  aria-controls={hasDeep && expanded ? deepId : undefined}
                  aria-pressed={hasDeep ? undefined : on}
                  onClick={() => pick(item.id)}
                >
                  <span
                    aria-hidden="true"
                    data-ring-marker={item.id}
                    data-ring-marker-kind={marker}
                    className={cx(
                      styles.marker,
                      marker === 'root' && styles.markerRoot,
                      marker === 'dot' && styles.markerDot,
                      marker === 'dot' && ember && styles.markerDotEmber,
                      on && styles.markerOn,
                    )}
                  />
                  <span className={styles.rowText}>
                    <span className={styles.rowTop}>
                      <span
                        className={cx(
                          'type-h3',
                          styles.label,
                          marker === 'root' && styles.labelRoot,
                          marker === 'root' && styles.italic,
                          on && (ember ? styles.labelOnEmber : styles.labelOn),
                        )}
                      >
                        {item.label}
                      </span>
                      {item.years ? (
                        <Readout kind="status" tone="label" className={styles.years}>
                          {item.years}
                        </Readout>
                      ) : null}
                    </span>
                    <span className={cx(styles.small, marker === 'root' && styles.italic)}>
                      {item.summary}
                    </span>
                  </span>
                </button>
                {item.latest ? (
                  <div className={styles.latest}>
                    <Readout kind="status" tone="label" className={styles.latestLabel}>
                      <span aria-hidden="true" className={styles.latestDot} />
                      {item.latest.label}
                    </Readout>
                    <span className={cx(styles.small, styles.latestText)}>{item.latest.text}</span>
                    {item.latest.link ? (
                      <TextLink
                        as={linkAs}
                        href={item.latest.link.href}
                        arrow="md"
                        className={styles.deepLink}
                      >
                        {item.latest.link.label}
                      </TextLink>
                    ) : null}
                  </div>
                ) : null}
                {hasDeep && expanded ? (
                  <div id={deepId} className={styles.deep}>
                    {item.details?.map((detail, index) => (
                      <p key={index} className={cx(styles.small, styles.deepText)}>
                        {detail.lead ? <b>{detail.lead}</b> : null}
                        {detail.lead && !startsWithPunctuation(detail.text) ? ' ' : null}
                        {detail.text}
                      </p>
                    ))}
                    {item.link ? (
                      <TextLink
                        as={linkAs}
                        href={item.link.href}
                        arrow="md"
                        className={styles.deepLink}
                      >
                        {item.link.label}
                      </TextLink>
                    ) : null}
                  </div>
                ) : null}
              </li>
            );
          })}
          {ending ? (
            <li className={styles.itemEnd}>
              <div className={styles.end}>
                <span aria-hidden="true" className={styles.endMark}>
                  <span className={styles.endDot} />
                </span>
                <span className={cx(styles.small, styles.endText)}>{ending}</span>
              </div>
            </li>
          ) : null}
        </ol>
      </div>
    </div>
  );
}
