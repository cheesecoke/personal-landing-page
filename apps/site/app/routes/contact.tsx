import { handContent } from '../content/hand.server';
import { pageMeta } from '../content/meta';
import { PreloadImage } from '../content/preload';
import { ContactTemplate } from '../templates/ContactTemplate';
import type { Route } from './+types/contact';

export function loader() {
  return { content: handContent().contact };
}

export const meta: Route.MetaFunction = ({ data }) =>
  pageMeta({
    path: '/contact',
    title: data?.content.title,
    description: data?.content.header.lead,
  });

export default function Contact({ loaderData }: Route.ComponentProps) {
  return (
    <>
      {/* The portal render is the largest paint on this page: fetch it early. */}
      <PreloadImage image={loaderData.content.portal} />
      <ContactTemplate content={loaderData.content} />
    </>
  );
}
