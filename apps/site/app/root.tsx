import type { ReactNode } from 'react';
import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useRouteLoaderData,
} from 'react-router';

import { FreshnessProvider } from '@cwc/content/react';
import monaSans from '@cwc/tokens/fonts/mona-sans-latin-wdth-normal.woff2?url';
import tomorrow500 from '@cwc/tokens/fonts/tomorrow-latin-500-normal.woff2?url';
import { faviconLinks } from '@cwc/ui';

import type { Route } from './+types/root';
import stylesheet from './app.css?url';
import { handContent } from './content/hand.server';
import { freshCandidates, liveContent } from './content/live.server';
import { AppShell } from './shell/AppShell';
import { motionMirrorScript } from './shell/motion';
import { pageTitle, PlaceholderPage } from './shell/PlaceholderPage';
import { soundMirrorScript } from './sound/preference';

const preloadFont = (href: string) =>
  ({ rel: 'preload', href, as: 'font', type: 'font/woff2', crossOrigin: 'anonymous' }) as const;

export const links: Route.LinksFunction = () => [
  preloadFont(monaSans),
  preloadFont(tomorrow500),
  { rel: 'stylesheet', href: stylesheet },
  ...faviconLinks,
];

/**
 * What every page shows: the site name and the footer from hand content, and from live data the
 * date of the last publish and every project's change date (the nav's release ring reads them).
 */
export function loader() {
  const live = liveContent();
  return {
    footer: handContent().site.footer,
    lastUpdate: live.meta?.publishedAt ?? null,
    fresh: freshCandidates(live.projects),
  };
}

type ShellData = ReturnType<typeof loader>;

/** The shell around a page, with the one root `FreshnessProvider` (it supplies today's date). */
function Shell({ data, children }: { data: ShellData; children: ReactNode }) {
  return (
    <FreshnessProvider candidates={data.fresh}>
      <AppShell footer={data.footer} lastUpdate={data.lastUpdate ?? undefined}>
        {children}
      </AppShell>
    </FreshnessProvider>
  );
}

export function Layout({ children }: { children: ReactNode }) {
  return (
    // The script below sets `data-motion` on this element before React hydrates it.
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <script dangerouslySetInnerHTML={{ __html: motionMirrorScript }} />
        {/* Sets `data-sound="off"` for a visitor who turned sound off, so the header shows it. */}
        <script dangerouslySetInnerHTML={{ __html: soundMirrorScript }} />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App({ loaderData }: Route.ComponentProps) {
  return (
    <Shell data={loaderData}>
      <Outlet />
    </Shell>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  const notFound = isRouteErrorResponse(error) && error.status === 404;
  const title = notFound ? 'Page not found' : 'Something went wrong';
  const shell = useRouteLoaderData<typeof loader>('root');
  const page = (
    <>
      <title>{pageTitle(title)}</title>
      <PlaceholderPage title={title} />
    </>
  );
  // The shell needs the root loader's data; if that is what failed, show the page bare.
  return shell ? <Shell data={shell}>{page}</Shell> : page;
}
