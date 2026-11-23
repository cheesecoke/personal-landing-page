import { Fragment, useId, useRef, type CSSProperties, type ReactNode } from 'react';

import { Container, type LinkComponent } from '../../../layout';
import {
  ArrowIcon,
  Button,
  cx,
  Heading,
  Label,
  Picture,
  StatusDot,
  Text,
  type PictureSource,
  type Status,
} from '../../../primitives';
import { ArCallout, type ArCalloutTone } from './ArCallout';
import { stumpScene, type SceneEllipse, type ScenePoint, type StumpScene } from './scene';
import styles from './StumpHero.module.css';
import { useHeadlineLine } from './useHeadlineLine';

export interface StumpHeroImage {
  src: string;
  width: number;
  height: number;
  /** Smaller modern formats of the same image (AVIF), best first. `src` is the fallback. */
  sources?: readonly PictureSource[];
}

/** A project on the stump: a floating node on the wide render, a row in the list on a phone. */
export interface StumpHeroProject {
  name: string;
  /** The status word, from data ("Daily use", "In build"). */
  status: string;
  /** Which dot the phone list shows beside the status word. */
  dot: Status;
  href: string;
}

/** A ring on the cut face with a callout: a stretch of time, not a project. */
export interface StumpHeroRing {
  name: string;
  /** The readout under the name ("Now", "2022–24"). */
  detail: string;
  tone: ArCalloutTone;
}

export interface StumpHeroAction {
  label: string;
  href: string;
}

export interface StumpHeroProps {
  /** The small line above the headline. */
  eyebrow: string;
  /** The headline, one string per line. */
  headline: readonly string[];
  /**
   * The end of the last line that the thin Signal line sits under ("growing."). The line runs
   * from just before it to just past its full stop. Leave it out for no line.
   */
  underline?: string;
  /** The sentence under the headline. */
  lead: string;
  /** The Bone button. */
  primaryAction?: StumpHeroAction;
  /** The quiet button beside it. */
  secondaryAction?: StumpHeroAction;
  /** The wide render (2400 by 1500 on the board). Decorative there: the callouts carry meaning. */
  image: StumpHeroImage;
  /** The same frame with the rings lit, cross-faded over the wide render: the breath. */
  litImage?: StumpHeroImage;
  /** The phone render (1170 by 1400 on the board), shown under 900px with its description. */
  phoneImage: StumpHeroImage & { alt: string };
  /** The projects on the stump, paired with the scene's nodes in order. */
  projects: readonly StumpHeroProject[];
  /** The ring callouts, paired with the scene's rings in order. */
  rings?: readonly StumpHeroRing[];
  /** Accessible name of the phone list of projects. */
  projectsLabel: string;
  /** The overlay geometry. Default: the scene for the board's renders. */
  scene?: StumpScene;
  /** A header drawn inside the hero, over the stump (the board puts the site nav here). */
  nav?: ReactNode;
  /** The element or component for the links. Default `a`. It receives `href`. */
  linkAs?: LinkComponent;
  className?: string;
}

/** A delay in milliseconds, as the custom property the overlay's animations read. */
/*
 * The hero swaps its wide stump for the phone one when its container is under 900px. The
 * container is the page width less any scrollbar, so these viewport queries are the widths at
 * which one layout is certainly hidden; its images are then not fetched at all.
 */
const WIDE_HIDDEN = '(max-width: 899.98px)';
const PHONE_HIDDEN = '(min-width: 920px)';

const delay = (ms: number) => ({ '--ar-delay': `${ms}ms` }) as CSSProperties;
const percent = (value: number, total: number) => `${((value / total) * 100).toFixed(3)}%`;
const at = (point: ScenePoint, scene: { width: number; height: number }): CSSProperties => ({
  left: percent(point[0], scene.width),
  top: percent(point[1], scene.height),
});
const ellipse = ({ cx: x, cy: y, rx, ry }: SceneEllipse) => ({ cx: x, cy: y, rx, ry });

/**
 * The Home hero. The headline and two actions sit left; the stump render sits right with its AR
 * overlay: project nodes that hover over the rings they grew from, and callouts on two rings. The
 * lines draw, then their marks fade in; the render breathes. Under 900px the phone render takes
 * over and the projects become a list.
 *
 * To run the stump behind a header that sits above the hero, set `--stump-hero-lift` to that
 * header's height on an ancestor (or pass the header as `nav`).
 */
