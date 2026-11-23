import { handContent } from '../content/hand.server';
import { pageMeta } from '../content/meta';
import { BeyondTemplate } from '../templates/BeyondTemplate';
import type { Route } from './+types/beyond';

export function loader() {
  return { content: handContent().beyond };
}

export const meta: Route.MetaFunction = ({ data }) =>
  pageMeta({ title: data?.content.title, description: data?.content.header.lead });

export default function Beyond({ loaderData }: Route.ComponentProps) {
  return <BeyondTemplate content={loaderData.content} />;
}
