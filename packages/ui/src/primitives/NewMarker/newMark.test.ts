import { describe, expect, it } from 'vitest';

import { newMark } from './newMark';

describe('newMark', () => {
  it('draws a full ring on day 0', () => {
    expect(newMark({ ageDays: 0, lifeDays: 14 })).toEqual({
      dash: 100,
      text: 'New · today',
      spoken: 'New, updated today',
    });
  });

  it('drains with age, as on the board (2 of 14 days leaves 86, 10 of 14 leaves 29)', () => {
    expect(newMark({ ageDays: 2, lifeDays: 14 })?.dash).toBe(86);
    expect(newMark({ ageDays: 10, lifeDays: 14 })?.dash).toBe(29);
    expect(newMark({ ageDays: 2, lifeDays: 30 })?.dash).toBe(93);
  });

  it('never draws less than 4 while the mark lives', () => {
    expect(newMark({ ageDays: 29, lifeDays: 30 })?.dash).toBe(4);
  });

  it('is gone on the last day of its life and after', () => {
    expect(newMark({ ageDays: 14, lifeDays: 14 })).toBeNull();
    expect(newMark({ ageDays: 40, lifeDays: 14 })).toBeNull();
  });

  it('writes the age for the eye and for a screen reader', () => {
    expect(newMark({ ageDays: 1, lifeDays: 14 })).toMatchObject({
      text: 'New · 1d',
      spoken: 'New, updated 1 day ago',
    });
    expect(newMark({ ageDays: 3, lifeDays: 14 })).toMatchObject({
      text: 'New · 3d',
      spoken: 'New, updated 3 days ago',
    });
  });

  it('draws nothing for a date in the future or a lifetime that makes no sense', () => {
    expect(newMark({ ageDays: -1, lifeDays: 14 })).toBeNull();
    expect(newMark({ ageDays: 1, lifeDays: 0 })).toBeNull();
    expect(newMark({ ageDays: Number.NaN, lifeDays: 14 })).toBeNull();
  });
});
