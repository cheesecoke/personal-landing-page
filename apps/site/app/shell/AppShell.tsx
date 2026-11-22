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
      <header>
        <nav aria-label="Site">
          <Link to="/">Chase Cole</Link>
          <ul>
            {navItems.map((item) => (
              <li key={item.to}>
                <NavLink to={item.to}>{item.label}</NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </header>
      <main id="main">{children}</main>
    </>
  );
}
