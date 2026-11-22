import { describe, expect, it } from 'vitest';

import { toStardate } from './stardate';

describe('toStardate', () => {
  it('writes the year and the day of the year', () => {
    expect(toStardate('2026-11-20')).toBe('2026.324');
    expect(toStardate('2026-10-06')).toBe('2026.279');
  });

  it('pads the day to three digits', () => {
    expect(toStardate('2026-01-01')).toBe('2026.001');
    expect(toStardate('2026-04-24')).toBe('2026.114');
  });

  it('counts the leap day', () => {
    expect(toStardate('2028-12-31')).toBe('2028.366');
  });

  it('reads a Date as UTC', () => {
    expect(toStardate(new Date('2026-06-03T23:30:00Z'))).toBe('2026.154');
  });

  it('rejects something that is not a date', () => {
    expect(() => toStardate('soon')).toThrow(RangeError);
  });
});
