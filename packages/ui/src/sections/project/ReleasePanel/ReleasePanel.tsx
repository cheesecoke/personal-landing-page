import { useId, type ComponentPropsWithoutRef, type ReactNode } from 'react';

import {
  cx,
  Heading,
  newMark,
  NewMarkerLabel,
  Panel,
  Readout,
  useHydrated,
} from '../../../primitives';
import { LogLines } from '../internal/LogLines';
import { formatLogDate } from '../LogEntry/logDate';

export type ReleaseChannel = 'app-store' | 'play-store' | 'testflight' | 'web';

/** A live project's current release, as the publish job writes it. */
export interface ReleaseData {
  /** `v1.2.3`. */
  version: string;
  /** `YYYY-MM-DD`. */
  date: string;
  channel: ReleaseChannel;
  notes: readonly string[];
  /** Usage numbers, each with the day it was counted. May be empty. */
  usage: readonly { label: string; value: string; asOf: string }[];
}

export interface ReleasePanelProps extends Omit<
  ComponentPropsWithoutRef<'section'>,
  'title' | 'children'
> {
  /** The panel's label. */
  title: ReactNode;
  /** `null` when the project is not live: the panel renders nothing. */
  release: ReleaseData | null;
  /** The word for each channel ("App Store", "Web"). */
  channelLabels: Record<ReleaseChannel, string>;
  /** The label over the notes ("Release notes"). */
  notesLabel?: ReactNode;
  /** The words before a usage number's date ("As of"). */
  asOfLabel?: string;
  /** The new mark for a fresh release, as plain numbers. */
  fresh?: { ageDays: number; lifeDays: number } | null;
  /** As `NewMarker`'s: leave it out, or pass `false` to see the page without script. */
  hydrated?: boolean;
}

/**
 * A live project's release: the version as a numeral, its date and channel, the release notes,
 * and usage numbers when there are any (each with its "as of" date). A project that is not live
 * has no release, and the panel renders nothing. The glow stays with the log: the panel's edge is
 * drawn without one.
 */
export function ReleasePanel({
  title,
  release,
  channelLabels,
  notesLabel,
  asOfLabel,
  fresh,
  hydrated,
  className,
  ...rest
}: ReleasePanelProps) {
  const headingId = useId();
  const detected = useHydrated();
  if (!release) return null;
  const mark = (hydrated ?? detected) && fresh ? newMark(fresh) : null;
  return (
    <Panel
      as="section"
      litEdge="no-glow"
      aria-labelledby={headingId}
      className={cx('flex flex-col gap-5 px-[clamp(18px,3vw,32px)] pt-6 pb-5.5', className)}
      {...rest}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1.5">
        <Heading level={2} role="label" tone="secondary" id={headingId}>
          {title}
        </Heading>
        <Readout kind="status" tone="secondary">
          {channelLabels[release.channel]}
        </Readout>
      </div>
      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
        <Readout kind="numeral" className="text-[clamp(34px,4vw,48px)] leading-[0.98]">
          {release.version}
        </Readout>
        <Readout kind="date" dateTime={release.date}>
          {formatLogDate(release.date)}
        </Readout>
        {mark ? <NewMarkerLabel text={mark.text} spoken={mark.spoken} /> : null}
      </div>
      {release.notes.length > 0 ? (
        <div className="flex flex-col gap-2.5">
          {notesLabel ? <span className="type-label text-secondary">{notesLabel}</span> : null}
          <LogLines lines={release.notes} />
        </div>
      ) : null}
      {release.usage.length > 0 ? (
        <dl
          data-usage=""
          className="m-0 grid grid-cols-[repeat(auto-fit,minmax(min(150px,100%),1fr))] gap-x-6 gap-y-5 border-t border-hairline pt-4"
        >
          {release.usage.map((slot) => (
            <div key={slot.label} className="flex min-w-0 flex-col-reverse justify-end gap-1.5">
              <dt className="flex flex-col gap-1 text-[14px] leading-normal text-primary">
                {slot.label}
                <Readout kind="date" dateTime={slot.asOf} className="text-[10px]">
                  {asOfLabel ? `${asOfLabel} ` : null}
                  {formatLogDate(slot.asOf)}
                </Readout>
              </dt>
              <dd className="m-0 font-readout text-[24px] leading-none font-light text-accent-warm lining-nums">
                {slot.value}
              </dd>
            </div>
          ))}
        </dl>
      ) : null}
    </Panel>
  );
}
