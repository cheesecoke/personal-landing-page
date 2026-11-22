import { z } from 'zod';

/**
 * Shared building blocks for hand-written content (`apps/site/content/hand`).
 * Every object is strict: an unknown key fails the build instead of being dropped.
 */

export const HAND_SCHEMA_VERSION = 1;
export const SchemaVersion = z.literal(HAND_SCHEMA_VERSION);

/** A piece of copy: not empty, and no stray space at either end. */
export const Text = z
  .string()
  .min(1)
  .refine((value) => value === value.trim(), 'copy must not start or end with whitespace');

/** A site route with an optional anchor, an anchor on the same page, a mail link, or an https URL. */
export const Href = z
  .string()
  .regex(
    /^(\/(?:[a-z0-9-]+(?:\/[a-z0-9-]+)*)?(?:#[A-Za-z0-9-]+)?|#[A-Za-z0-9-]+|mailto:[^\s@]+@[^\s@]+|https:\/\/[^\s]+)$/,
    'href must be a site path, an anchor, a mailto: link or an https URL',
  );

export const Link = z.object({ label: Text, href: Href }).strict();

/**
 * One run inside a paragraph. A plain string is plain text; an object carries a link or a bold
 * lead-in. Runs are joined as written, so the spaces between them live in the strings.
 */
export const Span = z.union([
  z.string().min(1),
  z
    .object({
      text: z.string().min(1),
      href: Href.optional(),
      strong: z.literal(true).optional(),
    })
    .strict(),
]);

/** A paragraph: one string, or a list of runs when it holds a link or a bold lead-in. */
export const Paragraph = z.union([Text, z.array(Span).min(2)]);

/** A marker the design left for Chase, kept word for word, e.g. `[CONFIRM: ...]`. */
export const Confirm = z.string().regex(/^\[CONFIRM: .+\]$/);

/** A file under `apps/site/public`, written as the URL path it is served at. */
export const MediaPath = z
  .string()
  .regex(/^\/media\/[a-z0-9-]+(?:\/[a-z0-9-]+)*\.(?:avif|webp|png|jpg|mp4)$/);

export const ImageSource = z
  .object({ src: MediaPath, type: z.enum(['image/avif', 'image/webp']) })
  .strict();

/**
 * An image. `src` is the file every browser can show; `sources` lists smaller modern formats,
 * best first, for a `<picture>`. `alt` is empty only when the image is decoration.
 */
export const Image = z
  .object({
    src: MediaPath,
    width: z.number().int().positive(),
    height: z.number().int().positive(),
    alt: z.string(),
    sources: z.array(ImageSource).min(1).optional(),
  })
  .strict();

/** A muted, looping screen recording or clip. `label` is its accessible name. */
export const Video = z
  .object({
    src: MediaPath,
    width: z.number().int().positive(),
    height: z.number().int().positive(),
    poster: MediaPath.optional(),
    label: Text.optional(),
  })
  .strict();

/** An image with the caption printed under it. */
export const Figure = z.object({ image: Image, caption: Text.optional() }).strict();

/** A status word as the board shows it. Live data replaces it when a project has a live file. */
export const StatusLabel = Text;

export type Link = z.infer<typeof Link>;
export type Span = z.infer<typeof Span>;
export type Paragraph = z.infer<typeof Paragraph>;
export type Image = z.infer<typeof Image>;
export type ImageSource = z.infer<typeof ImageSource>;
export type Video = z.infer<typeof Video>;
export type Figure = z.infer<typeof Figure>;

/** Normalise a paragraph to runs, so a renderer handles one shape. */
export function toSpans(paragraph: Paragraph): Exclude<Span, string>[] {
  const runs = typeof paragraph === 'string' ? [paragraph] : paragraph;
  return runs.map((run) => (typeof run === 'string' ? { text: run } : run));
}

/** The plain text of a paragraph, for search, tests and meta descriptions. */
export function paragraphText(paragraph: Paragraph): string {
  return toSpans(paragraph)
    .map((run) => run.text)
    .join('');
}
