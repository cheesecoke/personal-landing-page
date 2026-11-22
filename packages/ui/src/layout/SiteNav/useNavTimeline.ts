import { useCallback, useEffect, useLayoutEffect, useState, type RefObject } from 'react';

export interface NavTimelineState {
  /** Width of the line in px: from the row's left edge to the centre of the active item. */
  x: number;
  /** False until the first measurement; the line stays invisible until then. */
  measured: boolean;
  /** False for the first paint, so the line is placed without motion; true afterwards. */
  animate: boolean;
}

// Layout effects do not run on the server; this keeps the pre-render quiet.
const useIsomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

/** Distance from the row's left edge to the centre of the target, rounded to half a pixel. */
export function timelineX(row: { left: number }, target: { left: number; width: number }): number {
  return Math.round((target.left + target.width / 2 - row.left) * 2) / 2;
}

/**
 * Measures the nav timeline: the teal line runs from the header's left edge to the centre of the
 * active item. Re-measured when the active item changes, when the row or its parts resize, and
 * when the fonts load. The first placement has no motion; later changes animate.
 *
 * `getTarget` returns the active item's element (or null for none). `activeKey` identifies it.
 */
export function useNavTimeline(
  rowRef: RefObject<HTMLElement | null>,
  getTarget: () => HTMLElement | null,
  activeKey: string | undefined,
  observed: readonly RefObject<HTMLElement | null>[] = [],
): NavTimelineState {
  const [state, setState] = useState<NavTimelineState>({ x: 0, measured: false, animate: false });

  const measure = useCallback(() => {
    const row = rowRef.current;
    const target = getTarget();
    if (!row || !target) return;
    const x = timelineX(row.getBoundingClientRect(), target.getBoundingClientRect());
    setState((previous) =>
      previous.x === x && previous.measured ? previous : { ...previous, x, measured: true },
    );
    // `getTarget` reads refs; `activeKey` is what changes the answer.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rowRef, activeKey]);

  useIsomorphicLayoutEffect(() => {
    measure();
  }, [measure]);

  useEffect(() => {
    // Place it without motion first; animate only later changes.
    let frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(() => {
        setState((previous) => (previous.animate ? previous : { ...previous, animate: true }));
      });
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    let observer: ResizeObserver | null = null;
    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', measure);
    } else {
      observer = new ResizeObserver(measure);
      for (const ref of [rowRef, ...observed]) {
        if (ref.current) observer.observe(ref.current);
      }
    }
    let live = true;
    void document.fonts?.ready.then(() => {
      if (live) measure();
    });
    return () => {
      live = false;
      if (observer) observer.disconnect();
      else window.removeEventListener('resize', measure);
    };
    // `observed` is a fresh array of stable refs on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [measure, rowRef]);

  return state;
}
