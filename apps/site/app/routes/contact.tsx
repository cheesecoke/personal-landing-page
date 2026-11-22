import { pageTitle, PlaceholderPage } from '../shell/PlaceholderPage';

export const meta = () => [{ title: pageTitle('Contact') }];

export default function Route() {
  return <PlaceholderPage title="Contact" />;
}
