import { handContent } from '../content/hand.server';
import { pageMeta } from '../content/meta';
import { ContactTemplate } from '../templates/ContactTemplate';
import type { Route } from './+types/contact';

export function loader() {
  return { content: handContent().contact };
}

export const meta: Route.MetaFunction = ({ data }) =>
  pageMeta({ title: data?.content.title, description: data?.content.header.lead });

export default function Contact({ loaderData }: Route.ComponentProps) {
  return <ContactTemplate content={loaderData.content} />;
}
