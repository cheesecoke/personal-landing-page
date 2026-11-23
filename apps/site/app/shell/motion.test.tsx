import { afterEach, describe, expect, it, vi } from 'vitest';

import { motionMirrorScript } from './motion';

const mirrorMotion = () => new Function(motionMirrorScript)();

function stubMedia(matches: boolean) {
  const listeners: (() => void)[] = [];
  const media = { matches, addEventListener: (_: string, fn: () => void) => listeners.push(fn) };
  vi.stubGlobal('matchMedia', () => media);
  return {
    change(next: boolean) {
      media.matches = next;
      listeners.forEach((fn) => fn());
    },
  };
}

afterEach(() => {
  vi.unstubAllGlobals();
  document.documentElement.removeAttribute('data-motion');
});

describe('motionMirrorScript', () => {
  it('sets data-motion when the reader asks for reduced motion, and follows changes', () => {
    const media = stubMedia(true);
    mirrorMotion();
    expect(document.documentElement.dataset.motion).toBe('reduce');
    media.change(false);
    expect(document.documentElement.hasAttribute('data-motion')).toBe(false);
  });

  it('leaves the document alone otherwise', () => {
    stubMedia(false);
    mirrorMotion();
    expect(document.documentElement.hasAttribute('data-motion')).toBe(false);
  });

  it('does nothing where the browser cannot answer', () => {
    vi.stubGlobal('matchMedia', undefined);
    expect(mirrorMotion).not.toThrow();
  });
});
