/**
 * The Home board's copy, for stories. Stories only: the site reads its copy from content files and
 * passes it to these components as props.
 */
import type { LatestEntry } from '../LatestLine/LatestLine';
import type { ProjectPlate } from '../ProjectPlates/ProjectPlates';
import type { ProofFact } from '../ProofRow/ProofRow';
import type { StumpHeroProject, StumpHeroRing } from '../StumpHero/StumpHero';

export const heroCopy = {
  eyebrow: 'Chase Cole · Senior Software Engineer, AI · Titan Intake',
  headline: ['What I’ve built,', 'and what’s', 'still growing.'],
  underline: 'growing.',
  lead: 'I’m a software engineer: I build apps people use, the tools engineers build with, and AI systems. Whatever brought you here, the work is below.',
  primaryAction: { label: 'See the projects', href: '/projects' },
  secondaryAction: { label: 'Get in touch', href: '/contact' },
  projectsLabel: 'Projects on the stump',
  phoneAlt:
    'A stylised tree stump in a dark studio, its growth rings drawn in light: teal rings, one orange ring.',
} as const;

export const heroProjects: StumpHeroProject[] = [
  { name: 'PAS · Atti', status: 'Daily use', dot: 'live', href: '/projects/pas/atti' },
  { name: 'Personal brain', status: 'Daily use', dot: 'live', href: '/projects/personal-brain' },
  { name: 'AI system', status: 'First version', dot: 'private', href: '/projects/ai-system' },
  { name: 'Duo Decide', status: 'In build', dot: 'build', href: '/projects/duo-decide' },
];

export const heroRings: StumpHeroRing[] = [
  { name: 'Titan Intake', detail: 'Now', tone: 'signal' },
  { name: 'Wildland fire', detail: '2022–24', tone: 'ember' },
];

export const proofFacts: ProofFact[] = [
  {
    key: 'spec-to-code',
    kind: 'phrase',
    value: 'Spec to tested code',
    caption: 'At work: agents build, engineers review.',
    href: '/work/titan-intake',
  },
  {
    key: 'atti-commits',
    value: '177',
    unit: 'commits by Atti',
    caption: "My assistant's own writes to my brain.",
    href: '/projects/pas',
  },
  {
    key: 'duo-tests',
    value: '1,167',
    unit: 'test cases',
    caption: 'Duo Decide, run in CI.',
    href: '/projects/duo-decide',
  },
];

export const atWorkCopy = {
  label: 'At work',
  title: 'The AI orchestrator I built',
  body: 'It turns a product spec into tickets that agents build and test, with a harness measuring every stage.',
  link: { label: 'The work at Titan Intake', href: '/work/titan-intake' },
  steps: ['Product spec', 'Tickets', 'Agents build', 'Agents test', 'Engineer review'],
  flowLabel: 'Flow: product spec, tickets, agents build, agents test, engineer review.',
};

export const platesCopy = {
  label: 'On my own time',
  intro: 'Think, write, build, test.',
  allLink: { label: 'All projects', href: '/projects' },
};

/** The board's three plates, with its frames and crops for 4:3 tile images. */
export const projectPlates: Omit<ProjectPlate, 'image'>[] = [
  {
    key: 'pas',
    name: 'PAS',
    summary: 'My personal assistant system.',
    href: '/projects/pas/atti',
    kind: 'Concept drawing',
    status: 'live',
    statusLabel: 'Daily use',
    featured: true,
    weight: 1.45,
    frame: { aspect: 1.0545, crop: { left: -2.5, top: 9.31, width: 105 } },
    phoneFrame: { aspect: 350 / 260, crop: { left: -2, top: -1.45, width: 104 } },
  },
  {
    key: 'duo-decide',
    name: 'Duo Decide',
    summary: 'A decision app for couples.',
    href: '/projects/duo-decide',
    kind: 'Design mock',
    status: 'build',
    statusLabel: 'In build',
    weight: 0.8,
    frame: { aspect: 0.5818, crop: { left: -70.31, top: -1.45, width: 240.62 } },
    phoneFrame: { aspect: 350 / 420, crop: { left: -34, top: -1.45, width: 168 } },
  },
  {
    key: 'ai-system',
    name: 'AI system',
    summary: 'First pipeline, being replaced by Distill.',
    href: '/projects/ai-system',
    kind: 'Pipeline diagram',
    status: 'private',
    statusLabel: 'First version',
    weight: 1.35,
    frame: { aspect: 0.9818, crop: { left: 1.16, top: 16.04, width: 97.67 } },
    phoneFrame: { aspect: 350 / 220, crop: { left: 1.16, top: -5.03, width: 97.67 } },
  },
];

export const plateAlts = {
  pas: "Concept drawing A-02: the Atti pod's exploded stack, from shell to skin pad.",
  'duo-decide': 'The Duo Decide decision queue in the design mock: "What are we deciding today?"',
  'ai-system':
    'Diagram of my plan-to-pull-request pipeline: intake, evidence, plan, code and PR, with a brain that feeds lessons back into planning.',
} as const;

export const mapCopy = {
  title: 'How my projects connect.',
  link: { label: 'Open the map', href: '/projects' },
  mapLink: { label: 'Open the project map', href: '/projects' },
};

export const handoffCopy = {
  'aria-label': 'Next',
  label: 'Next',
  next: { label: 'Projects', href: '/projects' },
  aside: { label: 'Building with agents too? Write to me.', href: '/contact' },
};

/** Sample entries from the captain's log board. The release is the board's example, not a real one. */
export const latestUpdate: LatestEntry = {
  project: 'PAS',
  href: '/projects/pas',
  kind: 'update',
  date: '2026-11-20',
  dateLabel: '20 Nov 2026',
  text: 'Replies now match my Yes or No answers.',
};

export const latestRelease: LatestEntry = {
  project: 'Duo Decide',
  href: '/projects/duo-decide',
  kind: 'release',
  date: '2026-11-20',
  dateLabel: '20 Nov 2026',
  version: 'v1.0.0',
  text: 'Voting and three-round polls for two people.',
};
