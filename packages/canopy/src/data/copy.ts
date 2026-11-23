import type { CanopyKind } from '../types';

/** Every word the canopy shows that is not project data. Pass your own to change the wording. */
export interface CanopyCopy {
  /** What the picture shows, for people who cannot see it. */
  stageLabel: string;
  listLabel: string;
  count: (projects: number) => string;
  lede: string;
  startHeading: string;
  moreHeading: string;
  keys: string;
  headline: string;
  hint: string;
  legend: { start: string; shoot: string; flow: string };
  /** Shown when the tree cannot load. */
  noTree: string;
  cardLabel: string;
  kinds: Record<CanopyKind, string>;
  open: string;
  openIn: (parent: string) => string;
  shoots: string;
  shootCount: (open: number) => string;
  shootStates: { grown: string; answered: string };
  relations: { partOf: string; inside: string; feeds: string; fedBy: string };
  back: string;
  wholeTree: string;
  zoomHint: (mac: boolean) => string;
}

export const defaultCanopyCopy: CanopyCopy = {
  stageLabel:
    'A tree of Chase Cole’s personal projects, grown from one stump. Systems grow on the left bough: PAS with Atti and Lifebox, the AI system with Distill, and the personal brain with the finance and business brains. Products grow on the right: Duo Decide, Thread Quest, One Rep and this site. PAS, Duo Decide and the AI system are marked as the place to start.',
  listLabel: 'Projects',
  count: (projects) => `${projects} personal projects.`,
  lede: 'Start with one of these three.',
  startHeading: 'Start here',
  moreHeading: 'More projects',
  keys: 'Drag to turn. Pinch or ⌘/Ctrl + scroll to zoom. Esc to go back.',
  headline: 'My personal projects, grown from one stump.',
  hint: 'Pick a project to see what has not grown yet. Drag to turn the tree.',
  legend: { start: 'Start here', shoot: 'Not yet grown', flow: 'Feeds' },
  noTree: 'The tree could not load here. The list beside it works on its own.',
  cardLabel: 'Selected project',
  kinds: { system: 'System', product: 'Product', both: 'System and product' },
  open: 'Open project',
  openIn: (parent) => `Open in ${parent}`,
  shoots: 'Not yet grown',
  shootCount: (open) => `${open} not yet grown`,
  shootStates: { grown: 'Grown', answered: 'Answered' },
  relations: { partOf: 'Part of', inside: 'Inside', feeds: 'Feeds', fedBy: 'Fed by' },
  back: 'Back to the whole tree',
  wholeTree: 'The whole tree.',
  zoomHint: (mac) => `${mac ? '⌘' : 'Ctrl'} + scroll to zoom`,
};
