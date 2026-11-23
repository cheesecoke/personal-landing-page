import type { FigureCrop } from '@cwc/ui';

/**
 * Where the subject sits in each studio image, as pixel rows (see `cropMargins` in `@cwc/ui`).
 * The numbers are the margins on the project boards, turned back into rows. An image not named
 * here is shown whole.
 */
const crops: Readonly<Record<string, FigureCrop>> = {
  '/media/projects/duo-decide/duo-decide-hero.webp': { top: 90, bottom: 890 },
  '/media/projects/duo-decide/duo-decide-detail-queue.webp': { top: 72, bottom: 712 },
  '/media/projects/duo-decide/duo-decide-detail-rounds.webp': { top: 72, bottom: 712 },
  '/media/projects/ai-system/ai-system-hero.webp': { top: 212, bottom: 741 },
  '/media/projects/ai-system/ai-system-detail-relay.webp': { top: 239, bottom: 508 },
  '/media/projects/atti/atti-hero.webp': { top: 90, bottom: 890 },
  '/media/projects/atti/atti-detail-pod.webp': { top: 72, bottom: 712 },
  '/media/projects/atti/atti-detail-lifecycle.webp': { top: 117, bottom: 657 },
  '/media/projects/lifebox/lifebox-hero.webp': { top: 90, bottom: 890 },
  '/media/projects/lifebox/lifebox-detail-directions.webp': { top: 147, bottom: 620 },
};

export const cropFor = (src: string): FigureCrop | undefined => crops[src];

/** What one page's board draws differently from the rest. Everything else follows from content. */
export interface PageLook {
  /** The hero image keeps 32px clear of the title instead of sliding under it. */
  heroClear?: boolean;
  /** The hero is a real capture that stays in the column, with a sentence under it. */
  heroCapture?: boolean;
  /** The small drawn mark under the "Where it's at" text. */
  mark?: 'duo-lens';
  /** A single details figure is capped at 820px. */
  detailsNarrow?: boolean;
}

const looks: Readonly<Record<string, PageLook>> = {
  'duo-decide': { mark: 'duo-lens' },
  'ai-system': { heroClear: true },
  pas: { detailsNarrow: true },
  lifebox: { heroCapture: true },
};

const plain: PageLook = {};

export const lookFor = (slug: string): PageLook => looks[slug] ?? plain;
