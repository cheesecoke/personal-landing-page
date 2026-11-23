import type { CanopyCopy, CanopyData, CanopyNode, CanopyShoot } from '@cwc/canopy';
import { defaultCanopyCopy } from '@cwc/canopy';
import type { FreshMark, Project, PublicProject } from '@cwc/content';
import type { MapContent } from '@cwc/content/hand';
import { newMark } from '@cwc/ui';

import { statusKeyTone } from './live';

/**
 * The project tree as `<Canopy>` takes it, safe in the browser. The tree itself (nodes, what
 * feeds what, where each card goes) is hand content (`map.json`); live data adds each project's
 * status and its shoots. Loaders build the data at pre-render; the new marks are added in the
 * browser, once the page knows the date.
 */

/** A shoot's id on the tree. Projects reuse shoot ids, the tree needs each to be unique. */
export const canopyShootId = (slug: string, shootId: string) => `${slug}-${shootId}`;

const toShoot = (slug: string, shoot: PublicProject['shoots'][number]): CanopyShoot => ({
  id: canopyShootId(slug, shoot.id),
  label: shoot.label,
  // A shoot that grew or was answered shows how; an open one shows its note.
  note: shoot.resolved?.text ?? shoot.note,
  state: shoot.state,
});

/**
 * The tree's data. A node with a live project file shows that file's status word (and the dot
 * that goes with its key) and, when the project is public, its shoots. Any other node shows the
 * hand-written status and no shoots.
 */
export function toCanopyData(
  map: Pick<MapContent, 'root' | 'nodes' | 'flows' | 'start'>,
  projects: readonly Project[] = [],
): CanopyData {
  const live = new Map(projects.map((project) => [project.slug, project]));
  return {
    root: { id: map.root.id, label: map.root.label },
    nodes: map.nodes.map((node): CanopyNode => {
      const project = live.get(node.id);
      const tone = project ? statusKeyTone(project.status.key) : undefined;
      return {
        id: node.id,
        label: node.label,
        parent: node.parent,
        kind: node.kind,
        status: project?.status.label ?? node.status,
        ...(tone ? { tone: tone === 'private' ? 'quiet' : tone } : {}),
        oneLine: node.oneLine,
        weight: node.weight,
        page: node.page,
        href: node.href,
        ...(node.open ? { open: node.open } : {}),
        ...(project?.visibility === 'public' && project.shoots.length > 0
          ? { shoots: project.shoots.map((shoot) => toShoot(project.slug, shoot)) }
          : {}),
      };
    }),
    flows: map.flows,
    start: map.start,
  };
}

/**
 * For each project whose newest change is a shoot that grew or was answered: that shoot's id on
 * the tree. Its tip carries the mark when the project is marked.
 */
export function freshShoots(projects: readonly Project[]): Record<string, string> {
  const shoots: Record<string, string> = {};
  for (const project of projects) {
    if (project.visibility !== 'public' || !project.fresh) continue;
    const { changedAt, changeKind } = project.fresh;
    const shoot = project.shoots.find(
      (entry) => entry.state === changeKind && entry.resolved?.date === changedAt,
    );
    if (shoot) shoots[project.slug] = canopyShootId(project.slug, shoot.id);
  }
  return shoots;
}

/**
 * The tree with the page's new marks drawn on it: each marked project's node, and its fresh shoot
 * when the change was a shoot. `marks` come from the page's `FreshnessProvider`, by project slug.
 * With no marks the data comes back as it was (the same object), which is what the pre-rendered
 * page and the first render in the browser both use.
 */
export function withCanopyFresh(
  data: CanopyData,
  marks: Readonly<Record<string, FreshMark>>,
  shoots: Readonly<Record<string, string>> = {},
): CanopyData {
  const drawn = (id: string) => {
    const mark = marks[id];
    const label = mark ? newMark(mark)?.text : undefined;
    return mark && label ? { left: mark.remaining, label } : null;
  };
  if (!data.nodes.some((node) => drawn(node.id))) return data;
  return {
    ...data,
    nodes: data.nodes.map((node) => {
      const fresh = drawn(node.id);
      if (!fresh) return node;
      return {
        ...node,
        fresh,
        shoots: node.shoots?.map((shoot) =>
          shoot.id === shoots[node.id] ? { ...shoot, fresh } : shoot,
        ),
      };
    }),
  };
}

/** The words of hand content's `map.json` that the tree prints. */
export type CanopyWords = Pick<MapContent, 'headline' | 'hint' | 'labels'>;

/**
 * The tree's words: hand content's where it has them, the canopy's own for the rest (the picture's
 * description, the list's headings, the key hints).
 */
export function toCanopyCopy({ headline, hint, labels }: CanopyWords): CanopyCopy {
  return {
    ...defaultCanopyCopy,
    headline,
    hint,
    legend: { start: labels.legend.start, shoot: labels.legend.ungrown, flow: labels.legend.feeds },
    kinds: labels.kinds,
    open: labels.open,
    openIn: (parent) => labels.openInParent.replace('{parent}', parent),
    shoots: labels.ungrown,
    relations: {
      partOf: labels.partOf,
      inside: labels.inside,
      feeds: labels.feeds,
      fedBy: labels.fedBy,
    },
    back: labels.back,
  };
}
