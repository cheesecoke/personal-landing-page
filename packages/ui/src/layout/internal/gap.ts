/**
 * The gap steps the boards use, in px. One lookup of whole class names per axis, so Tailwind emits
 * them (a class name is never built from parts).
 */
export type Gap =
  0 | 4 | 6 | 8 | 10 | 12 | 16 | 18 | 20 | 24 | 28 | 32 | 36 | 40 | 44 | 48 | 56 | 64;

export const gapClass: Record<Gap, string> = {
  0: 'gap-0',
  4: 'gap-1',
  6: 'gap-1.5',
  8: 'gap-2',
  10: 'gap-2.5',
  12: 'gap-3',
  16: 'gap-4',
  18: 'gap-4.5',
  20: 'gap-5',
  24: 'gap-6',
  28: 'gap-7',
  32: 'gap-8',
  36: 'gap-9',
  40: 'gap-10',
  44: 'gap-11',
  48: 'gap-12',
  56: 'gap-14',
  64: 'gap-16',
};

export const gapXClass: Record<Gap, string> = {
  0: 'gap-x-0',
  4: 'gap-x-1',
  6: 'gap-x-1.5',
  8: 'gap-x-2',
  10: 'gap-x-2.5',
  12: 'gap-x-3',
  16: 'gap-x-4',
  18: 'gap-x-4.5',
  20: 'gap-x-5',
  24: 'gap-x-6',
  28: 'gap-x-7',
  32: 'gap-x-8',
  36: 'gap-x-9',
  40: 'gap-x-10',
  44: 'gap-x-11',
  48: 'gap-x-12',
  56: 'gap-x-14',
  64: 'gap-x-16',
};

export const gapYClass: Record<Gap, string> = {
  0: 'gap-y-0',
  4: 'gap-y-1',
  6: 'gap-y-1.5',
  8: 'gap-y-2',
  10: 'gap-y-2.5',
  12: 'gap-y-3',
  16: 'gap-y-4',
  18: 'gap-y-4.5',
  20: 'gap-y-5',
  24: 'gap-y-6',
  28: 'gap-y-7',
  32: 'gap-y-8',
  36: 'gap-y-9',
  40: 'gap-y-10',
  44: 'gap-y-11',
  48: 'gap-y-12',
  56: 'gap-y-14',
  64: 'gap-y-16',
};

export type Align = 'start' | 'center' | 'end' | 'stretch' | 'baseline';

export const alignClass: Record<Align, string> = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  stretch: 'items-stretch',
  baseline: 'items-baseline',
};

export type Justify = 'start' | 'center' | 'end' | 'between';

export const justifyClass: Record<Justify, string> = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
  between: 'justify-between',
};
