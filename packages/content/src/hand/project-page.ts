import { z } from 'zod';

import {
  Confirm,
  Figure,
  Href,
  Image,
  Link,
  Paragraph,
  SchemaVersion,
  StatusLabel,
  Text,
  Video,
} from './primitives';

/**
 * One project page (and the job page, which has the same shape): an opening block, then sections
 * in the order the page prints them. Each section says what it is with `type`.
 */

const Anchor = z.string().regex(/^[A-Za-z][A-Za-z0-9-]*$/);

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** 'YYYY.DDD' for a printed date such as '10 Nov 2026', or null when the date does not parse. */
export function stampForDate(date: string): string | null {
  const match = /^(\d{1,2}) ([A-Z][a-z]{2}) (\d{4})$/.exec(date);
  if (!match) return null;
  const [, day, monthName, year] = match;
  const month = MONTHS.indexOf(monthName ?? '');
  if (month < 0) return null;
  const then = Date.UTC(Number(year), month, Number(day));
  const dayOfYear = Math.round((then - Date.UTC(Number(year), 0, 0)) / 86_400_000);
  return `${year}.${String(dayOfYear).padStart(3, '0')}`;
}

/** The two ways a date is printed on an artifact: the stamp ('2026.314') and the day. */
const dated = {
  stamp: z.string().regex(/^\d{4}\.\d{3}$/),
  date: z.string().regex(/^\d{1,2} [A-Z][a-z]{2} \d{4}$/),
};

const stampMatchesDate = (value: { stamp?: string; date?: string }) =>
  value.stamp === undefined || value.date === undefined || stampForDate(value.date) === value.stamp;

const ArtifactMedia = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('image'), image: Image }).strict(),
  z.object({ kind: z.literal('video'), video: Video }).strict(),
]);

/** A dated piece of evidence: what happened, and where it is recorded. */
export const Artifact = z
  .object({
    ...dated,
    title: Text,
    text: Paragraph,
    /** Where it comes from, as printed ("Pull request · ..."). */
    source: Text,
    media: z.array(ArtifactMedia).min(1).optional(),
  })
  .strict()
  .refine(stampMatchesDate, { message: 'stamp is not the day of the year of date' });

/** A fact in the "Where it's at" strip. With `unit`, `value` is a number and the unit follows it. */
export const PageFact = z.object({ value: Text, unit: Text.optional(), caption: Text }).strict();

const HeroFigure = z.discriminatedUnion('type', [
  z
    .object({
      type: z.literal('image'),
      image: Image,
      caption: Text,
      /** A second, quieter caption line. */
      captionNote: Text.optional(),
    })
    .strict(),
  /** Drawn diagram: who writes into the brain, its two zones, and the gate out. */
  z
    .object({
      type: z.literal('zones'),
      label: Text,
      writes: z.object({ title: Text, items: z.array(Text).min(1) }).strict(),
      open: z.object({ title: Text, note: Text, items: z.array(Text).min(1) }).strict(),
      sealed: z.object({ title: Text, note: Text }).strict(),
      gate: Text,
      destination: Text,
      caption: Text,
    })
    .strict(),
  /** Drawn diagram: a row of steps with the notes that sit under it. */
  z
    .object({
      type: z.literal('flow'),
      label: Text,
      steps: z.array(Text).min(2),
      notes: z.array(Text),
      caption: Text,
    })
    .strict(),
]);

const Hero = z
  .object({
    status: StatusLabel,
    title: Text,
    /** Printed after the title, behind a middle dot. */
    subtitle: Text.optional(),
    lead: Text,
    figure: HeroFigure.optional(),
  })
  .strict();

const WhereItsAt = z
  .object({
    type: z.literal('whereItsAt'),
    id: Anchor,
    title: Text,
    paragraphs: z.array(Paragraph).min(1),
    facts: z.array(PageFact).min(1),
  })
  .strict();

/** Where the captain's log goes. The entries are live data, not hand content. */
const LogSlot = z.object({ type: z.literal('log'), id: Anchor, label: Text }).strict();

/** The PAS rings: three nested projects, each with the line the readout shows. */
const Family = z
  .object({
    type: z.literal('family'),
    label: Text,
    members: z
      .array(
        z
          .object({
            name: Text,
            status: StatusLabel,
            line: Text,
            /** Accessible name of the ring. */
            label: Text,
            /** Missing on the outer ring, which is this page. */
            href: Href.optional(),
          })
          .strict(),
      )
      .min(2),
    figure: Figure.optional(),
  })
  .strict();

/** One or more figures, with an optional heading and text beside them. */
const Figures = z
  .object({
    type: z.literal('figures'),
    id: Anchor.optional(),
    /** Accessible name when there is no title. */
    label: Text.optional(),
    title: Text.optional(),
    paragraphs: z.array(Paragraph).optional(),
    figures: z.array(Figure).min(1),
  })
  .strict()
  .refine((section) => section.label !== undefined || section.title !== undefined, {
    message: 'a figures section needs a label or a title',
  });

const TimelineStop = z
  .object({
    stamp: dated.stamp.optional(),
    date: dated.date.optional(),
    /** Printed in place of a date ("Next version"). */
    tag: Text.optional(),
    title: Text,
    text: Text.optional(),
    link: Link.optional(),
  })
  .strict()
  .refine(stampMatchesDate, { message: 'stamp is not the day of the year of date' })
  .refine((stop) => (stop.date !== undefined) !== (stop.tag !== undefined), {
    message: 'a stop has a date or a tag, not both',
  });

