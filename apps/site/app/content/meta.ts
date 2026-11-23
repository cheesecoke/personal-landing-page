import type { PagePath } from '../paths';
import { pageTitle, siteName } from '../shell/PlaceholderPage';

/** Where the site is served. The bare domain redirects here. */
export const siteOrigin = 'https://www.chasewcole.com';

/** A page's address on the live site. */
export const pageUrl = (path: PagePath) => `${siteOrigin}${path === '/' ? '/' : path}`;

/**
 * A page's head, for a route's `meta` export: its `<title>`, description, canonical address and
 * the tags a link preview reads. The words come from the page's hand content: pass its `title`,
 * and its lead as the description when it has one.
 */
export function pageMeta({
  path,
  title,
  description,
}: {
  path: PagePath;
  title?: string;
  description?: string;
}) {
  const fullTitle = pageTitle(title);
  const url = pageUrl(path);
  return [
    { title: fullTitle },
    ...(description ? [{ name: 'description', content: description }] : []),
    { tagName: 'link', rel: 'canonical', href: url },
    { property: 'og:type', content: 'website' },
    { property: 'og:site_name', content: siteName },
    { property: 'og:title', content: fullTitle },
    ...(description ? [{ property: 'og:description', content: description }] : []),
    { property: 'og:url', content: url },
    { name: 'twitter:card', content: 'summary' },
  ];
}

/** The head of a page that is not part of the site (the 404 page): a title, and no indexing. */
export function strayPageMeta(title: string) {
  return [{ title: pageTitle(title) }, { name: 'robots', content: 'noindex' }];
}
