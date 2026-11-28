import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  createNextStepController,
  type NextStepEnv,
  type NextStepKind,
  type NextStepPlacement,
} from './controller';

const timings = { idle: 6000, repeat: 12000, plays: 3, hint: 1400, cue: 2000 };

function setup(
  options: { placement?: NextStepPlacement; canHint?: boolean; canScroll?: boolean } = {},
) {
  const state = { placement: 'inView' as NextStepPlacement, canHint: true, canScroll: true };
  Object.assign(state, options);
  const plays: NextStepKind[] = [];
  const stops: NextStepKind[] = [];
  const env: NextStepEnv = {
    canHint: () => state.canHint,
    placement: () => state.placement,
    canScroll: () => state.canScroll,
    play: (kind) => plays.push(kind),
    stop: (kind) => stops.push(kind),
  };
  const controller = createNextStepController(env, timings);
  return { controller, plays, stops, state };
}

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('createNextStepController', () => {
  it('plays the hint once the visitor has rested for the idle time, then stops it', () => {
    const { plays, stops } = setup();
    vi.advanceTimersByTime(5999);
    expect(plays).toEqual([]);
    vi.advanceTimersByTime(1);
    expect(plays).toEqual(['hint']);
    vi.advanceTimersByTime(1400);
    expect(stops).toEqual(['hint']);
  });

  it('restarts the idle clock on any activity', () => {
    const { controller, plays } = setup();
    vi.advanceTimersByTime(5000);
    controller.activity();
    vi.advanceTimersByTime(5000);
    expect(plays).toEqual([]);
    vi.advanceTimersByTime(1000);
    expect(plays).toEqual(['hint']);
  });

  it('repeats every 12 seconds while the visitor keeps resting, at most three times', () => {
    const { controller, plays } = setup();
    vi.advanceTimersByTime(6000);
    expect(plays).toHaveLength(1);
    vi.advanceTimersByTime(11_999);
    expect(plays).toHaveLength(1);
    vi.advanceTimersByTime(1);
    expect(plays).toHaveLength(2);
    vi.advanceTimersByTime(12_000);
    expect(plays).toHaveLength(3);
    vi.advanceTimersByTime(120_000);
    controller.activity();
    vi.advanceTimersByTime(120_000);
    expect(plays).toHaveLength(3);
  });

  it('waits a full rest after activity even when a repeat is due', () => {
    const { controller, plays } = setup();
    vi.advanceTimersByTime(6000);
    vi.advanceTimersByTime(11_000);
    controller.activity();
    vi.advanceTimersByTime(5999);
    expect(plays).toHaveLength(1);
    vi.advanceTimersByTime(1);
    expect(plays).toHaveLength(2);
  });

  it('never plays again once the target is engaged, and stops a running hint', () => {
    const { controller, plays, stops } = setup();
    vi.advanceTimersByTime(6500);
    controller.engage();
    expect(stops).toEqual(['hint']);
    controller.activity();
    vi.advanceTimersByTime(60_000);
    expect(plays).toEqual(['hint']);
  });

  it('does not play while a hint is unwelcome, and plays after a rest once it is', () => {
    const { plays, state } = setup({ canHint: false });
    vi.advanceTimersByTime(30_000);
    expect(plays).toEqual([]);
    state.canHint = true;
    vi.advanceTimersByTime(6000);
    expect(plays).toEqual(['hint']);
  });

  it('runs no timers while hidden and starts a fresh rest when shown', () => {
    const { controller, plays } = setup();
    vi.advanceTimersByTime(3000);
    controller.hidden(true);
    expect(vi.getTimerCount()).toBe(0);
    vi.advanceTimersByTime(60_000);
    expect(plays).toEqual([]);
    controller.hidden(false);
    vi.advanceTimersByTime(5999);
    expect(plays).toEqual([]);
    vi.advanceTimersByTime(1);
    expect(plays).toEqual(['hint']);
  });

  it('shows the scroll cue when the target is below the fold, and ends it on scroll', () => {
    const { controller, plays, stops, state } = setup({ placement: 'below' });
    vi.advanceTimersByTime(6000);
    expect(plays).toEqual(['cue']);
    vi.advanceTimersByTime(500);
    controller.activity('scroll');
    expect(stops).toEqual(['cue']);
    // Scrolled the target into view: the in-place hint takes over after a rest.
    state.placement = 'inView';
    vi.advanceTimersByTime(12_000);
    expect(plays).toEqual(['cue', 'hint']);
  });

  it('holds the cue back while the visitor has scrolled recently', () => {
    const { controller, plays } = setup({ placement: 'below' });
    vi.advanceTimersByTime(1000);
    controller.activity('scroll');
    vi.advanceTimersByTime(6000);
    expect(plays).toEqual([]);
    vi.advanceTimersByTime(6000);
    expect(plays).toEqual(['cue']);
  });

  it('never shows the cue on a page that cannot scroll, or for a target out of reach', () => {
    const flat = setup({ placement: 'below', canScroll: false });
    vi.advanceTimersByTime(60_000);
    expect(flat.plays).toEqual([]);
    flat.controller.destroy();
    const away = setup({ placement: 'away' });
    vi.advanceTimersByTime(60_000);
    expect(away.plays).toEqual([]);
  });

  it('clears every timer on destroy', () => {
    const { controller } = setup();
    vi.advanceTimersByTime(6000);
    controller.destroy();
    expect(vi.getTimerCount()).toBe(0);
  });
});
