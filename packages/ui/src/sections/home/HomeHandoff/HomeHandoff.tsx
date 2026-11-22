import { Container, type LinkComponent } from '../../../layout';
import { cx, HandoffLink, TextLink } from '../../../primitives';

export interface HomeHandoffProps {
  /** The landmark's accessible name ("Next"). */
  'aria-label': string;
  /** The small label above the link ("Next"). */
  label: string;
  /** The next page: the large link ("Projects"). */
  next: { label: string; href: string };
  /** The quiet line on the right ("Building with agents too? Write to me."). */
  aside?: { label: string; href: string };
  /** The element or component for the links. Default `a`. It receives `href`. */
  linkAs?: LinkComponent;
  className?: string;
}

/**
 * The foot of Home: the hand-off to the next page on the left, with its arrow in Signal, and one
 * quiet line to Contact on the right. Under a 560px slot the two stack. It sits below the thread,
 * in the page column.
 */
export function HomeHandoff({
  'aria-label': ariaLabel,
  label,
  next,
  aside,
  linkAs,
  className,
}: HomeHandoffProps) {
  return (
    <section aria-label={ariaLabel} className={cx('relative pb-14', className)}>
      <Container query>
        <div className="flex flex-col flex-wrap items-start justify-between gap-x-12 gap-y-8 @sm:flex-row @sm:items-end">
          <HandoffLink as={linkAs} href={next.href} label={label} variant="home">
            {next.label}
          </HandoffLink>
          {aside ? (
            <TextLink as={linkAs} href={aside.href} size="body" tone="secondary">
              {aside.label}
            </TextLink>
          ) : null}
        </div>
      </Container>
    </section>
  );
}
