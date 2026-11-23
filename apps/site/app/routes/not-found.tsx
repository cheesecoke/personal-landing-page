import { strayPageMeta } from '../content/meta';
import { PlaceholderPage } from '../shell/PlaceholderPage';

export const meta = () => strayPageMeta('Page not found');

export default function Route() {
  return <PlaceholderPage title="Page not found" />;
}
