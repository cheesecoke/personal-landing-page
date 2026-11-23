import { describe, expect, it } from 'vitest';

import { lintSource } from './token-lint';

const rules = (file: string, source: string) => lintSource(file, source).map((f) => f.rule);

describe('token-lint', () => {
  it('flags hex colours in CSS and in TSX strings', () => {
    expect(rules('a.module.css', '.a { color: #6FE3D2; }')).toEqual(['literal-colour']);
    expect(rules('A.tsx', "<div style={{ color: '#07080A' }} />")).toEqual(['literal-colour']);
    expect(rules('A.tsx', '<path stroke="#fff" />')).toEqual(['literal-colour']);
  });

  it('flags literal colour functions but not ones built from tokens', () => {
    expect(rules('a.css', '.a { box-shadow: 0 0 12px rgba(111,227,210,.6); }')).toEqual([
      'literal-colour',
    ]);
    expect(rules('a.css', '.a { color: rgb(from var(--palette-signal) r g b / 0.6); }')).toEqual(
      [],
    );
  });

  it('flags raw durations but allows zero and tokens', () => {
    expect(rules('a.css', '.a { transition: width .6s; }')).toEqual(['raw-duration']);
    expect(rules('a.css', '.a { animation-duration: 400ms; }')).toEqual(['raw-duration']);
    expect(rules('A.tsx', "const t = 'opacity 0.4s';")).toEqual(['raw-duration']);
    expect(rules('A.tsx', '<i className="transition-colors duration-300" />')).toEqual([
      'raw-duration',
    ]);
    expect(rules('A.tsx', '<i className="motion-ok:transition-colors duration-hover" />')).toEqual(
      [],
    );
    expect(rules('a.css', '.a { transition-duration: 0s; }')).toEqual([]);
    expect(rules('a.css', '.a { transition: width var(--duration-nav) var(--ease-out); }')).toEqual(
      [],
    );
  });

  it('does not mistake other values for colours or durations', () => {
    expect(
      rules('a.css', '.a { width: 9px; flex: 1 1 0; grid-template-columns: 1fr 2fr; }'),
    ).toEqual([]);
    expect(rules('A.tsx', '<a href="#main" className="min-h-touch p-2.5">Skip</a>')).toEqual([]);
    expect(rules('A.tsx', 'const ms = 400; // 0.4s as a number is a token lookup')).toEqual([]);
  });

  it('flags Signal and Ember in one component, but not in its stories', () => {
    const source = '<i className="bg-signal" />\n<i className="bg-ember" />';
    expect(rules('Dot.tsx', source)).toEqual(['signal-with-ember']);
    expect(rules('Dot.stories.tsx', source)).toEqual([]);
    expect(
      rules('Dot.tsx', '<i className="bg-status-build" /><i className="bg-status-live" />'),
    ).toEqual([]);
  });

  it('skips a line marked token-lint-ignore', () => {
    expect(rules('a.css', '.a { color: #fff; } /* token-lint-ignore: svg mask */')).toEqual([]);
  });
});
