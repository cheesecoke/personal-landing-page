import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { cssDuration, generatedFiles, toThemeCss, toTokensCss } from './build';
import { breakpoint, duration, fresh, palette, semantic, tone, type } from './tokens';

const generated = (file: string) =>
  readFileSync(join(import.meta.dirname, '..', 'generated', file), 'utf8');

describe('generated files', () => {
  it.each(Object.keys(generatedFiles) as (keyof typeof generatedFiles)[])(
    '%s is in step with tokens.ts (run `pnpm --filter @cwc/tokens generate`)',
    (file) => {
      expect(generated(file)).toBe(generatedFiles[file]());
    },
  );
});

describe('tokens', () => {
  it('has the thirteen palette colours as 6-digit hex', () => {
    expect(Object.keys(palette)).toHaveLength(13);
    for (const hex of Object.values(palette)) expect(hex).toMatch(/^#[0-9A-F]{6}$/);
  });

  it('points every semantic colour at a palette colour', () => {
    for (const roles of Object.values(semantic)) {
      for (const name of Object.values(roles)) expect(palette).toHaveProperty(name);
    }
  });

  it('keeps the tones as 6-digit hex, outside the palette', () => {
    const hexes = Object.values(tone).flatMap((roles) => Object.values(roles));
    for (const hex of hexes) {
      expect(hex).toMatch(/^#[0-9A-F]{6}$/);
      expect(Object.values(palette)).not.toContain(hex);
    }
  });

  it('keeps the freshness lifetimes the design uses', () => {
    expect(fresh).toEqual({
      life: { update: 14, grown: 21, answered: 21, release: 30 },
      cap: 3,
      nav: 7,
    });
  });

  it('orders breakpoints from narrow to wide', () => {
    const widths = Object.values(breakpoint);
    expect(widths).toEqual([...widths].sort((a, b) => a - b));
  });

  it('writes durations in seconds', () => {
    expect(cssDuration(duration.nav)).toBe('0.6s');
    expect(cssDuration(duration['canopy-intro'])).toBe('5.2s');
  });
});

describe('css output', () => {
  it('declares a custom property for each palette colour and duration', () => {
    const css = toTokensCss();
    expect(css).toContain('--palette-signal-dim: #3F9E92;');
    expect(css).toContain('--text-label: var(--palette-smoke);');
    expect(css).toContain('--glow-signal: 0 0 12px rgb(111 227 210 / 0.6);');
    expect(css).toContain('--duration-thread-pulse: 11s;');
    expect(css).toContain('--line-tick-major: #4A463D;');
    expect(css).toContain('--thread-next: #2C6A62;');
    expect(css).toContain('--thread-past: #4FB3A6;');
    expect(css).toContain('--edge-panel: inset 0 1px 0 rgb(221 191 148 / 0.08);');
  });

  it('gives every type role a utility', () => {
    const css = toThemeCss();
    for (const role of Object.keys(type)) expect(css).toContain(`@utility type-${role} {`);
  });

  it('exposes the tones, the thread colours and the panel edge as utilities', () => {
    const css = toThemeCss();
    expect(css).toContain('--color-line-tick-major: var(--line-tick-major);');
    expect(css).toContain('--color-thread-next: var(--thread-next);');
    expect(css).toContain('--color-thread-on: var(--thread-on);');
    expect(css).toContain('--text-color-diagram: var(--text-diagram);');
    expect(css).toContain('--shadow-panel: var(--edge-panel);');
  });
});
