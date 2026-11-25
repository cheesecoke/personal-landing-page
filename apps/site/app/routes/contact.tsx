import { useState } from 'react';

import { handContent } from '../content/hand.server';
import { pageMeta } from '../content/meta';
import { PreloadImage } from '../content/preload';
import { ContactTemplate } from '../templates/ContactTemplate';
import { PortalDiveHost } from '../templates/PortalDive/PortalDiveHost';
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
  const { content } = loaderData;
  const [diving, setDiving] = useState(false);
  const entry = content.portal.entry;
  // The win screen offers the page's own main way to write.
  const mailto = (content.channels.find((channel) => channel.primary) ?? content.channels[0])!.href;
  return (
    <>
      {/* The portal render is the largest paint on this page: fetch it early. */}
      <PreloadImage image={content.portal} />
      <ContactTemplate
        content={content}
        onEnterPortal={entry ? () => setDiving(true) : undefined}
      />
      {/* The game is its own chunk: the host fetches it only once the reader chooses to enter. */}
      {entry ? (
        <PortalDiveHost
          open={diving}
          onClose={() => setDiving(false)}
          mailto={mailto}
          words={entry.game}
        />
      ) : null}
    </>
  );
}
