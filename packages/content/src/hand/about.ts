import { z } from 'zod';

import { Href, Image, Link, Paragraph, SchemaVersion, Text, Video } from './primitives';

const ChapterId = z.string().regex(/^[a-z][a-z0-9-]*$/);

/** One chapter of the rings timeline, from the centre out. */
const Chapter = z
  .object({
    id: ChapterId,
    label: Text,
    /** The years printed beside the label. Roots has none. */
    years: Text.optional(),
    /** Printed before the summary on the current job's ring: the role and when it began. */
    role: Text.optional(),
    summary: Text,
    /** Which ring of the stump drawing lights for this chapter (0 is the centre). None: a note between rings. */
    ring: z.number().int().min(0).nullable(),
    /** Ember marks the fire ring; signal is every other lit ring. */
    tone: z.enum(['signal', 'ember']),
    /** The text behind the row. Each paragraph may open with a bold lead-in. */
    details: z.array(Paragraph).min(1).optional(),
    /** A link printed under the details. */
    more: Link.optional(),
    /** Where the latest entry of the job's monthly log shows, when that log is on. */
    logTeaser: z.object({ eyebrow: Text, link: Link }).strict().optional(),
  })
  .strict();

const GlanceTiming = z
  .object({
    /** Seconds into the glance clip when the eyes begin to drop. */
    start: z.number().nonnegative(),
    /** Seconds at which the look down holds, and from which it plays back up. */
    hold: z.number().positive(),
    up: z.number().positive(),
  })
  .strict();

/** The portrait: two stills, six short clips that all start and end on the same pose, and its switch. */
export const Portrait = z
  .object({
    stills: z.object({ normal: Image, cyber: Image }).strict(),
    clips: z
      .object({
        normalIdle: Video,
        cyberIdle: Video,
        normalGlance: Video,
        cyberGlance: Video,
        toCyber: Video,
        toNormal: Video,
      })
      .strict(),
    glance: z.object({ normal: GlanceTiming, cyber: GlanceTiming }).strict(),
    toggle: z.object({ label: Text, on: Text, off: Text }).strict(),
    caption: Text,
  })
  .strict();

export const AboutContent = z
  .object({
    schemaVersion: SchemaVersion,
    title: Text,
    rings: z
      .object({
        title: Text,
        lead: Text,
        image: Image,
        chapters: z.array(Chapter).min(1),
        /** The chapter that is open when the page loads. */
        openChapter: ChapterId,
        /** The last row: the ring that is not there yet. */
        ungrown: Text,
      })
      .strict(),
    person: z
      .object({
        label: Text,
        portrait: Portrait,
        paragraphs: z.array(Paragraph).min(1),
        rules: z.object({ title: Text, items: z.array(Text).min(1) }).strict(),
      })
      .strict(),
    tools: z
      .object({
        id: z.string().regex(/^[a-z][a-z0-9-]*$/),
        title: Text,
        /** Accessible name of the list. */
        listLabel: Text,
        groups: z.array(z.object({ label: Text, tools: z.array(Text).min(1) }).strict()).min(1),
        facts: z.array(z.object({ term: Text, value: Text }).strict()),
        link: z.object({ label: Text, href: Href }).strict(),
      })
      .strict(),
    /** The Now block's heading. Its text is live data. */
    now: z.object({ id: z.string().regex(/^[a-z][a-z0-9-]*$/), title: Text }).strict(),
    next: z.object({ label: Text, eyebrow: Text, link: Link }).strict(),
  })
  .strict()
  .superRefine((about, ctx) => {
    const ids = about.rings.chapters.map((chapter) => chapter.id);
    if (new Set(ids).size !== ids.length)
      ctx.addIssue({ code: 'custom', message: 'chapter ids repeat' });
    if (!ids.includes(about.rings.openChapter)) {
      ctx.addIssue({ code: 'custom', message: 'openChapter is not a chapter id' });
    }
  });

export type AboutContent = z.infer<typeof AboutContent>;
export type Portrait = z.infer<typeof Portrait>;