export function StumpHero({
  eyebrow,
  headline,
  underline,
  lead,
  primaryAction,
  secondaryAction,
  image,
  litImage,
  phoneImage,
  projects,
  rings = [],
  projectsLabel,
  scene = stumpScene,
  nav,
  linkAs,
  className,
}: StumpHeroProps) {
  const titleId = useId();
  const heroRef = useRef<HTMLElement>(null);
  const startRef = useRef<HTMLSpanElement>(null);
  const endRef = useRef<HTMLSpanElement>(null);
  const line = useHeadlineLine(heroRef, startRef, endRef);
  const Link = linkAs ?? 'a';

  const { wide, phone } = scene;
  const nodes = wide.nodes.slice(0, projects.length);
  const wideRings = wide.rings.slice(0, rings.length);
  const phoneNodes = phone.nodes.slice(0, projects.length);
  const phoneRings = phone.rings.slice(0, rings.length);

  const last = headline.length - 1;
  const lastLine = headline[last] ?? '';
  const marked = underline && lastLine.endsWith(underline) ? underline : undefined;

  return (
    <div className={cx(styles.frame, className)}>
      <section ref={heroRef} aria-labelledby={titleId} className={styles.hero}>
        <div aria-hidden="true" className={styles.wide}>
          <div className={styles.stage} style={{ aspectRatio: `${wide.width} / ${wide.height}` }}>
            <Picture sources={image.sources} skipWhen={WIDE_HIDDEN}>
              <img
                src={image.src}
                width={image.width}
                height={image.height}
                alt=""
                className={styles.fill}
              />
            </Picture>
            {litImage ? (
              <Picture sources={litImage.sources} skipWhen={WIDE_HIDDEN}>
                <img
                  src={litImage.src}
                  width={litImage.width}
                  height={litImage.height}
                  alt=""
                  className={cx(styles.fill, styles.breathe)}
                />
              </Picture>
            ) : null}
            <svg
              viewBox={`0 0 ${wide.width} ${wide.height}`}
              preserveAspectRatio="none"
              fill="none"
              className={cx(styles.fill, styles.overlay)}
            >
              <ellipse
                {...ellipse(wide.plane)}
                className={cx(styles.arSignal, styles.arFade)}
                strokeWidth={1.4}
                opacity={0.28}
              />
              <ellipse
                cx={wide.plane.cx}
                cy={wide.plane.cy}
                rx={wide.plane.rx + 40}
                ry={wide.plane.ry + 13}
                className={cx(styles.arDim, styles.arFade)}
                strokeWidth={1.2}
                strokeDasharray="2 12"
                opacity={0.35}
              />
              {wide.sprout ? (
                <g className={styles.sprout}>
                  <path
                    pathLength={1}
                    d={`M${wide.sprout.from[0]} ${wide.sprout.from[1]} L${wide.sprout.to[0]} ${wide.sprout.to[1]}`}
                    className={cx(styles.arDim, styles.arDraw)}
                    style={delay(1600)}
                    strokeWidth={1.5}
                    strokeDasharray="6 9"
                    opacity={0.7}
                  />
                  <g className={styles.arFade} style={delay(2000)}>
                    <path
                      d={wide.sprout.outline}
                      className={styles.arDim}
                      strokeWidth={1.5}
                      opacity={0.7}
                    />
                    <path
                      d={wide.sprout.facets}
                      className={styles.arDim}
                      strokeWidth={1.2}
                      opacity={0.45}
                    />
                    <ellipse
                      {...ellipse(wide.sprout.shadow)}
                      className={styles.arDim}
                      strokeWidth={1.2}
                      strokeDasharray="3 6"
                      opacity={0.5}
                    />
                  </g>
                </g>
              ) : null}
              {nodes.map((node, index) => (
                <g key={`stem-${node.x}`}>
                  <ellipse
                    cx={node.x}
                    cy={node.base}
                    rx={10}
                    ry={4}
                    className={styles.arSignal}
                    strokeWidth={1.4}
                    opacity={0.8}
                  />
                  <path
                    pathLength={1}
                    d={`M${node.x} ${node.base} L${node.x} ${node.top + 9}`}
                    className={cx(styles.arDim, styles.arDraw)}
                    style={delay(300 + index * 250)}
                    strokeWidth={1.5}
                    opacity={0.8}
                  />
                </g>
              ))}
              {wide.wires.map((wire, index) => {
                const from = nodes[wire.from];
                const to = nodes[wire.to];
                if (!from || !to) return null;
                const d = `M${from.x} ${from.top} Q${wire.control[0]} ${wire.control[1]} ${to.x} ${to.top}`;
                return (
                  <g key={d}>
                    <path
                      pathLength={1}
                      d={d}
                      className={cx(styles.arSignal, styles.arDraw)}
                      style={delay(1300 + index * 200)}
                      strokeWidth={1.3}
                      opacity={0.5}
                    />
                    {wire.pulse ? (
                      <path
                        pathLength={1}
                        d={d}
                        className={cx(styles.arSignal, styles.arPulse)}
                        strokeWidth={3}
                        strokeLinecap="round"
                      />
                    ) : null}
                  </g>
                );
              })}
              {nodes.map((node, index) => (
                <g key={`node-${node.x}`} className={styles.arNode} style={delay(index * -1700)}>
                  <ellipse
                    cx={node.x}
                    cy={node.top}
                    rx={26}
                    ry={9}
                    className={styles.arSignal}
                    strokeWidth={1.6}
                  />
                  <ellipse
                    cx={node.x}
                    cy={node.top}
                    rx={40}
                    ry={14}
                    className={styles.arDim}
                    strokeWidth={1.1}
                    opacity={0.45}
                  />
                  <circle cx={node.x} cy={node.top} r={5} className={styles.arCore} />
                </g>
              ))}
              {wideRings.map((ring, index) => {
                const tone = rings[index]?.tone;
                const leader = (end: ScenePoint, variant?: string) => (
                  <g className={variant}>
                    <path
                      pathLength={1}
                      d={`M${ring.source[0]} ${ring.source[1]} L${end[0]} ${end[1]}`}
                      className={cx(styles.arLeader, styles.arDraw)}
                      style={delay(200 + index * 250)}
                      strokeWidth={1.6}
                      opacity={0.8}
                    />
                    <circle
                      cx={end[0]}
                      cy={end[1]}
                      r={4.5}
                      data-tone={tone}
                      className={cx(styles.arMark, styles.arFade)}
                      style={delay(1400 + index * 250)}
                      strokeWidth={1.6}
                    />
                  </g>
                );
                return (
                  <g key={`ring-${ring.source[0]}`}>
                    {leader(ring.end, ring.narrowEnd ? styles.wideOnly : undefined)}
                    {ring.narrowEnd ? leader(ring.narrowEnd, styles.narrowOnly) : null}
                    <ellipse
                      cx={ring.source[0]}
                      cy={ring.source[1]}
                      rx={11}
                      ry={5.5}
                      data-tone={tone}
                      className={styles.arMark}
                      strokeWidth={1.8}
                    />
                  </g>
                );
              })}
            </svg>
          </div>
          <div className={styles.floorFade} />
        </div>

        {line ? (
          <div
            aria-hidden="true"
            data-headline-line=""
            className={styles.headlineLine}
            style={{ left: line.x, top: line.y, width: line.width }}
          >
            <span className={styles.headlineLineStroke} />
          </div>
        ) : null}

        {nav ? <div className={styles.nav}>{nav}</div> : null}

        <div className={styles.body}>
          <Container>
            <div className={styles.text}>
              <Label as="p">{eyebrow}</Label>
              <Heading level={1} role="hero" id={titleId} className={styles.headline}>
                {headline.map((text, index) => {
                  const isLast = index === last;
                  return (
                    <span key={text}>
                      {isLast && marked ? (
                        <>
                          {text.slice(0, text.length - marked.length)}
                          <span ref={startRef} aria-hidden="true" className={styles.marker} />
                          {marked}
                          <span
                            ref={endRef}
                            aria-hidden="true"
                            data-headline-end=""
                            className={styles.marker}
                          />
                        </>
                      ) : (
                        text
                      )}
                      {isLast ? null : <br />}
                    </span>
                  );
                })}
              </Heading>
              <Text role="lead" className={styles.lead}>
                {lead}
              </Text>
              {primaryAction || secondaryAction ? (
                <div className={styles.actions}>
                  {primaryAction ? (
                    <Button as={linkAs} href={primaryAction.href} arrow>
                      {primaryAction.label}
                    </Button>
                  ) : null}
                  {secondaryAction ? (
                    <Button as={linkAs} href={secondaryAction.href} variant="quiet">
                      {secondaryAction.label}
                    </Button>
                  ) : null}
                </div>
              ) : null}
            </div>
          </Container>
        </div>

        <div className={styles.wide}>
          <div className={styles.stage} style={{ aspectRatio: `${wide.width} / ${wide.height}` }}>
            {nodes.map((node, index) => {
              const project = projects[index]!;
              return (
                <ArCallout
                  key={project.href}
                  name={project.name}
                  status={project.status}
                  href={project.href}
                  linkAs={linkAs}
                  style={at([node.x, node.top], wide)}
                />
              );
            })}
            {wideRings.map((ring, index) => {
              const item = rings[index]!;
              return ring.narrowEnd ? (
                <Fragment key={item.name}>
                  <ArCallout
                    name={item.name}
                    status={item.detail}
                    tone={item.tone}
                    placement="above"
                    className={styles.wideOnly}
                    style={at(ring.end, wide)}
                  />
                  <ArCallout
                    name={item.name}
                    status={item.detail}
                    tone={item.tone}
                    placement="aboveShifted"
                    className={styles.narrowOnly}
                    style={at(ring.narrowEnd, wide)}
                  />
                </Fragment>
              ) : (
                <ArCallout
                  key={item.name}
                  name={item.name}
                  status={item.detail}
                  tone={item.tone}
                  placement="above"
                  style={at(ring.end, wide)}
                />
              );
            })}
          </div>
        </div>

        <div
          className={styles.phoneStump}
          style={{ aspectRatio: `${phone.width} / ${phone.crop.height}` }}
        >
          <Picture sources={phoneImage.sources} skipWhen={PHONE_HIDDEN}>
            <img
              src={phoneImage.src}
              width={phoneImage.width}
              height={phoneImage.height}
              alt={phoneImage.alt}
              className={cx(styles.fill, styles.phoneImage)}
            />
          </Picture>
          <svg
            viewBox={`0 ${phone.crop.y} ${phone.width} ${phone.crop.height}`}
            preserveAspectRatio="none"
            fill="none"
            aria-hidden="true"
            className={styles.fill}
          >
            <ellipse
              {...ellipse(phone.plane)}
              className={cx(styles.arSignal, styles.arFade)}
              strokeWidth={1.6}
              opacity={0.3}
            />
            {phoneNodes.map((node, index) => (
              <g key={node.x}>
                <path
                  pathLength={1}
                  d={`M${node.x} ${node.base} L${node.x} ${node.top + 7}`}
                  className={cx(styles.arDim, styles.arDraw)}
                  style={delay(300 + index * 250)}
                  strokeWidth={2}
                  opacity={0.8}
                />
                <g className={styles.arNode} style={delay(index * -1700)}>
                  <ellipse
                    cx={node.x}
                    cy={node.top}
                    rx={18}
                    ry={6.5}
                    className={styles.arSignal}
                    strokeWidth={2}
                  />
                  <circle cx={node.x} cy={node.top} r={4} className={styles.arCore} />
                </g>
              </g>
            ))}
            {phoneRings.map((point, index) => (
              <ellipse
                key={point[0]}
                cx={point[0]}
                cy={point[1]}
                rx={9}
                ry={4.5}
                data-tone={rings[index]?.tone}
                className={styles.arMark}
                strokeWidth={2.2}
              />
            ))}
          </svg>
        </div>

        <nav aria-label={projectsLabel} className={styles.phoneList}>
          <ul className={styles.phoneRows}>
            {projects.map((project) => (
              <li key={project.href}>
                <Link href={project.href} className={styles.phoneRow}>
                  <span className={styles.phoneRowText}>
                    <span className={styles.phoneRowName}>{project.name}</span>
                    <span className={styles.phoneRowStatus}>
                      <StatusDot status={project.dot} />
                      {project.status}
                    </span>
                  </span>
                  <ArrowIcon size="md" />
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </section>
    </div>
  );
}
