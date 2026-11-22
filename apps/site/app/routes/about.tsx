import { pageTitle, PlaceholderPage } from '../shell/PlaceholderPage';

export const meta = () => [{ title: pageTitle('About') }];

export default function Route() {
  return <PlaceholderPage title="About" />;
}
