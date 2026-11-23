import { useEffect, useState, type RefObject } from 'react';

export interface HeadlineLine {
  /** Left edge, from the hero's left, in px. */
  x: number;
  /** Top of the 24px box the line sits in, from the hero's top, in px. */
  y: number;
  width: number;
}

const half = (value: number) => Math.round(value * 2) / 2;

/**
 * Where the thin line under the headline's last word goes: from just before the word's first
 * letter to just past the full stop. Measured from two zero-size markers in the headline, and
 * again on resize and when the fonts load. `null` until measured, or when the word has wrapped
 * away from its full stop.
 */
export function useHeadlineLine(
  hero: RefObject<HTMLElement | null>,
  start: RefObject<HTMLElement | null>,
  end: RefObject<HTMLElement | null>,
): HeadlineLine | null {
  const [line, setLine] = useState<HeadlineLine | null>(null);

  useEffect(() => {
    const measure = () => {
      const box = hero.current;
      const from = start.current;
      const to = end.current;
      if (!box || !from || !to || !from.parentElement) return;
      const h = box.getBoundingClientRect();
      const m = from.getBoundingClientRect();
      const e = to.getBoundingClientRect();
      const size = parseFloat(window.getComputedStyle(from.parentElement).fontSize) || 48;
      const x = half(m.left - h.left - 0.03 * size);
      const y = half(m.top - h.top + 0.1 * size);
      const xe = half(e.left - h.left + 0.06 * size);
      const next = xe - x > size ? { x, y: y - 12, width: xe - x } : null;
      setLine((prev) =>
        prev?.x === next?.x && prev?.y === next?.y && prev?.width === next?.width ? prev : next,
      );
    };

    measure();
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(measure);
    if (observer && hero.current) observer.observe(hero.current);
    else window.addEventListener('resize', measure);
    const fonts = document.fonts as FontFaceSet | undefined;
    void fonts?.ready.then(measure);
    fonts?.addEventListener('loadingdone', measure);
    return () => {
      if (observer) observer.disconnect();
      else window.removeEventListener('resize', measure);
      fonts?.removeEventListener('loadingdone', measure);
    };
  }, [hero, start, end]);

  return line;
}
