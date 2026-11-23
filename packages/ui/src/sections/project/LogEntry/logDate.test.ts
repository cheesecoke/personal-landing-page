import { describe, expect, it } from 'vitest';

import { formatLogDate, formatLogMonth, monthEnd } from './logDate';

describe('formatLogDate', () => {
  it('prints a day the way the boards do', () => {
    expect(formatLogDate('2026-11-05')).toBe('5 Nov 2026');
    expect(formatLogDate('2024-12-10')).toBe('10 Dec 2024');
  });

  it('prints a stretch of days', () => {
    expect(formatLogDate('2026-09-19', '2026-09-14')).toBe('14 to 19 Sep 2026');
    expect(formatLogDate('2026-11-05', '2026-10-28')).toBe('28 Oct to 5 Nov 2026');
    expect(formatLogDate('2026-01-03', '2025-12-29')).toBe('29 Dec 2025 to 3 Jan 2026');
    expect(formatLogDate('2026-09-19', '2026-09-19')).toBe('19 Sep 2026');
  });

  it('leaves a value it cannot read alone', () => {
    expect(formatLogDate('soon')).toBe('soon');
  });
});

describe('months', () => {
  it('prints a month and finds its last day', () => {
    expect(formatLogMonth('2026-10')).toBe('October 2026');
    expect(monthEnd('2026-10')).toBe('2026-10-31');
    expect(monthEnd('2026-09')).toBe('2026-09-30');
    expect(monthEnd('2028-02')).toBe('2028-02-29');
  });
});
