import { handContent } from '../content/hand.server';
import { pageMeta } from '../content/meta';
import { PreloadImage } from '../content/preload';
import { BeyondTemplate } from '../templates/BeyondTemplate';
import type { Route } from './+types/beyond';

export function loader() {
  const { beyond } = handContent();
  // Notes for the author stay out of the published page: the slot shows its title and text only.
  const slots = beyond.scene.slots.map(({ confirm: _confirm, ...slot }) => slot);
  return { content: { ...beyond, scene: { ...beyond.scene, slots } } };
}

export const meta: Route.MetaFunction = ({ data }) =>
  pageMeta({ path: '/beyond', title: data?.content.title, description: data?.content.header.lead });

export default function Beyond({ loaderData }: Route.ComponentProps) {
  return (
    <>
      <PreloadImage image={loaderData.content.scene.image} />
      <BeyondTemplate content={loaderData.content} />
    </>
  );
}
