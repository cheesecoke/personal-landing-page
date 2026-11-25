import { useState, type CSSProperties, type ReactNode } from 'react';

import { Thread, ThreadColumn, ThreadNode } from '../../../layout';
import {
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
  className?: string;
}

const percent = (value: number, total: number) => `${((value / total) * 100).toFixed(3)}%`;

/**
 * The Contact page: the title, a line and the links, with the portal beside them: a rendered ring
 * with the spiral turning in its opening, faster while the pointer is over it. The thread does not
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
  className,
}: ContactDoorProps) {
  const [hover, setHover] = useState(false);
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

        <div aria-hidden="true" data-contact-door="" className={styles.scene}>
          <div
            className={styles.stage}
            onPointerEnter={() => setHover(true)}
            onPointerLeave={() => setHover(false)}
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
              <PortalSpiral speed={hover ? 'active' : 'rest'} className={styles.spiral} />
            </div>
          </div>
          {thread ? (
            <div data-contact-thread="" className={styles.floor}>
              <span className={styles.plug} />
            </div>
          ) : null}
        </div>
      </section>
    </ThreadColumn>
  );
}
