import type { ComponentPropsWithoutRef } from 'react';
import { Link } from 'react-router';

type RouterLinkProps = Omit<ComponentPropsWithoutRef<typeof Link>, 'to'> & { href: string };

/**
 * The adapter the `@cwc/ui` components take as `linkAs` / `as`: they pass `href`, the router wants
 * `to`. Every internal navigation asks for a view transition (the shell cross-fades `main`).
 */
export function RouterLink({ href, ...rest }: RouterLinkProps) {
  return <Link to={href} viewTransition {...rest} />;
}
