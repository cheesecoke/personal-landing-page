import { useEffect, type RefObject } from 'react';

import {
  activeNode,
  fillScale,
  fillTarget,
  isAtEnd,
  nodeState,
  readerPosition,
  type ThreadRail,
} from './readerPosition';

/**
 * The markup contract, set by the Thread components:
 * `data-thread-scope` on the page root, `data-thread` on each rail, one `data-thread-fill` inside
 * it, `data-thread-node` on every node. The hook draws nothing; it only sets the fill's transform
 * and each node's `data-thread-state` (`next`, `on`, `past`).
 */
export const THREAD_SCOPE = 'data-thread-scope';
export const THREAD_RAIL = 'data-thread';
export const THREAD_FILL = 'data-thread-fill';
export const THREAD_NODE = 'data-thread-node';
export const THREAD_STATE = 'data-thread-state';

export interface ThreadProgressOptions {
  /**
   * Scroll to the element named by the URL hash once the page has laid out, and again on font load
   * and window load until the reader scrolls on their own. Default `true`.
   */
  hash?: boolean;
}

interface MeasuredRail extends ThreadRail {
  fill: HTMLElement;
  /** The transform last written, so an unchanged frame writes nothing. */
  drawn: string;
}

interface Geometry {
  viewport: number;
  maxScroll: number;
  end: number;
  rails: MeasuredRail[];
  nodes: { el: HTMLElement; y: number }[];
  ys: number[];
}

const scrollable = new Set(['auto', 'scroll', 'overlay']);

/** The nearest ancestor that actually scrolls, or null for the window. */
function findScroller(from: HTMLElement): HTMLElement | null {
  for (
    let el = from.parentElement;
    el && el !== document.body && el !== document.documentElement;
    el = el.parentElement
  ) {
    if (scrollable.has(getComputedStyle(el).overflowY) && el.scrollHeight > el.clientHeight + 1) {
      return el;
    }
  }
  return null;
}

/**
 * Makes the thread follow the reader: fills each rail from its top to the reader position (by
 * `scaleY`, never height) and gives every node a state. Geometry is read on mount, resize, font
 * load, window load and when the page changes height; the scroll handler is passive,
 * rAF-throttled and reads no layout.
 */
