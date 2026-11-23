import { useId, type ElementType, type ReactNode } from 'react';

import { ThreadSection, type LinkComponent } from '../../../layout';
import { cx, Heading, TextLink } from '../../../primitives';

export interface ProjectMapTeaserProps {
  /** The section title ("How my projects connect."). */
  title: string;
  /** The link under the title ("Open the map"). */
  link?: { label: string; href: string };
  /**
   * Makes the whole map one link, with this accessible name ("Open the project map"). The map is
   * then a picture: it is hidden from assistive technology and the link's name stands in for it.
   * Leave it out when the map handles its own interaction.
   */
  mapLink?: { label: string; href: string };
  /** The map teaser itself (the canopy package's teaser). It sets its own height. */
  children?: ReactNode;
  /** The element or component for the links. Default `a`. It receives `href`. */
  linkAs?: LinkComponent;
  className?: string;
}

/**
 * Home's map section: the title and a link on the left, the tree map teaser on the right. From a
 * 900px slot they sit side by side; below that the map goes under the title. The map is a slot:
 * this section only frames it. It is a section on the Home thread.
 */
export function ProjectMapTeaser({
  title,
  link,
  mapLink,
  children,
  linkAs,
  className,
}: ProjectMapTeaserProps) {
  const titleId = useId();
  const MapLink: ElementType = linkAs ?? 'a';
  return (
    <ThreadSection
      placement="edge"
      nodeTop={-4}
      aria-labelledby={titleId}
      className={cx('pb-14', className)}
    >
      <div className="@container">
        <div className="grid grid-cols-1 items-start gap-x-12 gap-y-6 border-t border-hairline pt-10 @lg:grid-cols-[minmax(0,1fr)_minmax(0,2.4fr)]">
          <div className="flex flex-col items-start self-center">
            <Heading level={2} id={titleId} className="max-w-[14ch]">
              {title}
            </Heading>
            {link ? (
              <TextLink as={linkAs} href={link.href} className="mt-4">
                {link.label}
              </TextLink>
            ) : null}
          </div>
          {mapLink ? (
            <MapLink
              href={mapLink.href}
              aria-label={mapLink.label}
              className="relative block min-w-0"
            >
              <div aria-hidden="true">{children}</div>
            </MapLink>
          ) : (
            <div className="relative min-w-0">{children}</div>
          )}
        </div>
      </div>
    </ThreadSection>
  );
}
