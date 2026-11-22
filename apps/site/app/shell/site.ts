import { navItems } from '../paths';

/**
 * The words the shell shows on every page, taken from the SiteNav and SiteFooter boards.
 * TODO(content): move these to hand content once it has a site-wide file; the title and the year
 * then come from the live data (current role, last publish).
 */
export const site = {
  name: 'Chase Cole',
  tagline: 'Senior Software Engineer, AI · Titan Intake',
  copyright: '© 2026 Chase Cole',
  email: 'chasewcole@gmail.com',
  navLabel: 'Site',
  footerNavLabel: 'Footer',
  skipLabel: 'Skip to content',
  lastUpdateLabel: 'Last update',
} as const;

/** Pages that are not open yet are set quieter in the nav and footer. */
const quiet: ReadonlySet<string> = new Set(['/beyond']);

export const shellLinks = navItems.map((item) => ({
  label: item.label,
  href: item.to,
  quiet: quiet.has(item.to),
}));

/**
 * Which nav item a URL belongs to: Home for `/`, Projects for every project page and the job
 * page, the item itself for About, Beyond and Contact. Anything else (the 404 page) has none.
 */
export function currentNavHref(pathname: string): string | undefined {
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;
  if (path === '/' || path === '') return '/';
  if (path === '/projects' || path.startsWith('/projects/') || path.startsWith('/work/')) {
    return '/projects';
  }
  return navItems.find((item) => path === item.to || path.startsWith(`${item.to}/`))?.to;
}

/** A date as the footer shows it ("20 Nov 2026"), from an ISO date or datetime. */
export function formatLastUpdate(iso: string): { date: string; dateTime: string } {
  const dateTime = iso.slice(0, 10);
  const date = new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${dateTime}T00:00:00Z`));
  return { date, dateTime };
}
