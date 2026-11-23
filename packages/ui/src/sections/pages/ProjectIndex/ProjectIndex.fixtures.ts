import type { ProjectIndexGroup } from './ProjectIndex';

/** The Projects board's index. Two rows carry a new mark: a change two days old, 14-day life. */
export const groups: ProjectIndexGroup[] = [
  {
    title: 'PAS · the assistant system',
    rows: [
      {
        id: 'pas',
        name: 'PAS',
        status: { label: 'Daily use', tone: 'live' },
        line: 'My personal assistant system: Atti and the projects that run under it.',
        href: '/projects/pas',
        fresh: { ageDays: 2, lifeDays: 14 },
      },
      {
        id: 'atti',
        name: 'Atti',
        status: { label: 'Daily use', tone: 'live' },
        line: 'A personal assistant built around one person, running on Telegram.',
        href: '/projects/pas/atti',
        depth: 1,
      },
      {
        id: 'lifebox',
        name: 'Lifebox',
        status: { label: 'Experiment', tone: 'private' },
        line: "One interface per person. Planned as Atti's phone app.",
        href: '/projects/pas/lifebox',
        depth: 2,
      },
    ],
  },
  {
    title: 'Brains and pipelines',
    rows: [
      {
        id: 'ai-system',
        name: 'AI system',
        status: { label: 'First version', tone: 'private' },
        line: 'My first agent pipeline: plan, code, pull request.',
        href: '/projects/ai-system',
      },
      // A name-only project: its name and one status, nothing else.
      {
        id: 'distill',
        name: 'Distill',
        status: { label: 'Next version', tone: 'private' },
        depth: 1,
      },
      {
        id: 'personal-brain',
        name: 'Personal brain',
        status: { label: 'Daily use', tone: 'live' },
        line: 'Markdown in git that my assistant and agents read and write.',
        href: '/projects/personal-brain',
      },
      {
        id: 'business-brain',
        name: 'Business brain',
        status: { label: 'Running', tone: 'live' },
        line: 'A research pipeline that scores ideas with cited evidence.',
        href: '/projects/personal-brain#business-brain',
        depth: 1,
      },
      {
        id: 'finance-brain',
        name: 'Finance brain',
        status: { label: 'In progress', tone: 'private' },
        line: 'The first brain with a vault. Trying a new way in.',
        href: '/projects/personal-brain#finance-brain',
        depth: 1,
      },
    ],
  },
  {
    title: 'Products',
    rows: [
      {
        id: 'duo-decide',
        name: 'Duo Decide',
        status: { label: 'In build', tone: 'build' },
        line: 'A decision app for couples. Vote or poll, together.',
        href: '/projects/duo-decide',
      },
      {
        id: 'thread-quest',
        name: 'Thread Quest',
        status: { label: 'Being expanded', tone: 'private' },
        line: 'A closet and style tool: save the clothes you like and build outfits from them.',
        href: '/projects/thread-quest',
        fresh: { ageDays: 2, lifeDays: 14 },
      },
      {
        id: 'one-rep',
        name: 'One Rep',
        status: { label: 'Being overhauled', tone: 'private' },
        line: 'Ten reps between work sessions, and a simple way to log them.',
        href: '/beyond#one-rep',
      },
      {
        id: 'this-site',
        name: 'This site',
        status: { label: 'In build', tone: 'build' },
        line: 'chasewcole.com, being rebuilt as a living record of my work. You are on it.',
        href: '/',
      },
    ],
  },
];

/** The same index with no new marks: nothing has changed lately. */
export const quietGroups: ProjectIndexGroup[] = groups.map((group) => ({
  ...group,
  rows: group.rows.map((row) => ({ ...row, fresh: null })),
}));
