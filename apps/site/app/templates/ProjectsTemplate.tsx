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

/** The index as the `ProjectIndex` section takes it. */
export function toIndexGroups(
  index: ProjectsIndexContent['index'],
  fresh: ProjectsFresh = {},
): ProjectIndexGroup[] {
  return index.groups.map((group) => ({
    title: group.title,
    rows: group.rows.map((row) => {
      const base = {
        id: row.id,
        name: row.name,
        status: { label: row.status, tone: statusTone(row.status) },
        depth: row.depth,
      };
      if (nameOnly.has(row.id)) return base;
      return { ...base, line: row.line, href: row.href, fresh: fresh[row.id] ?? null };
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
}

/** Projects: the header, the project tree full width, then every project in the index. */
export function ProjectsTemplate({ content, map, fresh }: ProjectsTemplateProps) {
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
            groups={toIndexGroups(content.index, fresh)}
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
