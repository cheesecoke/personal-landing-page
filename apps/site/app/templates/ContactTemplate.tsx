import type { ContactContent } from '@cwc/content/hand';
import { ContactDoor, Container, ThreadScope } from '@cwc/ui';

export interface ContactTemplateProps {
  /** The page's hand content (`contact.json`). */
  content: ContactContent;
  /**
   * Turns the portal into a way in: its opening becomes a button that asks first (words from
   * `content.portal.entry`), and this runs when the reader chooses to go through. Without it, or
   * without those words, the portal stays decoration.
   */
  onEnterPortal?: () => void;
}

/**
 * Contact: the title, one line and the ways to reach Chase, beside the portal. The section brings
 * the page's thread with it, and the page ends there: no hand-off.
 */
export function ContactTemplate({ content, onEnterPortal }: ContactTemplateProps) {
  const entry = content.portal.entry;
  return (
    <ThreadScope>
      <Container>
        <ContactDoor
          title={content.header.title}
          lead={content.header.lead}
          image={content.portal}
          portal={entry && onEnterPortal ? { ...entry, onEnter: onEnterPortal } : undefined}
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
