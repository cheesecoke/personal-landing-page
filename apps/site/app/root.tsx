import type { ReactNode } from 'react';
import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from 'react-router';

import monaSans from '@cwc/tokens/fonts/mona-sans-latin-wdth-normal.woff2?url';
import tomorrow500 from '@cwc/tokens/fonts/tomorrow-latin-500-normal.woff2?url';

import type { Route } from './+types/root';
import stylesheet from './app.css?url';
import { AppShell } from './shell/AppShell';
import { pageTitle, PlaceholderPage } from './shell/PlaceholderPage';

const preloadFont = (href: string) =>
  ({ rel: 'preload', href, as: 'font', type: 'font/woff2', crossOrigin: 'anonymous' }) as const;

export const links: Route.LinksFunction = () => [
  preloadFont(monaSans),
  preloadFont(tomorrow500),
  { rel: 'stylesheet', href: stylesheet },
];

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

export default function App() {
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  const notFound = isRouteErrorResponse(error) && error.status === 404;
  const title = notFound ? 'Page not found' : 'Something went wrong';
  return (
    <AppShell>
      <title>{pageTitle(title)}</title>
      <PlaceholderPage title={title} />
    </AppShell>
  );
}
