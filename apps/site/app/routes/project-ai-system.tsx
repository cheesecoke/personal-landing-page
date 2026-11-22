import { pageTitle, PlaceholderPage } from '../shell/PlaceholderPage';

export const meta = () => [{ title: pageTitle('AI system') }];

export default function Route() {
  return <PlaceholderPage title="AI system" />;
}
