import { describe, expect, it } from 'vitest';

import {
  keyDirection,
  LEFT,
  pointerDirection,
  press,
  release,
  RIGHT,
  steerFromHeld,
} from './input';

describe('keyDirection', () => {
  it('maps the arrows and A/D, in either case', () => {
    expect(keyDirection('ArrowLeft')).toBe(LEFT);
    expect(keyDirection('a')).toBe(LEFT);
    expect(keyDirection('A')).toBe(LEFT);
    expect(keyDirection('ArrowRight')).toBe(RIGHT);
    expect(keyDirection('D')).toBe(RIGHT);
  });

  it('leaves every other key alone', () => {
    for (const key of ['Escape', 'Tab', 'Enter', ' ', 'ArrowUp', 'ArrowDown', 'w', 's'])
      expect(keyDirection(key)).toBeNull();
  });
});

describe('pointerDirection', () => {
  it('steers toward the half that is held', () => {
    expect(pointerDirection(10, 400)).toBe(LEFT);
    expect(pointerDirection(199, 400)).toBe(LEFT);
    expect(pointerDirection(200, 400)).toBe(RIGHT);
    expect(pointerDirection(390, 400)).toBe(RIGHT);
  });
});

describe('steerFromHeld', () => {
  it('is 0 with nothing held', () => {
    expect(steerFromHeld([])).toBe(0);
  });

  it('lets the latest press win and falls back when it is released', () => {
    let held = press([], 'arrowleft', LEFT);
    expect(steerFromHeld(held)).toBe(1);
    held = press(held, 'arrowright', RIGHT);
    expect(steerFromHeld(held)).toBe(-1);
    held = release(held, 'arrowright');
    expect(steerFromHeld(held)).toBe(1);
    held = release(held, 'arrowleft');
    expect(steerFromHeld(held)).toBe(0);
  });

  it('ignores key repeat, so a held key does not jump ahead of a newer one', () => {
    let held = press([], 'a', LEFT);
    held = press(held, 'd', RIGHT);
    const again = press(held, 'a', LEFT);
    expect(again).toBe(held);
    expect(steerFromHeld(again)).toBe(-1);
  });

  it('moves a pointer that slides across the middle to its new side', () => {
    let held = press([], 'pointer:1', LEFT);
    held = press(held, 'pointer:1', RIGHT);
    expect(held).toHaveLength(1);
    expect(steerFromHeld(held)).toBe(-1);
  });

  it('releasing something not held changes nothing', () => {
    const held = press([], 'a', LEFT);
    expect(release(held, 'pointer:9')).toBe(held);
  });
});
