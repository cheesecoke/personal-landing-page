import type { ElementType } from 'react';

import { ArrowIcon } from '../ArrowIcon/ArrowIcon';
import { cx } from '../cx';
import type { PolymorphicProps } from '../polymorphic';

export type TextLinkSize = 'link' | 'body' | 'lead';
export type TextLinkTone = 'primary' | 'secondary';

const sizes: Record<TextLinkSize, string> = {
  link: 'gap-2.5 type-link',
  body: 'gap-2.5 type-body',
  lead: 'gap-3 type-lead',
};

const tones: Record<TextLinkTone, string> = {
  primary: 'text-primary',
  secondary: 'text-secondary',
};

interface TextLinkOwnProps {
  /** `link` is the 14px link; `body` and `lead` set the link in that type role. */
  size?: TextLinkSize;
  tone?: TextLinkTone;
  /** The arrow after the text; it slides on hover. `false` for none. */
  arrow?: 'sm' | 'md' | false;
  /**
   * A link inside a sentence: underlined, in the surrounding type, with no arrow and no
   * touch-target box.
   */
  inline?: boolean;
}

export type TextLinkProps<E extends ElementType = 'a'> = PolymorphicProps<E, TextLinkOwnProps>;

/** A text link. Renders `<a>`; pass `as` to render a router link. */
export function TextLink<E extends ElementType = 'a'>({
  as,
  size = 'link',
  tone = 'primary',
  arrow = 'sm',
  inline = false,
  className,
  children,
  ...rest
}: TextLinkProps<E>) {
  const Component: ElementType = as ?? 'a';

  if (inline) {
    return (
      <Component
        className={cx(
          'text-primary underline decoration-signal-dim underline-offset-4 hover:text-signal',
          'motion-ok:transition-colors motion-ok:duration-hover',
          className as string | undefined,
        )}
        {...rest}
      >
        {children}
      </Component>
    );
  }

  return (
    <Component
      className={cx(
        'group/link inline-flex min-h-touch items-center no-underline hover:text-signal',
        'motion-ok:transition-colors motion-ok:duration-hover motion-ok:ease-[ease]',
        sizes[size],
        tones[tone],
        className as string | undefined,
      )}
      {...rest}
    >
      {children}
      {arrow ? (
        <ArrowIcon
          size={arrow}
          className={cx(
            'motion-ok:transition-transform motion-ok:duration-arrow motion-ok:ease-out',
            arrow === 'sm'
              ? 'group-hover/link:translate-x-1.5 group-focus-visible/link:translate-x-1.5'
              : 'group-hover/link:translate-x-1 group-focus-visible/link:translate-x-1',
          )}
        />
      ) : null}
    </Component>
  );
}
