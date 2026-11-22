import type { ElementType } from 'react';

import { ArrowIcon } from '../ArrowIcon/ArrowIcon';
import { cx } from '../cx';
import type { PolymorphicProps } from '../polymorphic';

/** `primary`: Bone fill, one per view. `quiet`: a hairline border. */
export type ButtonVariant = 'primary' | 'quiet';

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-bone text-ground hover:bg-hinoki hover:text-ground',
  quiet: 'border border-hairline bg-transparent text-bone hover:border-signal hover:text-signal',
};

interface ButtonOwnProps {
  variant?: ButtonVariant;
  /** Adds the small arrow after the label. */
  arrow?: boolean;
  /** With an `href` (and no `as`) the button renders as a link. */
  href?: string;
  target?: string;
  rel?: string;
}

export type ButtonProps<E extends ElementType = 'button'> = PolymorphicProps<E, ButtonOwnProps>;

/**
 * A button. Renders `<button type="button">`, or `<a>` when it has an `href`; pass `as` to render
 * a router link.
 */
export function Button<E extends ElementType = 'button'>({
  as,
  variant = 'primary',
  arrow = false,
  href,
  className,
  children,
  ...rest
}: ButtonProps<E>) {
  const Component: ElementType = as ?? (href === undefined ? 'button' : 'a');
  const buttonType = Component === 'button' && !('type' in rest) ? { type: 'button' } : null;
  return (
    <Component
      className={cx(
        'box-border inline-flex min-h-touch cursor-pointer items-center gap-3 rounded-button px-5.5 py-3.5 type-button no-underline',
        'motion-ok:transition-colors motion-ok:duration-hover motion-ok:ease-[ease]',
        variants[variant],
        className as string | undefined,
      )}
      href={href}
      {...buttonType}
      {...rest}
    >
      {children}
      {arrow ? <ArrowIcon size="sm" /> : null}
    </Component>
  );
}
