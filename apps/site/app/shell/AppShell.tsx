import type { ReactNode } from 'react';
import { useLocation } from 'react-router';

import { Grain, SiteFooter, SiteNav } from '@cwc/ui';

import { RouterLink } from './RouterLink';
import { currentNavHref, formatLastUpdate, shellLinks, site } from './site';

export interface AppShellProps {
  /** ISO date or datetime of the last content publish. Without it the footer shows no date. */
  lastUpdate?: string;
  children: ReactNode;
}

/**
 * The persistent layout: skip link, nav, the page in `main`, footer. The nav and footer stay
 * mounted across navigations, so the nav timeline travels and only `main` cross-fades.
 */
export function AppShell({ lastUpdate, children }: AppShellProps) {
  const { pathname } = useLocation();
  return (
    <div className="relative flex min-h-dvh flex-col overflow-x-clip bg-ground text-primary">
      {/* TODO(primitives): swap to <SkipLink> */}
      <a
        href="#main"
        className="sr-only type-link focus-visible:not-sr-only focus-visible:absolute focus-visible:top-2 focus-visible:left-2 focus-visible:z-10 focus-visible:flex focus-visible:min-h-touch focus-visible:items-center focus-visible:rounded-button focus-visible:bg-raised focus-visible:px-4"
      >
        {site.skipLabel}
      </a>
      <Grain />
      <header className="relative">
        <SiteNav
          name={site.name}
          label={site.navLabel}
          items={shellLinks}
          current={currentNavHref(pathname)}
          linkAs={RouterLink}
        />
      </header>
      <main id="main" tabIndex={-1} className="app-main relative flex-1 outline-none">
        {children}
      </main>
      <SiteFooter
        className="relative"
        name={site.name}
        tagline={site.tagline}
        copyright={site.copyright}
        navLabel={site.footerNavLabel}
        links={shellLinks}
        email={site.email}
        linkAs={RouterLink}
        lastUpdate={
          lastUpdate ? { label: site.lastUpdateLabel, ...formatLastUpdate(lastUpdate) } : undefined
        }
      />
    </div>
  );
}
