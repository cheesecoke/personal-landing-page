import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createTouches, SAME_MS, TICK_GAP_MS, VIBRATE } from './touches';

/** The page under test: a nav, a soft tree, a silent control, the portal, a field, the game. */
const PAGE = `
  <nav><a href="/a" id="a">A</a><a href="/b" id="b"><span id="b-inner">B</span></a></nav>
  <button id="btn">Go</button>
  <button id="off" disabled>Off</button>
  <div data-ui-sound="soft"><button id="row">Row</button></div>
  <div data-ui-sound="none"><a href="/q" id="quiet">Quiet</a></div>
  <button id="sound" data-site-sound>Sound</button>
  <button id="portal" data-contact-portal></button>
  <input id="field" />
  <dialog data-portal-dive open><button id="game">Start</button></dialog>
`;

function setup({ on = true, reduced = false, vibrate = true } = {}) {
  document.body.innerHTML = PAGE;
  if (reduced) document.documentElement.dataset.motion = 'reduce';
  else delete document.documentElement.dataset.motion;
  let t = 1000;
  const state = { on };
  const bus = { play: vi.fn(), hum: vi.fn(), dispose: vi.fn() };
  const vibrations: number[] = [];
  const touches = createTouches({
    gate: () => state.on,
    bus: () => bus,
    doc: document,
    nav: vibrate
      ? { vibrate: ((ms: number) => (vibrations.push(ms), true)) as Navigator['vibrate'] }
      : {},
    now: () => t,
  } as Parameters<typeof createTouches>[0]);
  const stop = touches.install();
  const $ = (id: string) => document.getElementById(id)!;
  const over = (id: string, pointerType = 'mouse') =>
    $(id).dispatchEvent(new PointerEvent('pointerover', { bubbles: true, pointerType }));
  const out = (id: string, to: string | null = null) =>
    $(id).dispatchEvent(
      new PointerEvent('pointerout', { bubbles: true, relatedTarget: to ? $(to) : null }),
    );
  const down = (id: string, pointerType = 'mouse') =>
    $(id).dispatchEvent(
      new PointerEvent('pointerdown', { bubbles: true, pointerType, button: 0, isPrimary: true }),
    );
  const wait = (ms: number) => (t += ms);
  const cues = () => bus.play.mock.calls.map((c) => c[0]);
  return { touches, bus, vibrations, state, stop, $, over, out, down, wait, cues };
}

beforeEach(() => {
  // jsdom has no PointerEvent: a MouseEvent with the pointer fields is enough here.
  if (typeof PointerEvent === 'undefined') {
    class PE extends MouseEvent {
      pointerType: string;
      isPrimary: boolean;
      constructor(type: string, init: PointerEventInit = {}) {
        super(type, init);
        this.pointerType = init.pointerType ?? 'mouse';
        this.isPrimary = init.isPrimary ?? true;
      }
    }
    vi.stubGlobal('PointerEvent', PE);
  }
});
afterEach(() => {
  vi.unstubAllGlobals();
  document.body.innerHTML = '';
});

describe('hover ticks', () => {
  it('tick on a mouse hover over a link or button', () => {
    const { over, cues } = setup();
    over('a');
    expect(cues()).toEqual(['tick']);
  });

  it('never for touch or pen', () => {
    const { over, cues } = setup();
    over('a', 'touch');
    over('btn', 'pen');
    expect(cues()).toEqual([]);
  });

  it('at most one every 90 ms, and not again for the same control within a second', () => {
    const { over, wait, cues } = setup();
    over('a');
    wait(TICK_GAP_MS - 1);
    over('b');
    expect(cues()).toHaveLength(1);
    wait(1);
    over('b-inner');
    expect(cues()).toHaveLength(2);
    wait(TICK_GAP_MS);
    over('a');
    expect(cues()).toHaveLength(2);
    wait(SAME_MS);
    over('a');
    expect(cues()).toHaveLength(3);
  });

  it('on keyboard focus only (focus-visible), not on a click focus', () => {
    const { $, cues } = setup();
    const a = $('a') as HTMLAnchorElement;
    const visible = vi.spyOn(a, 'matches');
    visible.mockImplementation((selector: string) => selector === ':focus-visible');
    a.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
    expect(cues()).toEqual(['tick']);
    visible.mockImplementation(() => false);
    const btn = $('btn');
    btn.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
    expect(cues()).toEqual(['tick']);
  });

  it('none for soft or silent places, the sound buttons, disabled controls, fields, the game', () => {
    const { over, $, cues } = setup();
    for (const id of ['row', 'quiet', 'sound', 'off', 'game']) over(id);
    $('field').dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
    expect(cues()).toEqual([]);
  });
});

