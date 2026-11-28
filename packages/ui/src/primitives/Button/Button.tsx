import type { ElementType } from 'react';

import { ArrowIcon } from '../ArrowIcon/ArrowIcon';
import { cx } from '../cx';
import styles from '../NextStep/NextStep.module.css';
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
  /**
   * This is the page's next step: when the visitor rests, its arrow eases forward and a light runs
   * under its edge, once (`NextStepHint` decides when). One per page.
   */
  nextStep?: boolean;
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
  nextStep = false,
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
        nextStep && styles.target,
        nextStep && styles.edge,
        className as string | undefined,
      )}
      data-next-step={nextStep ? '' : undefined}
      href={href}
      {...buttonType}
      {...rest}
    >
      {children}
      {arrow ? <ArrowIcon size="sm" className={nextStep ? styles.arrow : undefined} /> : null}
    </Component>
  );
}
