import { pageTitle } from '../shell/PlaceholderPage';

/**
 * A page's `<title>` and description, for a route's `meta` export. Both come from the page's
 * hand content: pass its `title`, and its lead as the description when it has one.
 */
export function pageMeta({ title, description }: { title?: string; description?: string }) {
  return [
    { title: pageTitle(title) },
    ...(description ? [{ name: 'description', content: description }] : []),
  ];
}