describe('presses', () => {
  it('a soft click on press; quieter where soft; none where silent', () => {
    const { down, cues } = setup();
    down('btn');
    down('row');
    down('quiet');
    down('sound');
    down('game');
    expect(cues()).toEqual(['press', 'soft']);
  });

  it('Enter or Space (a click with no pointer) presses too', () => {
    const { $, cues } = setup();
    $('a').addEventListener('click', (e) => e.preventDefault());
    $('a').dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 0 }));
    $('a').dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 1 }));
    expect(cues()).toEqual(['press']);
  });

  it('nothing for a scroll, a key in a field, or a right button', () => {
    const { $, cues } = setup();
    window.dispatchEvent(new Event('scroll'));
    $('field').dispatchEvent(new KeyboardEvent('keydown', { key: 'a', bubbles: true }));
    $('btn').dispatchEvent(
      new PointerEvent('pointerdown', { bubbles: true, button: 2, pointerType: 'mouse' }),
    );
    expect(cues()).toEqual([]);
  });
});

describe('the portal hum', () => {
  it('swells while hovered and falls away on leave, not on a move inside', () => {
    const { over, out, bus } = setup();
    over('portal');
    expect(bus.hum).toHaveBeenLastCalledWith(true);
    out('portal', 'btn');
    expect(bus.hum).toHaveBeenLastCalledWith(false);
    expect(bus.play).not.toHaveBeenCalled();
  });

  it('falls away when the tab is hidden', () => {
    const { over, bus } = setup();
    over('portal');
    Object.defineProperty(document, 'visibilityState', { value: 'hidden', configurable: true });
    document.dispatchEvent(new Event('visibilitychange'));
    expect(bus.hum).toHaveBeenLastCalledWith(false);
    Object.defineProperty(document, 'visibilityState', { value: 'visible', configurable: true });
  });
});

describe('gating', () => {
  it('nothing sounds and nothing vibrates while the gate is shut (off, hidden, the game)', () => {
    const { over, down, cues, vibrations, bus, touches } = setup({ on: false });
    over('a');
    down('btn', 'touch');
    over('portal');
    touches.cue('page');
    expect(cues()).toEqual([]);
    expect(bus.hum).not.toHaveBeenCalledWith(true);
    expect(vibrations).toEqual([]);
  });

  it('stops listening when uninstalled', () => {
    const { over, stop, cues } = setup();
    stop();
    over('a');
    expect(cues()).toEqual([]);
  });
});

describe('vibration', () => {
  it('a short pulse on a touch press, none for a mouse, none on hover', () => {
    const { down, over, vibrations } = setup();
    over('a', 'touch');
    down('btn', 'mouse');
    expect(vibrations).toEqual([]);
    down('btn', 'touch');
    expect(vibrations).toEqual([VIBRATE.press]);
    expect(VIBRATE.press).toBeGreaterThanOrEqual(8);
    expect(VIBRATE.press).toBeLessThanOrEqual(12);
  });

  it('a longer pulse for the big moments', () => {
    const { touches, vibrations } = setup();
    touches.vibrate('strong');
    expect(vibrations).toEqual([VIBRATE.strong]);
  });

  it('none with reduced motion, and silently none where vibrate is missing', () => {
    const reduced = setup({ reduced: true });
    reduced.down('btn', 'touch');
    expect(reduced.vibrations).toEqual([]);
    const missing = setup({ vibrate: false });
    expect(() => missing.down('btn', 'touch')).not.toThrow();
    expect(missing.cues()).toEqual(['press']);
  });
});
