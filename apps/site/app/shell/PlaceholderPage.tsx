import { Container } from '@cwc/ui';

/** Empty page body used until each route gets its template. */
export function PlaceholderPage({ title }: { title: string }) {
  return (
    <Container className="py-16">
      <h1 className="type-h1 m-0">{title}</h1>
    </Container>
  );
}

export const siteName = 'Chase Cole';

export function pageTitle(title?: string) {
  return title ? `${title} · ${siteName}` : siteName;
}
