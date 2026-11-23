import { z } from 'zod';

import { Href, Image, Link, SchemaVersion, StatusLabel, Text } from './primitives';

/** The slug of a project's live file, e.g. `duo-decide`. */
const ProjectSlug = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);

/**
 * A project name on the stump: the callout on wide screens, a list row on phones. `project` names
 * the live file whose status replaces `status` when there is one.
 */
const StumpProject = z
  .object({ name: Text, status: StatusLabel, href: Href, project: ProjectSlug.optional() })
  .strict();

/** A ring label on the stump that is not a link (a job, a chapter). */
const StumpRing = z.object({ label: Text, when: Text, tone: z.enum(['signal', 'ember']) }).strict();

const Hero = z
  .object({
    eyebrow: Text,
    /** One entry per printed line. */
    headline: z.array(Text).min(1),
    /** The word in the headline that gets the drawn underline. */
    underlined: Text,
    lead: Text,
    actions: z
      .array(z.object({ label: Text, href: Href, variant: z.enum(['primary', 'quiet']) }).strict())
      .min(1),
    stump: z
      .object({
        /** Wide layout: the stump, and the same render with its rings lit (cross-faded). */
        wide: Image,
        wideLit: Image,
        /** Phone layout: one portrait render, with its own alt text. */
        phone: Image,
        projects: z.array(StumpProject).min(1),
        rings: z.array(StumpRing),
        /** Accessible name of the phone list of projects. */
        listLabel: Text,
      })
      .strict(),
  })
  .strict()
  .refine((hero) => hero.headline.some((line) => line.includes(hero.underlined)), {
    message: 'underlined must be a word in the headline',
  });

const ProofItem = z
  .object({
    /** The large readout. With `unit`, it is a number and the unit sits beside it. */
    value: Text,
    unit: Text.optional(),
    caption: Text,
    href: Href,
    /** The live fact this number is: its value and the day it was counted come from live data. */
    fact: z.object({ project: ProjectSlug, key: ProjectSlug }).strict().optional(),
  })
  .strict();

/** How an image sits in its plate: position and width as percentages of the plate's width. */
const PlateCrop = z.object({ left: z.number(), top: z.number(), width: z.number().positive() });

/** A plate's frame: its width over its height, and the crop of the image inside it. */
const PlateFrame = z.object({ aspect: z.number().positive(), crop: PlateCrop.strict() }).strict();

const Plate = z
  .object({
    name: Text,
    line: Text,
    status: StatusLabel,
    href: Href,
    image: Image,
    /** What kind of picture it is, printed under the plate ("Concept drawing"). */
    imageKind: Text,
    /** The live file whose status and new mark this plate shows when there is one. */
    project: ProjectSlug.optional(),
    /** The first plate: the larger name and the lit edge. */
    featured: z.literal(true).optional(),
    /** The column's share of the row against the other plates. Default 1. */
    weight: z.number().positive().optional(),
    /** The plate in the row, and stacked on a phone (default: the same frame). */
    frame: PlateFrame,
    phoneFrame: PlateFrame.optional(),
  })
  .strict();

export const HomeContent = z
  .object({
    schemaVersion: SchemaVersion,
    title: Text,
    hero: Hero,
    proof: z
      .object({
        label: Text,
        /** The words before a fact's date ("As of"), read out after the fact. */
        asOfLabel: Text.optional(),
        items: z.array(ProofItem).min(1),
      })
      .strict(),
    atWork: z
      .object({
        eyebrow: Text,
        title: Text,
        text: Text,
        link: Link,
        /** The pipeline rail: the accessible sentence, and the stops in order. */
        flow: z.object({ label: Text, steps: z.array(Text).min(2) }).strict(),
      })
      .strict(),
    ownTime: z
      .object({ title: Text, lead: Text, link: Link, plates: z.array(Plate).min(1) })
      .strict(),
    map: z.object({ title: Text, link: Link, mapLinkLabel: Text }).strict(),
    next: z.object({ label: Text, link: Link, aside: Link }).strict(),
  })
  .strict();

export type HomeContent = z.infer<typeof HomeContent>;
