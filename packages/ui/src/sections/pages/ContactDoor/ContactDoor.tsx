import { useRef, useState, type CSSProperties, type ReactNode } from 'react';

import { Thread, ThreadColumn, ThreadNode } from '../../../layout';
import {
  ConfirmDialog,
  cx,
  Heading,
  Label,
  Picture,
  PortalSpiral,
  Text,
  type PictureSource,
} from '../../../primitives';
import styles from './ContactDoor.module.css';
import { portalScene, type PortalScene } from './scene';

export interface ContactLink {
  /** What it is ("Email", "LinkedIn"). */
  label: string;
  /** What the link says ("linkedin.com/in/…"). */
  text: string;
  href: string;
  /** The main way in: set large, with an arrow. */
  primary?: boolean;
  /** Opens in a new tab. */
  external?: boolean;
}

/** The portal render: the ring on its platform, with an empty opening the spiral fills. */
export interface ContactDoorImage {
  src: string;
  width: number;
  height: number;
  /** Smaller modern formats of the same image (AVIF), best first. `src` is the fallback. */
  sources?: readonly PictureSource[];
}

/** The words of the "Enter?" question the portal asks before it lets the reader through. */
export interface ContactDoorPortalDialog {
  /** A short question ("Step through?"). */
  title: string;
  /** One line under it. */
  body: string;
  /** The primary answer ("Enter"). */
  enter: string;
  /** The quiet answer ("Not now"). */
  cancel: string;
}

/**
 * Makes the ring's opening a button. Pressing it asks `dialog`; "Enter" closes the question and
 * calls `onEnter`. Without it the portal is decoration only.
 */
export interface ContactDoorPortal {
  /** The button's accessible name ("Open the portal"). */
  label: string;
  dialog: ContactDoorPortalDialog;
  /** The reader chose to go through. */
  onEnter: () => void;
}

export interface ContactDoorProps {
  /** The page title ("The door is open."). */
  title: ReactNode;
  /** An id for the title. Default `contact-title`. */
  titleId?: string;
  lead?: ReactNode;
  links: ContactLink[];
  /** The portal render. Decoration: it carries no alt text. */
  image: ContactDoorImage;
  /** Where the opening and the thread's plug are on `image`. Only change it with a new render. */
  scene?: PortalScene;
  /**
   * Draw the page's thread: the rail down the left, which the floor line continues. Turn
   * it off only to show the section without its page column. Default `true`.
   */
  thread?: boolean;
  /**
   * Turns the ring's opening into a button that asks before it lets the reader through. Without
   * it the portal is decoration, hidden from assistive technology.
   */
  portal?: ContactDoorPortal;
  className?: string;
}

const percent = (value: number, total: number) => `${((value / total) * 100).toFixed(3)}%`;

/**
 * The Contact page: the title, a line and the links, with the portal beside them: a rendered ring
 * with the spiral turning in its opening, faster while the pointer is over it. With `portal`, the
 * opening is a button (the spiral speeds up on its hover and focus) that opens a small "Enter?"
 * dialog; the render itself stays decoration. The thread does not
 * stop at the foot of the page: it turns along the floor and plugs into the portal's power unit.
 * Place it straight inside the page `Container`; it brings its own thread column.
 */