export function useThreadProgress(
  scopeRef: RefObject<HTMLElement | null>,
  { hash = true }: ThreadProgressOptions = {},
): void {
  useEffect(() => {
    const scope = scopeRef.current;
    if (!scope) return;

    let geo: Geometry | null = null;
    let scrollFrame = 0;
    let measureFrame = 0;
    let scroller: HTMLElement | null = null;
    let bound = false;
    let userMoved = false;
    let disposed = false;

    const motionQuery = window.matchMedia?.('(prefers-reduced-motion: reduce)') ?? null;
    const reduced = () =>
      Boolean(motionQuery?.matches) || document.documentElement.dataset.motion === 'reduce';

    const view = () => {
      if (scroller) {
        return {
          scroll: scroller.scrollTop,
          viewport: scroller.clientHeight,
          maxScroll: scroller.scrollHeight - scroller.clientHeight,
          top: scroller.getBoundingClientRect().top,
        };
      }
      const root = document.documentElement;
      return {
        scroll: window.scrollY || root.scrollTop,
        viewport: window.innerHeight,
        maxScroll: Math.max(root.scrollHeight, document.body.scrollHeight) - window.innerHeight,
        top: 0,
      };
    };

    const update = () => {
      if (!geo) return;
      const scroll = scroller ? scroller.scrollTop : window.scrollY;
      const reader = readerPosition(scroll, geo);
      const on = activeNode(geo.ys, reader);
      geo.nodes.forEach((node, index) => {
        const state = nodeState(index, on);
        if (node.el.getAttribute(THREAD_STATE) !== state) node.el.setAttribute(THREAD_STATE, state);
      });
      const target = fillTarget({
        reader,
        on,
        nodes: geo.ys,
        reduced: reduced(),
        atEnd: isAtEnd(scroll, geo),
      });
      for (const rail of geo.rails) {
        const transform = `scaleY(${fillScale(rail, target, geo.end).toFixed(4)})`;
        if (rail.drawn !== transform) {
          rail.fill.style.transform = transform;
          rail.drawn = transform;
        }
      }
    };

    const onScroll = () => {
      if (scrollFrame) return;
      scrollFrame = requestAnimationFrame(() => {
        scrollFrame = 0;
        update();
      });
    };

    const bindScroller = () => {
      const next = findScroller(scope);
      if (next === scroller && bound) return;
      if (bound) (scroller ?? window).removeEventListener('scroll', onScroll);
      scroller = next;
      (scroller ?? window).addEventListener('scroll', onScroll, { passive: true });
      bound = true;
    };

    // Every layout read happens here, never on scroll.
    const measure = () => {
      measureFrame = 0;
      if (disposed) return;
      bindScroller();
      const v = view();
      const offset = v.scroll - v.top;
      const rails: MeasuredRail[] = [];
      for (const el of scope.querySelectorAll<HTMLElement>(`[${THREAD_RAIL}]`)) {
        const fill = el.querySelector<HTMLElement>(`[${THREAD_FILL}]`);
        const box = el.getBoundingClientRect();
        if (fill && box.height > 0)
          rails.push({ fill, top: box.top + offset, height: box.height, drawn: '' });
      }
      const nodes: Geometry['nodes'] = [];
      for (const el of scope.querySelectorAll<HTMLElement>(`[${THREAD_NODE}]`)) {
        const box = el.getBoundingClientRect();
        if (box.width > 0) nodes.push({ el, y: box.top + box.height / 2 + offset });
      }
      nodes.sort((a, b) => a.y - b.y);
      // The thread ends at the last node, or at the foot of a rail that runs on past it.
      let end = nodes.at(-1)?.y ?? 0;
      for (const rail of rails) end = Math.max(end, rail.top + rail.height);
      geo = {
        viewport: v.viewport,
        maxScroll: v.maxScroll,
        end,
        rails,
        nodes,
        ys: nodes.map((node) => node.y),
      };
      update();
    };

    const queueMeasure = () => {
      if (!measureFrame && !disposed) measureFrame = requestAnimationFrame(measure);
    };

    // Deep links: the page lays out after the browser's own hash jump, so scroll to #id here.
    const hashId = () => {
      try {
        return decodeURIComponent(window.location.hash.slice(1));
      } catch {
        return '';
      }
    };
    const findInScope = (id: string) => {
      try {
        return scope.querySelector(`#${CSS.escape(id)}`);
      } catch {
        return null;
      }
    };
    const toHash = () => {
      if (!hash || userMoved || disposed) return;
      const id = hashId();
      if (!id) return;
      const target = findInScope(id) ?? document.getElementById(id);
      target?.scrollIntoView({ block: 'start' });
    };
    const onHashChange = () => {
      userMoved = false;
      toHash();
    };
    const onUserMove = () => {
      userMoved = true;
    };
    const onLoad = () => {
      queueMeasure();
      toHash();
    };

    const moveEvents = ['wheel', 'touchstart', 'keydown'] as const;
    motionQuery?.addEventListener?.('change', queueMeasure);
    window.addEventListener('resize', queueMeasure);
    window.addEventListener('load', onLoad);
    window.addEventListener('hashchange', onHashChange);
    for (const name of moveEvents) {
      window.addEventListener(name, onUserMove, { passive: true, once: true });
    }

    // Expanders and late images change the page height.
    const resizeObserver =
      typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(queueMeasure);
    resizeObserver?.observe(scope);
    // `[data-motion]` on the root mirrors the OS setting (and the Storybook toolbar).
    const motionObserver =
      typeof MutationObserver === 'undefined' ? null : new MutationObserver(queueMeasure);
    motionObserver?.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-motion'],
    });
    void document.fonts?.ready.then(() => {
      queueMeasure();
      toHash();
    });

    measure();
    const hashFrame = requestAnimationFrame(toHash);
    const hashTimer = window.setTimeout(toHash, 900);

    return () => {
      disposed = true;
      if (scrollFrame) cancelAnimationFrame(scrollFrame);
      if (measureFrame) cancelAnimationFrame(measureFrame);
      cancelAnimationFrame(hashFrame);
      window.clearTimeout(hashTimer);
      if (bound) (scroller ?? window).removeEventListener('scroll', onScroll);
      motionQuery?.removeEventListener?.('change', queueMeasure);
      window.removeEventListener('resize', queueMeasure);
      window.removeEventListener('load', onLoad);
      window.removeEventListener('hashchange', onHashChange);
      for (const name of moveEvents) window.removeEventListener(name, onUserMove);
      resizeObserver?.disconnect();
      motionObserver?.disconnect();
    };
  }, [scopeRef, hash]);
}
