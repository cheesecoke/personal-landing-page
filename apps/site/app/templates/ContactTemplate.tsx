import type { ContactContent } from '@cwc/content/hand';
import { ContactDoor, Container, ThreadScope } from '@cwc/ui';

export interface ContactTemplateProps {
  /** The page's hand content (`contact.json`). */
  content: ContactContent;
}

/**
 * Contact: the title, one line and the ways to reach Chase, beside the open door. The door brings
 * the page's thread with it, and the page ends there: no hand-off.
 */
export function ContactTemplate({ content }: ContactTemplateProps) {
  return (
    <ThreadScope>
      <Container>
        <ContactDoor
          title={content.header.title}
          lead={content.header.lead}
          links={content.channels.map((channel) => ({
            label: channel.name,
            text: channel.label,
            href: channel.href,
            primary: channel.primary,
            // Another site opens in a new tab; a mail link does not.
            external: channel.href.startsWith('https://'),
          }))}
        />
      </Container>
    </ThreadScope>
  );
}
