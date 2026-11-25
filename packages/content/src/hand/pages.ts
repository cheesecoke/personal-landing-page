import { z } from 'zod';

import { Confirm, Href, Image, Link, SchemaVersion, Text } from './primitives';

/** Beyond: a page that is not open yet, and the slots that say what will be there. */
export const BeyondContent = z
  .object({
    schemaVersion: SchemaVersion,
    title: Text,
    header: z.object({ title: Text, lead: Text, status: Text, note: Text }).strict(),
    scene: z
      .object({
        /** Accessible name of the section. */
        label: Text,
        /** Decoration behind the slots. */
        image: Image,
        slots: z
          .array(
            z
              .object({
                /** An anchor other pages link to. */
                id: z
                  .string()
                  .regex(/^[a-z][a-z0-9-]*$/)
                  .optional(),
                title: Text,
                text: Text,
                size: z.enum(['regular', 'small']),
                /** Markers the design left open on this slot, word for word. */
                confirm: z.array(Confirm).min(1).optional(),
              })
              .strict(),
          )
          .min(1),
      })
      .strict(),
    next: z.object({ label: Text, eyebrow: Text, link: Link }).strict(),
  })
  .strict();

/**
 * The words of the portal's way in: the button's name, and the short question it asks before the
 * reader goes through.
 */
export const PortalEntry = z
  .object({
    /** The accessible name of the button over the ring's opening. */
    label: Text,
    dialog: z
      .object({
        title: Text,
        /** One line under the title. */
        body: Text,
        /** The primary answer. */
        enter: Text,
        /** The quiet answer. */
        cancel: Text,
      })
      .strict(),
  })
  .strict();

/** Contact: one line, the ways to reach Chase, and the portal render beside them. */
export const ContactContent = z
  .object({
    schemaVersion: SchemaVersion,
    title: Text,
    header: z.object({ title: Text, lead: Text }).strict(),
    /**
     * The portal: decoration, so its `alt` is empty. `entry` holds the words for the button and
     * question that make it a way in; the page only uses them when it turns that on.
     */
    portal: Image.extend({ entry: PortalEntry.optional() }).strict(),
    channels: z
      .array(
        z
          .object({
            name: Text,
            /** What is printed as the link. */
            label: Text,
            href: Href,
            /** The first channel is set larger. */
            primary: z.boolean(),
          })
          .strict(),
      )
      .min(1),
  })
  .strict();

/** Words that sit outside any one page: the footer. */
export const SiteContent = z
  .object({
    schemaVersion: SchemaVersion,
    footer: z
      .object({
        name: Text,
        role: Text,
        copyright: Text,
        /** Accessible name of the footer links. */
        navLabel: Text,
        email: Link,
      })
      .strict(),
  })
  .strict();

export type BeyondContent = z.infer<typeof BeyondContent>;
export type ContactContent = z.infer<typeof ContactContent>;
export type PortalEntry = z.infer<typeof PortalEntry>;
export type SiteContent = z.infer<typeof SiteContent>;
