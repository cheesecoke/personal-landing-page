import { useId, type ReactNode } from 'react';

import { Thread, ThreadColumn, ThreadNode } from '../../../layout';
import { cx, Heading, Label, Text } from '../../../primitives';
import styles from './ContactDoor.module.css';

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

export interface ContactDoorProps {
  /** The page title ("The door is open."). */
  title: ReactNode;
  /** An id for the title. Default `contact-title`. */
  titleId?: string;
  lead?: ReactNode;
  links: ContactLink[];
  /**
   * Draw the page's thread: the rail down the left, which the door's floor line continues. Turn
   * it off only to show the section without its page column. Default `true`.
   */
  thread?: boolean;
  className?: string;
}

/**
 * The Contact page: the title, a line and the links, with an open door beside them. The thread
 * does not stop at the foot of the page: it turns along the floor and goes in through the door.
 * Place it straight inside the page `Container`; it brings its own thread column.
 */
export function ContactDoor({
  title,
  titleId = 'contact-title',
  lead,
  links,
  thread = true,
  className,
}: ContactDoorProps) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const id = (name: string) => `${uid}-${name}`;
  const url = (name: string) => `url(#${id(name)})`;
  return (
    <ThreadColumn placement="column" className={cx(styles.column, className)}>
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
          <svg viewBox="0 0 900 800" preserveAspectRatio="xMaxYMax meet" className={styles.svg}>
            <defs>
              <linearGradient id={id('room')} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopOpacity=".03" className={styles.warm} />
                <stop offset=".55" stopOpacity=".16" className={styles.warm} />
                <stop offset="1" stopOpacity=".46" className={styles.warm} />
              </linearGradient>
              <linearGradient
                id={id('leaf')}
                gradientUnits="userSpaceOnUse"
                x1="440"
                y1="0"
                x2="556.8"
                y2="0"
              >
                <stop offset="0" className={styles.leafDark} />
                <stop offset="1" className={styles.leafLight} />
              </linearGradient>
              <linearGradient id={id('edge')} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopOpacity=".14" className={styles.warm} />
                <stop offset=".7" stopOpacity=".4" className={styles.warm} />
                <stop offset="1" stopOpacity=".55" className={styles.warm} />
              </linearGradient>
              <linearGradient
                id={id('wedge')}
                gradientUnits="userSpaceOnUse"
                x1="0"
                y1="680"
                x2="0"
                y2="771.9"
              >
                <stop offset="0" stopOpacity=".42" className={styles.warm} />
                <stop offset=".5" stopOpacity=".12" className={styles.warm} />
                <stop offset="1" stopOpacity="0" className={styles.warm} />
              </linearGradient>
              <linearGradient id={id('depth')} x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stopOpacity=".35" className={styles.ground} />
                <stop offset=".45" stopOpacity="0" className={styles.ground} />
                <stop offset="1" stopOpacity=".45" className={styles.ground} />
              </linearGradient>
              <linearGradient
                id={id('inner')}
                gradientUnits="userSpaceOnUse"
                x1="0"
                y1="611.4"
                x2="0"
                y2="680"
              >
                <stop offset="0" stopOpacity="0" className={styles.warm} />
                <stop offset="1" stopOpacity=".32" className={styles.warm} />
              </linearGradient>
              <linearGradient id={id('floor')} x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stopOpacity="0" className={styles.floor} />
                <stop offset=".5" className={styles.floor} />
                <stop offset="1" stopOpacity="0" className={styles.floor} />
              </linearGradient>
              <filter id={id('soft')} x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="5" />
              </filter>
              <filter id={id('glow')} x="-200%" y="-50%" width="500%" height="200%">
                <feGaussianBlur stdDeviation="16" />
              </filter>
            </defs>
            {/* The floor, the light falling out of the room, and the room itself. */}
            <line x1="300" y1="680" x2="900" y2="680" stroke={url('floor')} strokeWidth="1" />
            <polygon
              points="760.0,680.0 869.7,771.9 562.6,771.9 568.3,731.7 556.8,732.5 500.8,707.3 600.0,680.0"
              fill={url('wedge')}
              filter={url('soft')}
            />
            <rect
              x="470"
              y="60"
              width="290"
              height="620"
              fill="var(--accent-warm)"
              opacity=".11"
              filter={url('glow')}
            />
            <rect x="440" y="40" width="320" height="640" fill={url('room')} />
            <polygon points="440.0,680.0 760.0,680.0 731.7,611.4 463.4,611.4" fill={url('inner')} />
            <rect x="440" y="40" width="320" height="640" fill={url('depth')} />
            <line
              x1="440"
              y1="680.5"
              x2="760"
              y2="680.5"
              stroke="var(--accent-warm)"
              strokeWidth="1"
              opacity=".6"
            />
            {/* The frame. */}
            <path
              d="M426.5 680 V26.5 H773.5 V680"
              fill="none"
              stroke="var(--line-tick)"
              strokeWidth="1"
            />
            <path
              d="M439.5 680 V39.5 H760.5 V680"
              fill="none"
              stroke="var(--line-hairline)"
              strokeWidth="1"
            />
            {/* The door leaf, standing open, with its lit edge and handle. */}
            <polygon
              points="440.0,40.0 556.8,13.5 556.8,732.5 440.0,680.0"
              fill={url('leaf')}
              stroke="var(--door-leaf-edge)"
              strokeWidth="1"
              strokeLinejoin="round"
            />
            <polygon points="556.8,13.5 568.3,13.9 568.3,731.7 556.8,732.5" fill={url('edge')} />
            <line
              x1="568.3"
              y1="731.7"
              x2="556.8"
              y2="732.5"
              stroke="var(--accent-warm)"
              strokeWidth="1"
              opacity=".5"
            />
            <polygon
              points="526.0,293.7 527.9,293.8 527.9,467.7 526.0,467.3"
              fill="var(--door-handle)"
              stroke="var(--text-secondary)"
              strokeWidth="1"
              strokeLinejoin="round"
            />
            <line
              x1="544.6"
              y1="309.2"
              x2="527.0"
              y2="309.3"
              stroke="var(--text-label)"
              strokeWidth="1.2"
            />
            <line
              x1="544.6"
              y1="451.4"
              x2="527.0"
              y2="451.9"
              stroke="var(--text-label)"
              strokeWidth="1.2"
            />
            <line
              x1="527.9"
              y1="342.8"
              x2="527.9"
              y2="387.4"
              stroke="var(--accent-warm)"
              strokeWidth="1.2"
              opacity=".9"
            />
            {/* The thread: along the floor from the rail, then up and in through the door. */}
            <path
              data-contact-thread=""
              d="M-1400 755.5 H500"
              fill="none"
              stroke="var(--thread-line)"
              strokeWidth="1"
              opacity=".75"
              vectorEffect="non-scaling-stroke"
            />
            <path
              d="M500 755.5 C600 755.5 640 733 667.2 675.9"
              fill="none"
              stroke="var(--thread-line)"
              strokeWidth="1"
              opacity=".75"
              vectorEffect="non-scaling-stroke"
            />
            <path
              d="M500 755.5 C600 755.5 640 733 667.2 675.9"
              pathLength={1}
              strokeDasharray="0 0.55 0.45"
              fill="none"
              stroke="var(--thread-on)"
              strokeWidth="1.25"
              opacity=".9"
              vectorEffect="non-scaling-stroke"
            />
            <path
              d="M667.2 675.9 L669.8 669.3"
              fill="none"
              stroke="var(--thread-on)"
              strokeWidth="1"
              opacity=".3"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        </div>
      </section>
    </ThreadColumn>
  );
}
