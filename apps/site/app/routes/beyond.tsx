import { pageTitle, PlaceholderPage } from '../shell/PlaceholderPage';

export const meta = () => [{ title: pageTitle('Beyond') }];

export default function Route() {
  return <PlaceholderPage title="Beyond" />;
}
