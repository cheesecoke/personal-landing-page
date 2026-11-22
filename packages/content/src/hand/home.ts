import { z } from 'zod';

import { Href, Image, Link, SchemaVersion, StatusLabel, Text } from './primitives';

/** A project name on the stump: the callout on wide screens, a list row on phones. */
const StumpProject = z.object({ name: Text, status: StatusLabel, href: Href }).strict();

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
  })
  .strict();

const Plate = z
  .object({
    name: Text,
    line: Text,
    status: StatusLabel,
    href: Href,
    image: Image,
    /** What kind of picture it is, printed under the plate ("Concept drawing"). */
    imageKind: Text,
  })
  .strict();

export const HomeContent = z
  .object({
    schemaVersion: SchemaVersion,
    title: Text,
    hero: Hero,
    proof: z.object({ label: Text, items: z.array(ProofItem).min(1) }).strict(),
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
