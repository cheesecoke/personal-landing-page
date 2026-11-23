import { navItems } from '../paths';

/**
 * The shell's own words: the accessible names it needs on every page. The name, role, copyright
 * and address come from hand content (`site.json`), through the root loader.
 * TODO(content): these have no home in hand content yet.
 */
export const site = {
  navLabel: 'Site',
  skipLabel: 'Skip to content',
  lastUpdateLabel: 'Last update',
  /** Read out with the nav's release ring, so colour is not the only signal. */
  releaseRingLabel: 'New release',
} as const;

/** Pages that are not open yet are set quieter in the nav and footer. */
const quiet: ReadonlySet<string> = new Set(['/beyond']);

export const shellLinks = navItems.map((item) => ({
  label: item.label,
  href: item.to,
  quiet: quiet.has(item.to),
}));

const ringedLinks = shellLinks.map((link) =>
  link.href === '/projects' ? { ...link, ring: { label: site.releaseRingLabel } } : link,
);

/** The header nav's items: with the release ring after Projects while a release is new. */
export const navLinks = (releaseRing: boolean) => (releaseRing ? ringedLinks : shellLinks);

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
