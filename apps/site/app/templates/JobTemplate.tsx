import type { TitanLog as TitanLogData } from '@cwc/content';
import type { ProjectPageContent } from '@cwc/content/hand';
import { ProjectStateBadge, TitanLog } from '@cwc/ui';

import { ProjectPage } from './ProjectTemplate';
import { jobLabels, type JobLabels } from './ProjectTemplate.labels';

export interface JobTemplateProps {
  /** The page's hand content (`work/titan-intake.json`). */
  content: ProjectPageContent;
  /**
   * Live data: the job log. It is off: the loader passes it only once its file says
   * `enabled: true`, and until then the page has no log and no place for one.
   */
  log?: TitanLogData | null;
  /** The words around the log. */
  labels?: JobLabels;
}

/**
 * The job page. It is drawn like a project page (opening with the role under the title, the
 * drawn flow, "What it is", "Go deeper", the hand-off) from hand content alone: no counts, no
 * live status, no new mark. The status is the current job, so its dot is the lit one.
 */
export function JobTemplate({ content, log = null, labels = jobLabels }: JobTemplateProps) {
  const enabled = log?.enabled === true && log.entries.length > 0;
  return (
    <ProjectPage
      content={content}
      status={<ProjectStateBadge status="live" label={content.hero.status} />}
      log={(slot) =>
        enabled ? (
          <TitanLog
            enabled
            title={slot.label}
            source={labels.source}
            role={log.role}
            since={log.since}
            sinceLabel={labels.since}
            entries={log.entries}
          />
        ) : null
      }
    />
  );
}
