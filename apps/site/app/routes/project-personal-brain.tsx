import { pageTitle, PlaceholderPage } from '../shell/PlaceholderPage';

export const meta = () => [{ title: pageTitle('Personal brain') }];

export default function Route() {
  return <PlaceholderPage title="Personal brain" />;
}
