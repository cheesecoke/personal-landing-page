import { pageTitle, PlaceholderPage } from '../shell/PlaceholderPage';

export const meta = () => [{ title: pageTitle('Page not found') }];

export default function Route() {
  return <PlaceholderPage title="Page not found" />;
}
