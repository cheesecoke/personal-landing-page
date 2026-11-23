import { useEffect, useRef, useState } from 'react';

import { Canopy } from '@cwc/canopy';

/** How far below the viewport the teaser is when the live tree starts loading. */
const NEAR = '800px';

/**
 * Home's tree teaser: the canopy as a picture, 460px tall and 360px under `md`, as on the board.
 *
 * It starts as the flat drawing, which is all the pre-rendered page carries. The live tree (and
 * three.js with it) loads only once the reader scrolls near the section, so it is never part of
 * Home's first load.
 */
export function HomeTemplateMap() {
  const ref = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') {
      const frame = requestAnimationFrame(() => setNear(true));
      return () => cancelAnimationFrame(frame);
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setNear(true);
          observer.disconnect();
        }
      },
      { rootMargin: NEAR },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="[--home-map-height:360px] md:[--home-map-height:460px]">
      <Canopy variant="teaser" height="var(--home-map-height)" flat={!near} />
    </div>
  );
}
