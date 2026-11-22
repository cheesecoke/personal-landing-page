import { pageTitle, PlaceholderPage } from '../shell/PlaceholderPage';

export const meta = () => [{ title: pageTitle('Lifebox') }];

export default function Route() {
  return <PlaceholderPage title="Lifebox" />;
}
