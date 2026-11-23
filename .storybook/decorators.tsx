import type { Decorator } from '@storybook/react-vite';
import { useEffect, type ReactNode } from 'react';
import { MemoryRouter } from 'react-router';

import { FreshnessProvider } from '@cwc/content/react';

import { resolveSiteDate } from './site-date';

/** Mirror a toolbar value onto `<html data-*>`; `undefined` removes the attribute. */
function RootData({
  name,
  value,
  children,
}: {
  name: string;
  value: string | undefined;
  children: ReactNode;
}) {
  useEffect(() => {
    const root = document.documentElement;
    if (value === undefined) delete root.dataset[name];
    else root.dataset[name] = value;
  }, [name, value]);
  return children;
}

/**
 * Reduced-motion toolbar. `reduce` sets `[data-motion="reduce"]` on the root, the same switch the
 * site mirrors from the OS setting. `system` leaves it to the OS.
 */
export const withMotion: Decorator = (Story, context) => (
  <RootData name="motion" value={context.globals.motion === 'reduce' ? 'reduce' : undefined}>
    <Story />
  </RootData>
);

/**
 * Site-date toolbar. The resolved date is on `<html data-site-date>`, in `globals.siteDate`, and
 * is "now" for every story through FreshnessProvider, so freshness can be scrubbed. A story (or a
 * template) that nests its own FreshnessProvider with candidates inherits this date.
 */
export const withSiteDate: Decorator = (Story, context) => {
  const siteDate = resolveSiteDate(context.globals.siteDate);
  return (
    <RootData name="siteDate" value={siteDate}>
      <FreshnessProvider now={siteDate}>
        <Story />
      </FreshnessProvider>
    </RootData>
  );
};

/**
 * Router context, so components and templates that render links work in a story. Set
 * `parameters.router.path` to the URL the story should be "on" (default `/`).
 */
export const withRouter: Decorator = (Story, context) => {
  const path = (context.parameters.router as { path?: string } | undefined)?.path ?? '/';
  return (
    <MemoryRouter key={path} initialEntries={[path]}>
      <Story />
    </MemoryRouter>
  );
};
