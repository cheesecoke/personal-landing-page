import { pageTitle, PlaceholderPage, siteName } from '../shell/PlaceholderPage';

export const meta = () => [{ title: pageTitle() }];

export default function Route() {
  return <PlaceholderPage title={siteName} />;
}