const Timeline = z
  .object({
    type: z.literal('timeline'),
    id: Anchor,
    title: Text,
    /** Accessible name of the list. */
    label: Text,
    stops: z.array(TimelineStop).min(2),
    figure: Figure.optional(),
  })
  .strict();

const Prose = z
  .object({
    type: z.literal('prose'),
    id: Anchor,
    title: Text,
    paragraphs: z.array(Paragraph).min(1),
  })
  .strict();

/** Two small drawn cards set against each other, with text around them. */
const Compare = z
  .object({
    type: z.literal('compare'),
    id: Anchor,
    title: Text,
    lead: Text,
    intro: Paragraph,
    cards: z
      .array(
        z
          .object({
            title: Text,
            /** A small readout beside the title ("n = 1"). */
            tag: Text.optional(),
            /** The marks drawn in the card ("A", "B" or "W1".."W4"). */
            marks: z.array(Text).min(1),
            text: Text,
            /** What the drawing shows, for screen readers. */
            label: Text,
          })
          .strict(),
      )
      .length(2),
    outro: Paragraph,
    figure: Figure.optional(),
  })
  .strict();

/** A short ladder of named steps with one paragraph. */
const Ladder = z
  .object({
    type: z.literal('ladder'),
    label: Text,
    stepsLabel: Text,
    steps: z.array(Text).min(2),
    text: Text,
  })
  .strict();

/** Smaller projects that feed this one. Each has an anchor other pages link to. */
const Feeds = z
  .object({
    type: z.literal('feeds'),
    id: Anchor,
    title: Text,
    items: z.array(z.object({ id: Anchor, name: Text, line: Text }).strict()).min(1),
    diagram: z.object({ label: Text, center: Text }).strict(),
  })
  .strict();

const Expander = z
  .object({
    id: Anchor.optional(),
    title: Text,
    /** The count printed on the closed row ("3 artifacts"). */
    countLabel: z
      .string()
      .regex(/^\d+ artifacts?$/)
      .optional(),
    paragraphs: z.array(Paragraph).min(1),
    /** Markers the design left open in this card, word for word. */
    confirm: z.array(Confirm).min(1).optional(),
    artifacts: z.array(Artifact).min(1).optional(),
  })
  .strict()
  .refine(
    (card) =>
      card.countLabel === undefined ||
      Number.parseInt(card.countLabel, 10) === (card.artifacts?.length ?? 0),
    { message: 'countLabel does not match the number of artifacts' },
  );

const GoDeeper = z
  .object({
    type: z.literal('goDeeper'),
    id: Anchor,
    title: Text,
    /** Links to the pages inside this one. */
    cards: z
      .object({
        label: Text,
        items: z
          .array(z.object({ name: Text, status: StatusLabel, line: Text, href: Href }).strict())
          .min(1),
      })
      .strict()
      .optional(),
    /** A short illustrated walk-through. */
    feature: z
      .object({
        id: Anchor,
        title: Text,
        text: Text,
        stepsLabel: Text,
        steps: z.array(z.object({ label: Text, image: Image, text: Text }).strict()).min(2),
      })
      .strict()
      .optional(),
    /** Accessible name of every list of dated artifacts on the page. */
    artifactsLabel: Text.optional(),
    /** Dated artifacts printed above the cards. */
    artifacts: z.array(Artifact).min(1).optional(),
    expanders: z.array(Expander).min(1),
  })
  .strict();

export const PageSection = z.discriminatedUnion('type', [
  WhereItsAt,
  LogSlot,
  Family,
  Figures,
  Timeline,
  Prose,
  Compare,
  Ladder,
  Feeds,
  GoDeeper,
]);

export const ProjectPageContent = z
  .object({
    schemaVersion: SchemaVersion,
    /** The page's id; for projects it is the id used by the map and by live data. */
    slug: z.string().regex(/^[a-z][a-z0-9-]*$/),
    /** The route this page is served at. */
    path: Href,
    /** The document title. */
    title: Text,
    breadcrumb: z
      .object({
        label: Text,
        /** The last item is this page and has no link. */
        items: z.array(z.object({ label: Text, href: Href.optional() }).strict()).min(2),
      })
      .strict(),
    hero: Hero,
    sections: z.array(PageSection).min(1),
    next: z
      .object({
        /** Accessible name of the hand-off. */
        label: Text,
        eyebrow: Text,
        link: Link,
        back: Link,
      })
      .strict(),
  })
  .strict()
  .superRefine((page, ctx) => {
    const ids = page.sections.flatMap((section) => {
      const own = 'id' in section && section.id ? [section.id] : [];
      if (section.type === 'feeds') return [...own, ...section.items.map((item) => item.id)];
      if (section.type === 'goDeeper') {
        const cards = section.expanders.flatMap((card) => (card.id ? [card.id] : []));
        return [...own, ...cards, ...(section.feature ? [section.feature.id] : [])];
      }
      return own;
    });
    const repeated = ids.filter((id, index) => ids.indexOf(id) !== index);
    if (repeated.length > 0) {
      ctx.addIssue({ code: 'custom', message: `anchors repeat: ${repeated.join(', ')}` });
    }
  });

export type Artifact = z.infer<typeof Artifact>;
export type PageFact = z.infer<typeof PageFact>;
export type PageSection = z.infer<typeof PageSection>;
export type ProjectPageContent = z.infer<typeof ProjectPageContent>;
