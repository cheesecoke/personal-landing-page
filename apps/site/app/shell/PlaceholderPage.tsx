/** Empty page body used until each route gets its template. */
export function PlaceholderPage({ title }: { title: string }) {
  return <h1>{title}</h1>;
}

export const siteName = 'Chase Cole';

export function pageTitle(title?: string) {
  return title ? `${title} · ${siteName}` : siteName;
}
