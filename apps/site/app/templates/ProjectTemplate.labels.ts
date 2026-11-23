import type { ReleaseChannel, RingWeight, ShootLabels } from '@cwc/ui';

/**
 * The words around a project's live data: the log panel, its not-yet-grown list, the branch rings
 * and the release panel. They are the words on the Captain's log and Branch rings boards. Hand
 * content has no place for them yet, so they live here, in one file, and reach the template as a
 * prop.
 */
export interface ProjectLabels {
  log: {
    /** Where a project's entries come from, by slug. A project not named here shows no source. */
    source: Readonly<Record<string, string>>;
    /** Beside a release entry's version. */
    release: string;
  };
  shoots: ShootLabels & { title: string };
  rings: {
    title: string;
    growing: string;
    still: string;
    /** The line under the panel, before and after the project's name. */
    note: { lead: string; period: string; release: string };
    weight: Record<RingWeight, string>;
  };
  release: {
    title: string;
    notes: string;
    asOf: string;
    channels: Record<ReleaseChannel, string>;
  };
}

export const projectLabels: ProjectLabels = {
  log: {
    source: {
      'duo-decide': 'From GitHub and Linear',
      pas: 'From GitHub and Linear',
      atti: 'From GitHub',
      lifebox: 'From GitHub and the design notes',
      'ai-system': 'From GitHub',
      'personal-brain': 'From GitHub',
      'thread-quest': 'From GitHub',
    },
    release: 'Release notes',
  },
  shoots: {
    title: 'Not yet grown',
    kind: { goal: 'Goal', idea: 'Idea', question: 'Question' },
    state: { open: 'Not yet grown', grown: 'Grown', answered: 'Answered' },
  },
  rings: {
    title: 'Branch rings',
    growing: 'Growing: this quarter',
    still: 'No ring growing',
    note: {
      lead: 'Branch section',
      period: 'Each ring is a quarter of work.',
      release: 'Each ring is a release.',
    },
    weight: { 1: 'lean', 2: 'steady', 3: 'busy', 4: 'busiest' },
  },
  release: {
    title: 'Latest release',
    notes: 'Release notes',
    asOf: 'As of',
    channels: {
      'app-store': 'App Store',
      'play-store': 'Play Store',
      testflight: 'TestFlight',
      web: 'Web',
    },
  },
};

/** The words around the job page's log. The log itself is off. */
export interface JobLabels {
  /** The readout on the right of the log's header. */
  source: string;
  /** The word before the month the role began. */
  since: string;
}

export const jobLabels: JobLabels = { source: 'Monthly', since: 'since' };
