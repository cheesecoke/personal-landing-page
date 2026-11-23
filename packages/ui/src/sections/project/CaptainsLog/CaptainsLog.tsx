import {
  useId,
  useRef,
  type ComponentPropsWithoutRef,
  type CSSProperties,
  type ReactNode,
} from 'react';

import { cx, Expander, Heading, Panel, Readout } from '../../../primitives';
import { useFirstView } from '../internal/useFirstView';
import { LogEntry, type LogEntryData, type LogEntryFresh } from '../LogEntry/LogEntry';
import styles from './CaptainsLog.module.css';

export interface CaptainsLogProps extends Omit<
  ComponentPropsWithoutRef<'section'>,
  'title' | 'children'
> {
  /** The panel's label ("Captain's log"). */
  title: ReactNode;
  /** Where the entries come from, on the right of the header ("From GitHub and Linear"). */
  source?: ReactNode;
  /** Newest first. With none, the log renders nothing. */
  entries: readonly LogEntryData[];
  /**
   * No recent update: only the last entry shows, unchanged, with no glow and no new mark. Whether
   * a log is quiet is worked out from dates by the content layer.
   */
  quiet?: boolean;
  /** The new mark on the newest entry, as plain numbers. */
  fresh?: LogEntryFresh | null;
  /** The label beside a release's version ("Release notes"). */
  releaseLabel?: ReactNode;
  /** A line under the header (the job log's role and start month). */
  header?: ReactNode;
  /**
   * How an entry's date is printed, when it is not a day: the job log is month-granular. Returns
   * the printed date, its `datetime` and the stardate.
   */
  describeDate?: (entry: LogEntryData) => {
    dateLabel?: string;
    dateTime?: string;
    stardate?: string;
  };
  /** Most lines shown per entry. Default 4. */
  maxLines?: number;
  /** How many entries show before the rest fold away. Default 3. */
  visible?: number;
  /**
   * The row that opens the older entries. Without it the older entries are left out, as on the
   * board.
   */
  moreLabel?: ReactNode;
  /** Open the older entries on first render. */
  defaultMoreOpen?: boolean;
  /** Under the entries, behind a hairline: the not-yet-grown list (`ShootList`). */
  children?: ReactNode;
  /** As `NewMarker`'s: leave it out, or pass `false` to see the page without script. */
  hydrated?: boolean;
}

/** What moves, for the Motion docs block. */
export const motion = {
  rise: 'On first scroll into view, entries rise 8px and fade in over `log-in`, newest first, a short step apart (4/35 of `log-in`).',
  glow: 'The newest entry holds the one glow; the panel edge is drawn without its own.',
  reduced: 'All entries shown, no rise. The glow stays: it is static.',
} as const;

const index = (value: number) => ({ '--log-index': value }) as CSSProperties;

/**
 * The captain's log: the shared look for every project log. Stardate entries on the log's own
 * thread, newest first, in an `<ol>`; each entry has a `<time>`. The newest entry's node holds the
 * page's one glow. Growing projects log what was built, live projects their versions and release
 * notes, and a quiet project keeps its last entry, unchanged. With no entries it renders nothing.
 */
export function CaptainsLog({
  title,
  source,
  entries,
  quiet = false,
  fresh,
  releaseLabel,
  header,
  describeDate,
  maxLines,
  visible = 3,
  moreLabel,
  defaultMoreOpen,
  children,
  hydrated,
  className,
  ...rest
}: CaptainsLogProps) {
  const headingId = useId();
  // Panel takes no ref: the header's parent is the panel.
  const ref = useRef<HTMLDivElement>(null);
  // Arm the rise only when script runs, motion is allowed and the log is still off screen.
  const rise = useFirstView(ref, { parent: true });

  if (entries.length === 0) return null;

  const shown = quiet ? entries.slice(0, 1) : entries.slice(0, visible);
  const older = quiet ? [] : entries.slice(visible);

  return (
    <Panel
      as="section"
      litEdge="no-glow"
      aria-labelledby={headingId}
      data-rise={rise}
      data-quiet={quiet ? '' : undefined}
      className={cx(
        styles.log,
        'flex flex-col gap-6 px-[clamp(18px,3vw,32px)] pt-6 pb-5.5',
        className,
      )}
      {...rest}
    >
      <div ref={ref} className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1.5">
        <Heading level={2} role="label" tone="secondary" id={headingId}>
          {title}
        </Heading>
        {source ? (
          <Readout kind="status" tone="secondary">
            {source}
          </Readout>
        ) : null}
      </div>
      {header ? <div className="-mt-3">{header}</div> : null}
      <ol className={styles.list}>
        {shown.map((entry, position) => (
          <LogEntry
            key={entry.id}
            entry={entry}
            latest={position === 0 && !quiet}
            fresh={position === 0 && !quiet ? fresh : null}
            releaseLabel={releaseLabel}
            maxLines={maxLines}
            hydrated={hydrated}
            style={index(position)}
            {...describeDate?.(entry)}
          />
        ))}
      </ol>
      {older.length > 0 && moreLabel ? (
        <Expander
          title={moreLabel}
          headingLevel={3}
          defaultOpen={defaultMoreOpen}
          bodyClassName="pt-2 pb-2"
        >
          <ol className={styles.list}>
            {older.map((entry) => (
              <LogEntry
                key={entry.id}
                entry={entry}
                releaseLabel={releaseLabel}
                maxLines={maxLines}
                {...describeDate?.(entry)}
              />
            ))}
          </ol>
        </Expander>
      ) : null}
      {children ? <div className="border-t border-hairline pt-4">{children}</div> : null}
    </Panel>
  );
}
