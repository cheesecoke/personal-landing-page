import { describe, expect, it, vi } from 'vitest';

import type { SiteAmbience, SiteAmbienceOptions } from './ambience';
import { FakeAudioContext } from './fakeAudio';
import { createSoundPreference } from './preference';
import { createSiteSound } from './site';

/** A silent stand-in for the ambience chunk: records what the bootstrap asks of it. */
function fakeAmbience(result: boolean | (() => boolean) = true) {
  const made: SiteAmbienceOptions[] = [];
  const ambience = {
    start: vi.fn(() => Promise.resolve(typeof result === 'function' ? result() : result)),
    stop: vi.fn(),
    setHeld: vi.fn(),
    available: vi.fn(() => true),
  } satisfies SiteAmbience;
  const load = vi.fn(() =>
    Promise.resolve({
      createSiteAmbience: (options: SiteAmbienceOptions = {}) => {
        made.push(options);
        return ambience;
      },
    }),
  );
  return { ambience, load, made };
}

function setup({
  stored,
  result,
  load: loadIn,
}: {
  stored?: 'on' | 'off';
  result?: boolean | (() => boolean);
  load?: () => Promise<never>;
} = {}) {
  const storage = new Map<string, string>(stored ? [['cwc-sound', stored]] : []);
  const preference = createSoundPreference({
    storage: {
      getItem: (k: string) => storage.get(k) ?? null,
      setItem: (k: string, v: string) => void storage.set(k, v),
      removeItem: (k: string) => void storage.delete(k),
    } as Storage,
    events: null,
  });
  const win = new EventTarget();
  const attrs = new Map<string, string>();
  const doc = {
    visibilityState: 'visible' as DocumentVisibilityState,
    documentElement: {
      setAttribute: (k: string, v: string) => attrs.set(k, v),
      removeAttribute: (k: string) => attrs.delete(k),
    } as unknown as HTMLElement,
  };
  const fake = fakeAmbience(result);
  const contexts: FakeAudioContext[] = [];
  const site = createSiteSound({
    preference,
    load: loadIn ?? fake.load,
    createContext: () => {
      const c = new FakeAudioContext();
      contexts.push(c);
      return c;
    },
    win: win as unknown as Window,
    doc,
  });
  const fire = async (type: string) => {
    win.dispatchEvent(new Event(type));
    // Let the chunk's promise and the start's promise settle.
    for (let i = 0; i < 5; i += 1) await Promise.resolve();
  };
  return { ...fake, site, preference, fire, contexts, attrs, doc, storage };
}

describe('the site sound bootstrap', () => {
  it('loads and plays nothing before the first gesture', async () => {
    const { site, load, fire } = setup();
    site.install();
    await fire('scroll');
    await fire('wheel');
    await fire('mousemove');
    await fire('pointermove');
    expect(load).not.toHaveBeenCalled();
  });

  it.each(['pointerdown', 'keydown', 'touchend'])(
    'starts once on the first %s: a context made inside it, then the chunk, then a fade in',
    async (type) => {
      const { site, load, fire, ambience, contexts, made } = setup();
      site.install();
      await fire(type);
      expect(contexts).toHaveLength(1);
      expect(contexts[0]!.resumes).toBe(1);
      expect(load).toHaveBeenCalledTimes(1);
      expect(made[0]!.context).toBe(contexts[0]);
      expect(ambience.start).toHaveBeenCalledTimes(1);
      // Started: the listeners are gone.
      await fire('pointerdown');
      await fire('keydown');
      expect(ambience.start).toHaveBeenCalledTimes(1);
      expect(load).toHaveBeenCalledTimes(1);
    },
  );

  it('tries again on the next gesture when the browser refused to play', async () => {
    let allowed = false;
    const { site, fire, ambience, load } = setup({ result: () => allowed });
    site.install();
    await fire('pointerdown');
    expect(ambience.start).toHaveBeenCalledTimes(1);
    allowed = true;
    await fire('touchend');
    expect(ambience.start).toHaveBeenCalledTimes(2);
    await fire('pointerdown');
    expect(ambience.start).toHaveBeenCalledTimes(2);
    expect(load).toHaveBeenCalledTimes(1);
  });

  it('respects a kept "off": no listeners, no chunk, no file', async () => {
    const { site, fire, load, contexts } = setup({ stored: 'off' });
    site.install();
    await fire('pointerdown');
    await fire('keydown');
    expect(load).not.toHaveBeenCalled();
    expect(contexts).toHaveLength(0);
  });

  it('turning sound on (a press) starts it at once; off stops it and marks the page', async () => {
    const { site, preference, load, ambience, attrs } = setup({ stored: 'off' });
    site.install();
    preference.write(true);
    // The context was made inside the press, before the chunk arrived.
    expect(load).toHaveBeenCalledTimes(1);
    await vi.waitFor(() => expect(ambience.start).toHaveBeenCalledTimes(1));
    expect(attrs.has('data-sound')).toBe(false);
    preference.write(false);
    expect(ambience.stop).toHaveBeenCalledTimes(1);
    expect(attrs.get('data-sound')).toBe('off');
    preference.toggle();
    expect(ambience.start).toHaveBeenCalledTimes(2);
  });

  it('turned on from another tab while hidden, it waits for a gesture here', async () => {
    const { site, preference, load, doc, fire } = setup({ stored: 'off' });
    site.install();
    doc.visibilityState = 'hidden';
    preference.write(true);
    expect(load).not.toHaveBeenCalled();
    doc.visibilityState = 'visible';
    await fire('pointerdown');
    expect(load).toHaveBeenCalledTimes(1);
  });

  it('turned off while the chunk loads, it never starts', async () => {
    const { site, preference, fire, ambience } = setup();
    site.install();
    const gesture = fire('keydown');
    preference.write(false);
    await gesture;
    expect(ambience.start).not.toHaveBeenCalled();
    expect(ambience.stop).toHaveBeenCalled();
  });

  it('hands over to the Portal dive: held while it is open, back when it closes', async () => {
    const { site, fire, ambience, made } = setup();
    site.install();
    const release = site.hold();
    await fire('pointerdown');
    expect(made[0]!.held).toBe(true);
    const second = site.hold();
    release();
    release();
    expect(ambience.setHeld).toHaveBeenLastCalledWith(true);
    second();
    expect(ambience.setHeld).toHaveBeenLastCalledWith(false);
    site.hold();
    expect(ambience.setHeld).toHaveBeenLastCalledWith(true);
  });

  it('stays quiet when the chunk fails to load, and the button still works', async () => {
    const { site, fire, preference, contexts } = setup({
      load: () => Promise.reject(new Error('offline')),
    });
    site.install();
    await expect(fire('pointerdown')).resolves.toBeUndefined();
    expect(contexts[0]!.state).toBe('closed');
    expect(() => preference.toggle()).not.toThrow();
    expect(preference.read()).toBe(false);
  });

  it('stops listening when uninstalled', async () => {
    const { site, fire, load } = setup();
    const uninstall = site.install();
    uninstall();
    await fire('pointerdown');
    expect(load).not.toHaveBeenCalled();
  });
});
