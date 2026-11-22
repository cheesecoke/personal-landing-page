import { pageTitle, PlaceholderPage } from '../shell/PlaceholderPage';

export const meta = () => [{ title: pageTitle('PAS') }];

export default function Route() {
  return <PlaceholderPage title="PAS" />;
}
