import { pageTitle, PlaceholderPage } from '../shell/PlaceholderPage';

export const meta = () => [{ title: pageTitle('Atti') }];

export default function Route() {
  return <PlaceholderPage title="Atti" />;
}
