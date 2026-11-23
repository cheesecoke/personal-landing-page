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

import monaSans from '@cwc/tokens/fonts/mona-sans-latin-wdth-normal.woff2?url';
import tomorrow500 from '@cwc/tokens/fonts/tomorrow-latin-500-normal.woff2?url';
import { faviconLinks } from '@cwc/ui';

import type { Route } from './+types/root';
import stylesheet from './app.css?url';
import { handContent } from './content/hand.server';
import { AppShell } from './shell/AppShell';
import { pageTitle, PlaceholderPage } from './shell/PlaceholderPage';

const preloadFont = (href: string) =>
  ({ rel: 'preload', href, as: 'font', type: 'font/woff2', crossOrigin: 'anonymous' }) as const;

export const links: Route.LinksFunction = () => [
  preloadFont(monaSans),
  preloadFont(tomorrow500),
  { rel: 'stylesheet', href: stylesheet },
  ...faviconLinks,
];

/** The words every page shows: the site name and the footer, from hand content. */
export function loader() {
  return { footer: handContent().site.footer };
}

export function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
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
    <AppShell footer={loaderData.footer}>
      <Outlet />
    </AppShell>
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
  return shell ? <AppShell footer={shell.footer}>{page}</AppShell> : page;
}
