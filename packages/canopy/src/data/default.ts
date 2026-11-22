import type { CanopyData, CanopyShoot } from '../types';

const open = (id: string, label: string, note: string): CanopyShoot => ({
  id,
  label,
  note,
  state: 'open',
});

/**
 * The default tree: personal projects only. Every `href` is a route of the site (or an anchor on
 * one). Pass your own `CanopyData` to draw a different tree.
 */
export const defaultCanopyData: CanopyData = {
  root: { id: 'chase', label: 'Chase Cole' },
  nodes: [
    {
      id: 'pas',
      label: 'PAS',
      parent: null,
      kind: 'system',
      status: 'Daily use',
      weight: 5,
      page: true,
      href: '/projects/pas',
      oneLine: 'My personal assistant system: Atti and the projects that run under it.',
      shoots: [
        open('pas-public-release', 'Public release', 'Maybe someday. Not planned yet.'),
        open(
          'pas-context-engine',
          'Context engine',
          'Open question: one memory layer that picks what each agent sees, from Atti to coding sessions.',
        ),
        open(
          'pas-finance-gateway',
          'Finance gateway',
          'Atti asks the finance brain fixed questions and gets answers only, never raw data. Parked.',
        ),
      ],
    },
    {
      id: 'atti',
      label: 'Atti',
      parent: 'pas',
      kind: 'system',
      status: 'Daily use',
      weight: 4,
      page: true,
      href: '/projects/pas/atti',
      oneLine:
        'Claude is the model. Atti is everything around it: the harness, the memory, the persona and the channels.',
      shoots: [
        open(
          'atti-nightly-dreaming',
          'Nightly dreaming',
          'Each night, fold the day’s corrections into memory, and keep a change only if evals pass.',
        ),
        open(
          'atti-listening',
          'Listening for commitments',
          'Catch spoken commitments and propose them as tasks. Spec written, waiting on a decision.',
        ),
        open(
          'atti-build-from-conversation',
          'Build from a conversation',
          'Turn a spec from a chat into a draft pull request. Built, parked for now.',
        ),
        open(
          'atti-always-on',
          'Always-on agent session',
          'Keep one agent session warm so replies come a few seconds faster. Parked until Atti is stable.',
        ),
      ],
    },
    {
      id: 'lifebox',
      label: 'Lifebox',
      parent: 'atti',
      kind: 'both',
      status: 'Experiment',
      weight: 2,
      page: true,
      href: '/projects/pas/lifebox',
      oneLine: 'Planned as Atti’s phone app. Part of the system, and a product in its own right.',
      shoots: [
        open(
          'lifebox-phone-app',
          'Atti’s phone app',
          'Becomes the phone interface for Atti: capture goes in, a Now feed of open tasks comes out.',
        ),
        open(
          'lifebox-release-per-user',
          'A release per user',
          'Open problem: an iOS build takes 30 to 60 minutes, and here every user gets their own.',
        ),
        open(
          'lifebox-one-to-all',
          'From one user to all',
          'How a change made for one person graduates: Personal, then Popular, Community, Core.',
        ),
      ],
    },
    {
      id: 'duo-decide',
      label: 'Duo Decide',
      parent: null,
      kind: 'product',
      status: 'In build',
      weight: 5,
      page: true,
      href: '/projects/duo-decide',
      oneLine: 'A decision app for couples.',
      shoots: [
        open('duo-app-store', 'App Store release', 'The goal: ship it on the App Store.'),
        open(
          'duo-split-vote',
          'Who wins a split vote?',
          'Answered: in round 3 of a poll, the partner who didn’t start it makes the final pick.',
        ),
        open(
          'duo-notifications',
          'Notifications',
          'Tell you when your partner votes, or a poll moves to the next round.',
        ),
        open(
          'duo-plan-after',
          'Plan after deciding',
          'Once a decision is made, plan it together: when, where, notes and links, kept in history.',
        ),
        open(
          'duo-ai-merge',
          'When AI may merge',
          'Open question: which tests and checks let the AI pipeline merge a change without review?',
        ),
      ],
    },
    {
      id: 'ai-system',
      label: 'AI system',
      parent: null,
      kind: 'system',
      status: 'First version',
      weight: 4,
      page: true,
      href: '/projects/ai-system',
      oneLine: 'My first pipeline: it takes a task from plan to code to pull request.',
      shoots: [
        open('ai-rebuild', 'Rebuild as Distill', 'The next version of the pipeline.'),
        open(
          'ai-model-cascade',
          'Model cascade with a verifier',
          'Try a cheaper model first and let a verifier decide when to escalate.',
        ),
        open(
          'ai-reranked-search',
          'Reranked memory search',
          'Rerank what the brain retrieves; paraphrased questions are the gap today.',
        ),
      ],
    },
    {
      id: 'distill',
      label: 'Distill',
      parent: 'ai-system',
      kind: 'system',
      status: 'Next version',
      weight: 2,
      page: false,
      href: '/projects/ai-system#distill',
      oneLine: 'The next version of the pipeline, being built now.',
    },
    {
      id: 'personal-brain',
      label: 'Personal brain',
      parent: null,
      kind: 'system',
      status: 'Daily use',
      weight: 4,
      page: true,
      href: '/projects/personal-brain',
      oneLine:
        'The knowledge base my agents read and write: markdown in git, with a sealed vault the tools cannot read.',
      shoots: [
        open(
          'brain-lessons',
          'Lessons and quizzes',
          'Turn study notes into short lessons and quizzes, like a learning app. Parked.',
        ),
        open(
          'brain-books',
          'Learning from books',
          'Proposed: an agent distills a book or podcast into study notes, filed by topic.',
        ),
      ],
    },
    {
      id: 'finance-brain',
      label: 'Finance brain',
      parent: 'personal-brain',
      kind: 'system',
      status: 'In progress',
      weight: 2,
      page: false,
      href: '/projects/personal-brain#finance-brain',
      oneLine: 'The first brain with a vault. A new approach is in progress.',
      shoots: [
        open(
          'finance-new-approach',
          'New approach to bank data',
          'The first approach was too much; trying another.',
        ),
        open(
          'finance-gated-insights',
          'Gated AI insights',
          'Planned insights read the data only through egress gates; raw records never reach a model.',
        ),
      ],
    },
    {
      id: 'business-brain',
      label: 'Business brain',
      parent: 'personal-brain',
      kind: 'system',
      status: 'Running',
      weight: 1,
      page: false,
      href: '/projects/personal-brain#business-brain',
      oneLine: 'A weekly research pipeline. Every claim is cited.',
      shoots: [
        open(
          'business-signals',
          'Signals over time',
          'Planned: a view of how research signals change, once there are weeks of real runs.',
        ),
      ],
    },
    {
      id: 'thread-quest',
      label: 'Thread Quest',
      parent: null,
      kind: 'product',
      status: 'Being expanded',
      weight: 2,
      page: true,
      href: '/projects/thread-quest',
      oneLine: 'A closet and style tool: save the clothes you like and build outfits from them.',
      shoots: [
        open(
          'thread-buy-in-app',
          'Buy inside the app',
          'Later: buying without leaving the app. It needs legal work first, so for now each piece opens on the store’s site.',
        ),
        open(
          'thread-ai-gathered',
          'AI-gathered pieces',
          'Use AI to gather clothes you like into your closet.',
        ),
        open('thread-browser-plugin', 'Shopping browser plugin', 'Capture pieces while you shop.'),
      ],
    },
    {
      id: 'one-rep',
      label: 'One Rep',
      parent: null,
      kind: 'product',
      status: 'Being overhauled',
      weight: 1,
      page: false,
      href: '/beyond#one-rep',
      open: 'Open in Beyond',
      oneLine: 'Ten reps between work sessions, and a simple way to log them.',
    },
    {
      id: 'this-site',
      label: 'This site',
      parent: null,
      kind: 'product',
      status: 'In build',
      weight: 1,
      page: false,
      href: '/',
      open: 'You are on it: go to Home',
      oneLine: 'chasewcole.com, rebuilt. This site is the project.',
      shoots: [
        open(
          'site-updates',
          'Updates from GitHub',
          'Planned features and releases feed this graph on a schedule.',
        ),
        open(
          'site-agent-review',
          'An agent reviews every post',
          'A fresh agent passes, holds or rejects each draft. The scanner is built; the reviewer is next.',
        ),
        open(
          'site-building-in-public',
          'Building in public',
          'Phase 2: a place for who Chase is, what he talks about and what he builds.',
        ),
      ],
    },
  ],
  flows: [
    { from: 'personal-brain', to: 'atti', label: 'Atti reads and writes the brain' },
    {
      from: 'ai-system',
      to: 'duo-decide',
      label: 'The pipeline opened pull requests on Duo Decide',
    },
    { from: 'ai-system', to: 'personal-brain', label: 'The pipeline’s engine serves the brains' },
    { from: 'finance-brain', to: 'personal-brain', label: 'Feeds the personal brain' },
    { from: 'business-brain', to: 'personal-brain', label: 'Feeds the personal brain' },
  ],
  start: ['pas', 'duo-decide', 'ai-system'],
};