export function ContactDoor({
  title,
  titleId = 'contact-title',
  lead,
  links,
  image,
  scene = portalScene,
  thread = true,
  portal,
  className,
}: ContactDoorProps) {
  const [hover, setHover] = useState(false);
  const [focus, setFocus] = useState(false);
  const [asking, setAsking] = useState(false);
  const portalButton = useRef<HTMLButtonElement>(null);
  const active = hover || focus || asking;
  const { width, height, opening, plug } = scene;
  // The scene's numbers, as fractions of the render, for the layout to size and place from.
  const sceneVars = {
    '--portal-ratio': height / width,
    '--plug-x': plug[0] / width,
    '--plug-y': plug[1] / height,
  } as CSSProperties;
  const openingBox: CSSProperties = {
    left: percent(opening.cx - opening.rx, width),
    top: percent(opening.cy - opening.ry, height),
    width: percent(opening.rx * 2, width),
    height: percent(opening.ry * 2, height),
  };
  // The button: the opening grown by `--reach` (set in the CSS) on every side.
  const portalBox: CSSProperties = {
    left: `calc(${openingBox.left} - var(--reach))`,
    top: `calc(${openingBox.top} - var(--reach))`,
    width: `calc(${openingBox.width} + 2 * var(--reach))`,
    height: `calc(${openingBox.height} + 2 * var(--reach))`,
  };
  return (
    <ThreadColumn placement="column" className={cx(styles.column, className)} style={sceneVars}>
      {thread ? (
        <Thread placement="column" fadeIn={2} className={styles.thread}>
          <ThreadNode placement="rail" top={52} />
        </Thread>
      ) : null}
      <section aria-labelledby={titleId} className={styles.section}>
        <div className={styles.copy}>
          <Heading level={1} id={titleId}>
            {title}
          </Heading>
          {lead ? (
            <Text role="lead" className={styles.lead}>
              {lead}
            </Text>
          ) : null}
          <ul className={styles.links}>
            {links.map((link) => {
              const target = link.external ? { target: '_blank', rel: 'noopener' } : {};
              return (
                <li key={link.label} className={styles.link}>
                  <Label as="p" className={styles.linkLabel}>
                    {link.label}
                  </Label>
                  {link.primary ? (
                    <a href={link.href} className={styles.primary} {...target}>
                      {link.text}
                      <svg
                        aria-hidden="true"
                        width={28}
                        height={12}
                        viewBox="0 0 28 12"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={1}
                        className={styles.arrow}
                      >
                        <path d="M0 6h26M21 1l5 5-5 5" />
                      </svg>
                    </a>
                  ) : (
                    <a href={link.href} className={styles.plain} {...target}>
                      {link.text}
                    </a>
                  )}
                </li>
              );
            })}
          </ul>
        </div>

        {/* Decoration, unless it holds the portal button: the render and spiral are then hidden on
            their own (an empty alt, an aria-hidden svg), and only the button is exposed. */}
        <div aria-hidden={portal ? undefined : true} data-contact-door="" className={styles.scene}>
          <div
            className={cx(styles.stage, portal && styles.enterable)}
            {...(portal
              ? null
              : {
                  onPointerEnter: () => setHover(true),
                  onPointerLeave: () => setHover(false),
                })}
          >
            <Picture sources={image.sources}>
              <img
                src={image.src}
                width={image.width}
                height={image.height}
                alt=""
                decoding="async"
                className={styles.render}
              />
            </Picture>
            <div className={styles.opening} style={openingBox}>
              <PortalSpiral speed={active ? 'active' : 'rest'} className={styles.spiral} />
            </div>
            {portal ? (
              <button
                ref={portalButton}
                type="button"
                aria-label={portal.label}
                aria-haspopup="dialog"
                data-contact-portal=""
                className={styles.portal}
                style={portalBox}
                onPointerEnter={() => setHover(true)}
                onPointerLeave={() => setHover(false)}
                onFocus={() => setFocus(true)}
                onBlur={() => setFocus(false)}
                onClick={() => setAsking(true)}
              />
            ) : null}
          </div>
          {thread ? (
            <div data-contact-thread="" className={styles.floor}>
              <span className={styles.plug} />
            </div>
          ) : null}
        </div>
      </section>
      {portal ? (
        <ConfirmDialog
          open={asking}
          title={portal.dialog.title}
          body={portal.dialog.body}
          confirmLabel={portal.dialog.enter}
          cancelLabel={portal.dialog.cancel}
          returnFocusRef={portalButton}
          onCancel={() => setAsking(false)}
          onConfirm={() => {
            setAsking(false);
            portal.onEnter();
          }}
        />
      ) : null}
    </ThreadColumn>
  );
}
