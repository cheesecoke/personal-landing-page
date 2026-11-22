import type { ReactNode } from 'react';
import { Link, NavLink } from 'react-router';

import { navItems } from '../paths';

/**
 * Placeholder shell so every route renders inside one persistent layout. The real AppShell,
 * SiteNav and SiteFooter come from `@cwc/ui` and replace this file.
 */
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <>
      <header className="mx-auto max-w-page px-gutter">
        <nav
          aria-label="Site"
          className="flex min-h-touch flex-wrap items-center justify-between gap-x-8 border-b border-hairline"
        >
          <Link to="/" className="type-h3 no-underline">
            Chase Cole
          </Link>
          <ul className="m-0 flex list-none gap-2 p-0">
            {navItems.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className="flex min-h-touch items-center px-3 type-body no-underline"
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </header>
      <main id="main" className="mx-auto max-w-page px-gutter py-16">
        {children}
      </main>
    </>
  );
}
