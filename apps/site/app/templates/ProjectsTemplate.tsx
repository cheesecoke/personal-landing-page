import type { ReactNode } from 'react';

import type { ProjectsIndexContent } from '@cwc/content/hand';
import {
  Container,
  HandoffFooter,
  PageHeader,
  ProjectIndex,
  ProjectsMapSlot,
  Thread,
  ThreadColumn,
  ThreadNode,
  ThreadScope,
  type ProjectIndexGroup,
  type ProjectIndexRow,
} from '@cwc/ui';

import { statusTone } from '../content/status';
import { RouterLink } from '../shell/RouterLink';

/**
 * Projects that are a name and a status and nothing else: no line, no link, whatever the hand
 * file carries for them.
 */
const nameOnly: ReadonlySet<string> = new Set(['distill']);

/** What live data adds to a row: the new mark. The caller picks the rows (three a page at most). */
export type ProjectsFresh = Record<string, NonNullable<ProjectIndexRow['fresh']>>;

/** What live data knows about the rows, by row id (a row's id is its project's slug). */
export interface ProjectsLive {
  /** The status word and its dot. A row without one shows the hand-written word. */
  status?: Record<string, ProjectIndexRow['status']>;
  /**
   * Rows that may carry a new mark once the page has hydrated. They keep room for its readout,
   * so nothing shifts when it appears.
   */
  reserve?: readonly string[];
}

/** The index as the `ProjectIndex` section takes it. */
export function toIndexGroups(
  index: ProjectsIndexContent['index'],
  fresh: ProjectsFresh = {},
  live: ProjectsLive = {},
): ProjectIndexGroup[] {
  return index.groups.map((group) => ({
    title: group.title,
    rows: group.rows.map((row) => {
      const base = {
        id: row.id,
        name: row.name,
        status: live.status?.[row.id] ?? { label: row.status, tone: statusTone(row.status) },
        depth: row.depth,
      };
      if (nameOnly.has(row.id)) return base;
      return {
        ...base,
        line: row.line,
        href: row.href,
        fresh: fresh[row.id] ?? null,
        reserveMarker: live.reserve?.includes(row.id) ?? false,
      };
    }),
  }));
}

export interface ProjectsTemplateProps {
  /** The page's hand content (`projects-index.json`). */
  content: ProjectsIndexContent;
  /**
   * The project tree. It is another package's component, so it is passed in; without it the page
   * goes straight from the header to the index.
   */
  map?: ReactNode;
  /** Live data: the new marks, by row id. Without it no row carries one. */
  fresh?: ProjectsFresh;
  /** Live data: each row's status, and which rows keep room for a new mark. */
  live?: ProjectsLive;
}

/** Projects: the header, the project tree full width, then every project in the index. */
export function ProjectsTemplate({ content, map, fresh, live }: ProjectsTemplateProps) {
  return (
    <ThreadScope>
      <Container>
        <ThreadColumn placement="column" className="pt-9 pb-10">
          <Thread placement="column" fadeIn={30} pulse={false}>
            <ThreadNode placement="rail" top={58} />
          </Thread>
          <PageHeader layout="row" title={content.header.title} lead={content.header.lead} />
        </ThreadColumn>
      </Container>

      {map ? <ProjectsMapSlot aria-label={content.mapLabel}>{map}</ProjectsMapSlot> : null}

      <Container>
        <ThreadColumn placement="column">
          {/* After the map the thread fades back in. With no map it simply carries on. */}
          <Thread placement="column" fadeIn={map ? 8 : 2} bottom={129}>
            <ThreadNode placement="rail" top={126} />
            <ThreadNode placement="rail" bottom={0} />
          </Thread>
          <ProjectIndex
            title={content.index.title}
            groups={toIndexGroups(content.index, fresh, live)}
            linkAs={RouterLink}
          />
          <HandoffFooter
            space="projects"
            aria-label={content.next.label}
            label={content.next.label}
            title={content.next.link.label}
            href={content.next.link.href}
            linkAs={RouterLink}
          />
        </ThreadColumn>
      </Container>
    </ThreadScope>
  );
}
