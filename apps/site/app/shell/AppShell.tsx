import type { ReactNode } from 'react';
import { useLocation } from 'react-router';

import { useFreshness } from '@cwc/content/react';
import { Grain, SiteFooter, SiteNav, SkipLink } from '@cwc/ui';

import { RouterLink } from './RouterLink';
import { currentNavHref, formatLastUpdate, navLinks, shellLinks, site } from './site';

/** The footer's words: the `footer` of hand content's `site.json`. */
export interface ShellFooter {
  name: string;
  role: string;
  copyright: string;
  navLabel: string;
  email: { label: string; href: string };
}

export interface AppShellProps {
  /** The site name and the footer copy, from hand content. */
  footer: ShellFooter;
  /** ISO date or datetime of the last content publish. Without it the footer shows no date. */
  lastUpdate?: string;
  children: ReactNode;
}

/**
 * The persistent layout: skip link, nav, the page in `main`, footer. The nav and footer stay
 * mounted across navigations, so the nav timeline travels and only `main` cross-fades.
 *
 * The nav's release ring comes from the nearest `FreshnessProvider` above the shell (the root's,
 * fed with every project): it shows after hydration while a release is a week old at most.
 */
export function AppShell({ footer, lastUpdate, children }: AppShellProps) {
  const { pathname } = useLocation();
  const { navRing } = useFreshness();
  return (
    <div className="relative flex min-h-dvh flex-col overflow-x-clip bg-ground text-primary">
      <SkipLink>{site.skipLabel}</SkipLink>
      <Grain />
      <header className="relative">
        <SiteNav
          name={footer.name}
          label={site.navLabel}
          items={navLinks(navRing)}
          current={currentNavHref(pathname)}
          linkAs={RouterLink}
        />
      </header>
      <main id="main" tabIndex={-1} className="app-main relative flex-1 outline-none">
        {children}
      </main>
      <SiteFooter
        className="relative"
        name={footer.name}
        tagline={footer.role}
        copyright={footer.copyright}
        navLabel={footer.navLabel}
        links={shellLinks}
        email={footer.email.label}
        linkAs={RouterLink}
        lastUpdate={
          lastUpdate ? { label: site.lastUpdateLabel, ...formatLastUpdate(lastUpdate) } : undefined
        }
      />
    </div>
  );
}
