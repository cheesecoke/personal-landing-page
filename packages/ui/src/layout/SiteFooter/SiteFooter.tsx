import type { HTMLAttributes } from 'react';

import { Label } from '../../primitives';
import { Container } from '../Container/Container';
import { cx } from '../internal/cx';
import type { LinkComponent, SiteLink } from '../internal/link';

export interface SiteFooterLastUpdate {
  /** The words before the date ("Last update"). */
  label: string;
  /** The date as shown ("20 Nov 2026"). */
  date: string;
  /** The machine-readable date for `<time datetime>` ("2026-11-20"). */
  dateTime: string;
}

export interface SiteFooterProps extends Omit<HTMLAttributes<HTMLElement>, 'role'> {
  /** The site name; links home. */
  name: string;
  /** Where the name links. Default `/`. */
  homeHref?: string;
  /** The line under the name (title and employer). */
  tagline?: string;
  /** The copyright line. */
  copyright: string;
  /** When the live content was last published. Omit it and the line is not rendered. */
  lastUpdate?: SiteFooterLastUpdate;
  /** The footer nav, in order. */
  links: readonly SiteLink[];
  /** Accessible name of the footer nav. */
  navLabel: string;
  /** The contact address, shown as a `mailto:` link. */
  email?: string;
  /** The element or component for internal links (the name and the nav). Default `a`. */
  linkAs?: LinkComponent;
}

const linkMotion = 'motion-ok:transition-colors motion-ok:duration-hover motion-ok:ease-[ease]';

/**
 * The site footer: the name, title and copyright on the left; the nav and the address on the
 * right. Under `md` the right block wraps below and lines up with the left edge.
 */
export function SiteFooter({
  name,
  homeHref = '/',
  tagline,
  copyright,
  lastUpdate,
  links,
  navLabel,
  email,
  linkAs: Link = 'a',
  className,
  ...rest
}: SiteFooterProps) {
  return (
    <Container as="footer" className={className} {...rest}>
      <div className="flex flex-wrap items-start justify-between gap-x-12 gap-y-8 border-t border-hairline pt-12 pb-13">
        <div className="flex flex-col gap-3">
          {/* TODO(tokens): the wordmark (18px, 600, 125% width) has no type role yet. */}
          <Link
            href={homeHref}
            className={cx(
              '-my-2.5 inline-flex min-h-touch items-center self-start font-sans text-[18px] leading-none font-semibold tracking-[-0.01em] text-primary no-underline [font-stretch:125%] hover:text-signal',
              linkMotion,
            )}
          >
            {name}
          </Link>
          {tagline ? <Label as="p">{tagline}</Label> : null}
          <Label as="p" className="mt-5">
            {copyright}
          </Label>
          {lastUpdate ? (
            <Label as="p">
              {lastUpdate.label} · <time dateTime={lastUpdate.dateTime}>{lastUpdate.date}</time>
            </Label>
          ) : null}
        </div>
        <div className="-mt-2.5 flex flex-wrap items-start gap-x-6 gap-y-2 md:items-center">
          <nav aria-label={navLabel} className="-ml-3 flex flex-wrap items-center md:ml-0">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cx(
                  'inline-flex min-h-touch items-center px-3 type-link no-underline hover:text-signal',
                  link.quiet ? 'text-label' : 'text-secondary',
                  linkMotion,
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          {email ? (
            <>
              <span aria-hidden="true" className="hidden h-4 w-px bg-hairline md:block" />
              <a
                href={`mailto:${email}`}
                className={cx(
                  'inline-flex min-h-touch items-center type-link text-primary no-underline hover:text-signal',
                  linkMotion,
                )}
              >
                {email}
              </a>
            </>
          ) : null}
        </div>
      </div>
    </Container>
  );
}
