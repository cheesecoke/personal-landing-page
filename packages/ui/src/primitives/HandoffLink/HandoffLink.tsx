import type { ElementType, ReactNode } from 'react';

import { ArrowIcon, type ArrowSize } from '../ArrowIcon/ArrowIcon';
import { cx } from '../cx';
import { Label } from '../Label/Label';
import type { PolymorphicProps } from '../polymorphic';

/**
 * `page`: the hand-off at the foot of a main page. `home`: the Home one, with the arrow in
 * Signal. `project`: the smaller "Next project" link.
 */
export type HandoffVariant = 'page' | 'home' | 'project';

const links: Record<HandoffVariant, string> = {
  page: 'type-h1 hover:text-signal',
  home: 'type-h1 hover:text-primary',
  project:
    'type-handoff hover:text-signal motion-ok:transition-colors motion-ok:duration-hover motion-ok:ease-[ease]',
};

const arrows: Record<HandoffVariant, ArrowSize> = {
  page: 'lg',
  home: 'lgRound',
  project: 'lgLow',
};

interface HandoffLinkOwnProps {
  /** The small label above the link ("Next", "Next project"). */
  label?: ReactNode;
  variant?: HandoffVariant;
  /** Classes for the wrapper around the label and the link. */
  wrapperClassName?: string;
}

export type HandoffLinkProps<E extends ElementType = 'a'> = PolymorphicProps<
  E,
  HandoffLinkOwnProps
>;

/**
 * The hand-off: a label and one large link to the next page, with a long arrow that slides on
 * hover. Renders `<a>`; pass `as` to render a router link.
 */
export function HandoffLink<E extends ElementType = 'a'>({
  as,
  label,
  variant = 'page',
  wrapperClassName,
  className,
  children,
  ...rest
}: HandoffLinkProps<E>) {
  const Component: ElementType = as ?? 'a';
  return (
    <div className={cx('flex min-w-0 flex-col gap-3', wrapperClassName)}>
      {label ? <Label as="p">{label}</Label> : null}
      <Component
        className={cx(
          'group/link inline-flex min-h-touch flex-wrap items-center gap-x-5 gap-y-2 self-start no-underline',
          links[variant],
          className as string | undefined,
        )}
        {...rest}
      >
        {children}
        <ArrowIcon
          size={arrows[variant]}
          className={cx(
            'group-hover/link:translate-x-1.5 group-focus-visible/link:translate-x-1.5',
            'motion-ok:transition-transform motion-ok:duration-arrow motion-ok:ease-out',
            variant === 'home' && 'text-signal',
          )}
        />
      </Component>
    </div>
  );
}
