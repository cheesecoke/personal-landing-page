import { describe, expect, it } from 'vitest';

import { ContactContent } from './pages';

const contact = {
  schemaVersion: 1,
  title: 'Contact',
  header: { title: 'A title.', lead: 'A line.' },
  portal: { src: '/media/portal/ring.webp', width: 1600, height: 1024, alt: '' },
  channels: [
    { name: 'Email', label: 'me@example.com', href: 'mailto:me@example.com', primary: true },
  ],
};

const entry = {
  label: 'Open it',
  dialog: { title: 'Go?', body: 'One line.', enter: 'Go', cancel: 'Stay' },
};

describe('ContactContent', () => {
  it('takes a portal with or without the words for its way in', () => {
    expect(ContactContent.safeParse(contact).success).toBe(true);
    const parsed = ContactContent.parse({ ...contact, portal: { ...contact.portal, entry } });
    expect(parsed.portal.entry).toEqual(entry);
  });

  it('needs every word of the question, and nothing else', () => {
    const missing = { ...entry, dialog: { ...entry.dialog, cancel: undefined } };
    expect(
      ContactContent.safeParse({ ...contact, portal: { ...contact.portal, entry: missing } })
        .success,
    ).toBe(false);
    const extra = { ...entry, href: '/dive' };
    expect(
      ContactContent.safeParse({ ...contact, portal: { ...contact.portal, entry: extra } }).success,
    ).toBe(false);
  });
});
