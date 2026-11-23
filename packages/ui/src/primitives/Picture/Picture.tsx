import type { ReactNode } from 'react';

/** One smaller, modern file for an image: where it is and its media type (`image/avif`). */
export interface PictureSource {
  src: string;
  type: string;
}

export interface PictureProps {
  /** Smaller modern formats, best first. The browser takes the first it can show. */
  sources?: readonly PictureSource[];
  /** The `<img>`: the file every browser can show. It keeps its own classes and size. */
  children: ReactNode;
}

/**
 * Wraps an `<img>` in a `<picture>` so the browser can pick a smaller format, and falls back to
 * the image itself. With no sources it renders the image alone. The `<picture>` takes no box of
 * its own (`display: contents`), so the image is laid out exactly as it was without it.
 */
export function Picture({ sources, children }: PictureProps) {
  if (!sources?.length) return children;
  return (
    <picture className="contents">
      {sources.map((source) => (
        <source key={source.src} srcSet={source.src} type={source.type} />
      ))}
      {children}
    </picture>
  );
}
