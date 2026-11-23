import { paragraphText } from '@cwc/content/hand';

import { handContent } from '../content/hand.server';
import { pageMeta } from '../content/meta';
import { AboutTemplate } from '../templates/AboutTemplate';
import type { Route } from './+types/about';

export function loader() {
  const { about } = handContent();
  return { content: about, description: paragraphText(about.person.paragraphs[0]!) };
}

export const meta: Route.MetaFunction = ({ data }) =>
  pageMeta({ title: data?.content.title, description: data?.description });

export default function About({ loaderData }: Route.ComponentProps) {
  return <AboutTemplate content={loaderData.content} />;
}
