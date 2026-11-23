import type { MouseEventHandler } from 'react';

import { RingMark } from '../../primitives';
import { cx } from '../internal/cx';
import type { LinkComponent } from '../internal/link';

export interface NavMarkProps {
  name: string;
  href: string;
  /** True on Home: the link is marked as the current page. */
  current: boolean;
  linkAs: LinkComponent;
  onClick?: MouseEventHandler<HTMLElement>;
}

/** The ring mark and the site name, linking Home. The same link heads the header and the menu. */
export function NavMark({ name, href, current, linkAs: Link, onClick }: NavMarkProps) {
  return (
    // TODO(tokens): the wordmark (18px, 600, 125% width) has no type role yet.
    <Link
      href={href}
      aria-current={current ? 'page' : undefined}
      onClick={onClick}
      className={cx(
        'group/mark inline-flex h-12 items-center gap-2.5 font-sans text-[18px] leading-none font-semibold tracking-[-0.01em] whitespace-nowrap text-primary no-underline [font-stretch:125%] hover:text-signal md:h-auto md:min-h-touch',
        'motion-ok:transition-colors motion-ok:duration-hover motion-ok:ease-[ease]',
      )}
    >
      <RingMark size={24} />
      <span>{name}</span>
    </Link>
  );
}
