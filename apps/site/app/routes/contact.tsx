import { useState } from 'react';

import { handContent } from '../content/hand.server';
import { pageMeta } from '../content/meta';
import { PreloadImage } from '../content/preload';
import { siteVibrate } from '../sound/site';
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
  // The win screen offers the page's own ways to get in touch: LinkedIn first, then mail.
  const mailto = (content.channels.find((channel) => channel.primary) ?? content.channels[0])!.href;
  const linkedin = content.channels.find((channel) => channel.name === 'LinkedIn')?.href;
  return (
    <>
      {/* The portal render is the largest paint on this page: fetch it early. */}
      <PreloadImage image={content.portal} />
      <ContactTemplate
        content={content}
        onEnterPortal={
          entry
            ? () => {
                // Stepping through is a bigger moment than a press: a longer pulse (on phones).
                siteVibrate('strong');
                setDiving(true);
              }
            : undefined
        }
      />
      {/* The game is its own chunk: the host fetches it only once the reader chooses to enter. */}
      {entry ? (
        <PortalDiveHost
          open={diving}
          onClose={() => setDiving(false)}
          mailto={mailto}
          linkedin={linkedin}
          words={entry.game}
        />
      ) : null}
    </>
  );
}
