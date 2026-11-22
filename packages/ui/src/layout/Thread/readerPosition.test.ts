import { describe, expect, it } from 'vitest';

import {
  ACTIVATION_LINE,
  activeNode,
  fillScale,
  fillTarget,
  isAtEnd,
  nodeState,
  readerPosition,
} from './readerPosition';

// A 900px viewport over a 4900px page: 4000px of scroll.
const view = { viewport: 900, maxScroll: 4000, end: 4300 };
const line = 900 * ACTIVATION_LINE; // 360

describe('readerPosition', () => {
  it('is scroll plus the activation line at 40% of the viewport', () => {
    expect(readerPosition(0, view)).toBe(line);
    expect(readerPosition(1000, view)).toBe(1000 + line);
  });

  it('clamps scroll to the scrollable range (rubber-band overscroll)', () => {
    expect(readerPosition(-120, view)).toBe(line);
    expect(readerPosition(9999, { ...view, end: 4000 })).toBe(4000 + line);
  });

  it('lights the whole thread on a page that does not scroll', () => {
    expect(readerPosition(0, { viewport: 900, maxScroll: 0, end: 700 })).toBe(Infinity);
    expect(readerPosition(0, { viewport: 900, maxScroll: 1, end: 700 })).toBe(Infinity);
  });

  it('adds nothing when the end is within reach of the activation line', () => {
    const reachable = { viewport: 900, maxScroll: 4000, end: 4200 };
    expect(readerPosition(3990, reachable)).toBe(3990 + line);
    expect(readerPosition(4000, reachable)).toBe(4000 + line);
  });

  describe('end-of-page rule', () => {
    // end 4800 is 440px below what the line reaches at max scroll (4360).
    const short = { viewport: 900, maxScroll: 4000, end: 4800 };
    const shortfall = 4800 - (4000 + line); // 440
    const zone = Math.max(900 * 0.5, shortfall * 1.25); // 550

    it('leaves the reader alone before the zone starts', () => {
      expect(readerPosition(4000 - zone, short)).toBe(4000 - zone + line);
      expect(readerPosition(1000, short)).toBe(1000 + line);
    });

    it('adds the shortfall linearly across the zone', () => {
      const half = 4000 - zone / 2;
      expect(readerPosition(half, short)).toBeCloseTo(half + line + shortfall / 2, 6);
    });

    it('reaches the end exactly at max scroll', () => {
      expect(readerPosition(4000, short)).toBe(4800);
    });

    it('uses half a viewport as the zone when the shortfall is small', () => {
      const small = { viewport: 900, maxScroll: 4000, end: 4400 }; // shortfall 40, zone 450
      expect(readerPosition(4000 - 450, small)).toBe(4000 - 450 + line);
      expect(readerPosition(4000 - 225, small)).toBeCloseTo(4000 - 225 + line + 20, 6);
      expect(readerPosition(4000, small)).toBe(4400);
    });

    it('never makes the zone longer than the page scrolls', () => {
      const tiny = { viewport: 900, maxScroll: 200, end: 1000 }; // shortfall 440, zone capped at 200
      expect(readerPosition(0, tiny)).toBe(line);
      expect(readerPosition(100, tiny)).toBeCloseTo(100 + line + 220, 6);
      expect(readerPosition(200, tiny)).toBe(1000);
    });

    it('never moves backwards as the reader scrolls down', () => {
      let previous = -Infinity;
      for (let s = 0; s <= 4000; s += 7) {
        const reader = readerPosition(s, short);
        expect(reader).toBeGreaterThanOrEqual(previous);
        previous = reader;
      }
    });
  });
});

describe('node states', () => {
  const nodes = [300, 1200, 2600, 4100, 4800];
  const page = { viewport: 900, maxScroll: 4000, end: 4800 };

  const statesAt = (scroll: number) => {
    const on = activeNode(nodes, readerPosition(scroll, page));
    return nodes.map((_, index) => nodeState(index, on));
  };

  it('has the first node on at scroll 0', () => {
    expect(statesAt(0)).toEqual(['on', 'next', 'next', 'next', 'next']);
  });

  it('has the last node on at max scroll, and every other node past', () => {
    expect(statesAt(4000)).toEqual(['past', 'past', 'past', 'past', 'on']);
  });

  it('never skips a node while scrolling down', () => {
    let previous = activeNode(nodes, readerPosition(0, page));
    for (let s = 0; s <= 4000; s += 5) {
      const on = activeNode(nodes, readerPosition(s, page));
      expect(on - previous).toBeGreaterThanOrEqual(0);
      expect(on - previous).toBeLessThanOrEqual(1);
      previous = on;
    }
    expect(previous).toBe(nodes.length - 1);
  });

  it('has no node on while the reader is above the first one', () => {
    expect(activeNode([800, 1600], 360)).toBe(-1);
    expect(nodeState(0, -1)).toBe('next');
  });

  it('turns a node on half a pixel early (sub-pixel layout)', () => {
    expect(activeNode([360.4], 360)).toBe(0);
    expect(activeNode([360.6], 360)).toBe(-1);
  });

  it('lights every node on a page that does not scroll, the last one on', () => {
    const on = activeNode(nodes, readerPosition(0, { viewport: 900, maxScroll: 0, end: 4800 }));
    expect(nodes.map((_, index) => nodeState(index, on))).toEqual([
      'past',
      'past',
      'past',
      'past',
      'on',
    ]);
  });
});

describe('isAtEnd', () => {
  it('is true within a pixel of max scroll, and on a page that does not scroll', () => {
    expect(isAtEnd(3999, view)).toBe(true);
    expect(isAtEnd(3998, view)).toBe(false);
    expect(isAtEnd(0, { ...view, maxScroll: 0 })).toBe(true);
  });
});

describe('fill', () => {
  const rail = { top: 200, height: 4000 };

  it('scales from the rail top to the reader', () => {
    expect(fillScale(rail, 200, 4200)).toBe(0);
    expect(fillScale(rail, 2200, 4200)).toBe(0.5);
    expect(fillScale(rail, 4200, 4200)).toBe(1);
  });

  it('clamps above the rail, below it, and to the end of the thread', () => {
    expect(fillScale(rail, 0, 4200)).toBe(0);
    expect(fillScale(rail, 9000, 4200)).toBe(1);
    expect(fillScale(rail, Infinity, 4200)).toBe(1);
    expect(fillScale(rail, 4200, 2200)).toBe(0.5);
    expect(fillScale({ top: 0, height: 0 }, 100, 100)).toBe(0);
  });

  it('follows the reader when motion is allowed', () => {
    expect(
      fillTarget({ reader: 1500, on: 1, nodes: [300, 1200], reduced: false, atEnd: false }),
    ).toBe(1500);
  });

  it('steps to the active node with reduced motion', () => {
    const nodes = [300, 1200];
    expect(fillTarget({ reader: 1500, on: 1, nodes, reduced: true, atEnd: false })).toBe(1200);
    expect(fillTarget({ reader: 100, on: -1, nodes, reduced: true, atEnd: false })).toBe(-Infinity);
  });

  it('completes at the end even with reduced motion', () => {
    expect(
      fillTarget({ reader: 4800, on: 1, nodes: [300, 1200], reduced: true, atEnd: true }),
    ).toBe(4800);
  });
});
