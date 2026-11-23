import { describe, expect, it } from 'vitest';

import { timelineX } from './useNavTimeline';

describe('timelineX', () => {
  it('is the distance from the row edge to the centre of the active item', () => {
    expect(timelineX({ left: 120 }, { left: 1000, width: 80 })).toBe(920);
  });

  it('rounds to half a pixel', () => {
    expect(timelineX({ left: 0 }, { left: 10.1, width: 20.2 })).toBe(20);
    expect(timelineX({ left: 0 }, { left: 10.2, width: 20.4 })).toBe(20.5);
  });
});
