import type { PublicProject } from '@cwc/content';
import { BranchRings, CaptainsLog, ReleasePanel, ShootList, type ShootData } from '@cwc/ui';

import type { ProjectLabels } from './ProjectTemplate.labels';
import { isQuiet, ringGrowth } from './ProjectTemplate.map';

export interface ProjectLogProps {
  /** The panel's label, from the page's hand content ("Captain's log"). */
  title: string;
  /** The page's name, for the line under the rings. */
  name: string;
  project: PublicProject;
  /** The day the page was built (`YYYY-MM-DD`): decides whether the log has gone quiet. */
  today?: string;
  labels: ProjectLabels;
}

/** Whether a project has anything to put in the log slot. */
export const hasLog = (project: PublicProject | null | undefined): project is PublicProject =>
  Boolean(project && (project.log.length > 0 || project.release || project.rings.length > 0));

/**
 * What live data puts in a page's log slot: the release when the project is live, the captain's
 * log with the not-yet-grown list under its entries, and the branch rings when the project has
 * any. Each renders nothing without its data.
 *
 * A shoot's `note` is a sentence, so it is not shown here: the list has room for one word, and
 * that is the shoot's kind.
 */
export function ProjectLog({ title, name, project, today, labels }: ProjectLogProps) {
  const quiet = isQuiet(project.log, today);
  const growing = ringGrowth(project.rings, project.log, quiet);
  const shoots: ShootData[] = project.shoots.map(({ note: _note, ...shoot }) => shoot);
  const released = project.rings.at(-1)?.kind === 'release';
  return (
    <>
      <ReleasePanel
        title={labels.release.title}
        release={project.state === 'live' ? project.release : null}
        channelLabels={labels.release.channels}
        notesLabel={labels.release.notes}
        asOfLabel={labels.release.asOf}
      />
      <CaptainsLog
        title={title}
        source={labels.log.source[project.slug]}
        entries={project.log}
        quiet={quiet}
        releaseLabel={labels.log.release}
      >
        {shoots.some((shoot) => shoot.state !== 'dropped') ? (
          <ShootList title={labels.shoots.title} shoots={shoots} labels={labels.shoots} />
        ) : null}
      </CaptainsLog>
      <BranchRings
        title={labels.rings.title}
        status={growing > 0 ? labels.rings.growing : labels.rings.still}
        rings={project.rings}
        growing={growing}
        note={`${labels.rings.note.lead} · ${name}. ${released ? labels.rings.note.release : labels.rings.note.period}`}
        weightLabels={labels.rings.weight}
      />
    </>
  );
}
