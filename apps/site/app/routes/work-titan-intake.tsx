import { pageTitle, PlaceholderPage } from '../shell/PlaceholderPage';

export const meta = () => [{ title: pageTitle('Titan Intake') }];

export default function Route() {
  return <PlaceholderPage title="Titan Intake" />;
}
