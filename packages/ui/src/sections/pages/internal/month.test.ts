import { describe, expect, it } from 'vitest';

import { formatMonth, tenureMonths } from './month';

describe('formatMonth', () => {
  it('writes a month out in full', () => {
    expect(formatMonth('2026-01')).toBe('January 2026');
    expect(formatMonth('2026-11')).toBe('November 2026');
    expect(formatMonth('2025-12')).toBe('December 2025');
  });

  it('leaves anything that is not a month alone', () => {
    expect(formatMonth('soon')).toBe('soon');
    expect(formatMonth('2026-13')).toBe('2026-13');
  });
});

describe('tenureMonths', () => {
  it('counts whole months from the start month', () => {
    expect(tenureMonths('2026-01', '2026-11-22')).toBe(10);
    expect(tenureMonths('2026-01', '2026-01-31')).toBe(0);
    expect(tenureMonths('2024-11', '2026-11')).toBe(24);
  });

  it('is never negative and survives bad input', () => {
    expect(tenureMonths('2027-01', '2026-11-22')).toBe(0);
    expect(tenureMonths('nope', '2026-11-22')).toBe(0);
  });
});
