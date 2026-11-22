/**
 * The Home board's copy, for stories. Stories only: the site reads its copy from content files and
 * passes it to these components as props.
 */
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
