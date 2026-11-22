import { pageTitle, PlaceholderPage } from '../shell/PlaceholderPage';

export const meta = () => [{ title: pageTitle('Projects') }];

export default function Route() {
  return <PlaceholderPage title="Projects" />;
}
