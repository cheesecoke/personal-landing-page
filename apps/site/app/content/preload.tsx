/** An image as hand content gives it: the file every browser shows, and smaller modern formats. */
interface PreloadedImage {
  src: string;
  sources?: readonly { src: string; type: string }[];
}

/**
 * A high-priority preload for a page's largest image, in the format the browser will pick: the
 * first modern source, else the fallback. An `<img>` inside a `<picture>` is otherwise found late
 * and fetched after the scripts. `media` limits it to the screens that show the image.
 */
export function PreloadImage({ image, media }: { image: PreloadedImage; media?: string }) {
  const best = image.sources?.[0];
  return (
    <link
      rel="preload"
      as="image"
      href={best?.src ?? image.src}
      type={best?.type}
      media={media}
      fetchPriority="high"
    />
  );
}
