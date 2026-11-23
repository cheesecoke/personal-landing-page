import type { ReactNode } from 'react';

/** One smaller, modern file for an image: where it is and its media type (`image/avif`). */
export interface PictureSource {
  src: string;
  type: string;
}

export interface PictureProps {
  /** Smaller modern formats, best first. The browser takes the first it can show. */
  sources?: readonly PictureSource[];
  /**
   * A media query for when the image is not on show (its layout is hidden at that width). While
   * it matches the browser fetches nothing for this image; a hidden `<img>` would otherwise still
   * download its file.
   */
  skipWhen?: string;
  /** The `<img>`: the file every browser can show. It keeps its own classes and size. */
  children: ReactNode;
}

/** A 1x1 transparent GIF: what a skipped image "loads" instead of its file. */
const NOTHING = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';

/**
 * Wraps an `<img>` in a `<picture>` so the browser can pick a smaller format, and falls back to
 * the image itself. With no sources it renders the image alone. The `<picture>` takes no box of
 * its own (`display: contents`), so the image is laid out exactly as it was without it.
 */
export function Picture({ sources, skipWhen, children }: PictureProps) {
  if (!sources?.length && !skipWhen) return children;
  return (
    <picture className="contents">
      {skipWhen ? <source media={skipWhen} srcSet={NOTHING} /> : null}
      {sources?.map((source) => (
        <source key={source.src} srcSet={source.src} type={source.type} />
      ))}
      {children}
    </picture>
  );
}
