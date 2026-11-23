import type { ReactNode } from 'react';

/** The four drawings on the Beyond board. */
export type BeyondIconName = 'sessions' | 'clips' | 'references' | 'reps';

const frame = {
  width: 34,
  height: 24,
  viewBox: '0 0 34 24',
  fill: 'none',
  strokeWidth: 1,
} as const;

// The bars of the `reps` drawing: ten short ones and the seventh tall.
const reps = [1.5, 4.9, 8.3, 11.7, 15.1, 18.5, 21.9, 25.3, 28.7, 32.1];

/** One of the board's 34 x 24 line drawings, in token colours. Decoration only. */
export const beyondIcons: Record<BeyondIconName, ReactNode> = {
  // A screen with a play mark: the long work sessions.
  sessions: (
    <svg {...frame} className="stroke-ash">
      <rect x="0.5" y="0.5" width="33" height="23" rx="2" />
      <path d="M14 7.5v9l7.5-4.5z" className="stroke-bone" />
    </svg>
  ),
  // A cut out of a longer line: one moment from a session.
  clips: (
    <svg {...frame}>
      <path d="M1 12h32" className="stroke-tick" />
      <path d="M12.5 5v14M21.5 5v14" className="stroke-ash" />
      <path d="M12.5 12h9" className="stroke-bone" strokeWidth={2} />
    </svg>
  ),
  // A stack of cards: the notes and links.
  references: (
    <svg {...frame}>
      <rect x="8.5" y="0.5" width="22" height="15" rx="1.5" className="stroke-line-tick-major" />
      <rect x="4.5" y="4.5" width="22" height="15" rx="1.5" className="fill-ground stroke-smoke" />
      <rect x="0.5" y="8.5" width="22" height="15" rx="1.5" className="fill-ground stroke-bone" />
      <path d="M4 14h12M4 18h8" className="stroke-smoke" />
    </svg>
  ),
  // Ten marks, one taller: a rep between sessions.
  reps: (
    <svg {...frame}>
      {reps.map((x, index) =>
        index === 6 ? (
          <path key={x} d={`M${x} 6V20`} className="stroke-bone" strokeWidth={1.5} />
        ) : (
          <path key={x} d={`M${x} 13V20`} className="stroke-tick" />
        ),
      )}
    </svg>
  ),
};
