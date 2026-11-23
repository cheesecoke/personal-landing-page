import { afterEach, describe, expect, it, vi } from 'vitest';

import { isoDateSchema, isoToday, lineSchema, monthSchema, slugSchema } from './shared';

afterEach(() => {
  vi.useRealTimers();
});

const freeze = (isoDate: string) => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(`${isoDate}T12:00:00Z`));
};

describe('IsoDate', () => {
  it('accepts today and earlier, rejects tomorrow', () => {
    freeze('2026-11-22');
    expect(isoToday()).toBe('2026-11-22');
    expect(isoDateSchema.safeParse('2026-11-22').success).toBe(true);
    expect(isoDateSchema.safeParse('2024-12-09').success).toBe(true);
    expect(isoDateSchema.safeParse('2026-11-23').success).toBe(false);
  });

  it.each(['2026-02-30', '2026-13-01', '2026-1-5', '22 Nov 2026', '2026-11-22T00:00:00Z', ''])(
    'rejects %j',
    (value) => {
      expect(isoDateSchema.safeParse(value).success).toBe(false);
    },
  );
});

describe('Month', () => {
  it('accepts this month and earlier, rejects next month and finer dates', () => {
    freeze('2026-11-22');
    expect(monthSchema.safeParse('2026-11').success).toBe(true);
    expect(monthSchema.safeParse('2026-01').success).toBe(true);
    expect(monthSchema.safeParse('2026-12').success).toBe(false);
    expect(monthSchema.safeParse('2026-11-22').success).toBe(false);
    expect(monthSchema.safeParse('2026-00').success).toBe(false);
  });
});

describe('Line', () => {
  it.each([
    'Redesign v2 merged.',
    'Decided decisions can be archived; deletes became soft.',
    'x'.repeat(140),
  ])('accepts %j', (value) => {
    expect(lineSchema.safeParse(value).success).toBe(true);
  });

  it.each([
    ['empty', ''],
    ['over 140 characters', 'x'.repeat(141)],
    ['a URL', 'See https://example.com for more.'],
    ['an upper-case URL', 'See HTTP://EXAMPLE.COM for more.'],
    ['a www address', 'See www.example.com for more.'],
    ['a ticket reference', 'Fixed in #123.'],
    ['a leading space', ' Redesign v2 merged.'],
    ['a trailing space', 'Redesign v2 merged. '],
    ['two lines', 'Redesign v2 merged.\nAnd more.'],
  ])('rejects %s', (_name, value) => {
    expect(lineSchema.safeParse(value).success).toBe(false);
  });
});

describe('slug', () => {
  it('is kebab-case', () => {
    expect(slugSchema.safeParse('duo-decide').success).toBe(true);
    expect(slugSchema.safeParse('Duo Decide').success).toBe(false);
    expect(slugSchema.safeParse('duo--decide').success).toBe(false);
  });
});
