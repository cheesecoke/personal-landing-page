import { describe, expect, it } from 'vitest';

import { Href, Image, MediaPath, Paragraph, paragraphText, Text, toSpans } from './primitives';

describe('hand primitives', () => {
  it('rejects empty copy and stray whitespace', () => {
    expect(Text.safeParse('').success).toBe(false);
    expect(Text.safeParse(' padded ').success).toBe(false);
    expect(Text.safeParse('Daily use').success).toBe(true);
  });

  it('accepts site paths, anchors, mail and https links only', () => {
    for (const href of ['/', '/projects/pas/atti', '/projects/ai-system#distill', '#timeline']) {
      expect(Href.safeParse(href).success, href).toBe(true);
    }
    expect(Href.safeParse('mailto:someone@example.com').success).toBe(true);
    expect(Href.safeParse('https://example.com/in/someone').success).toBe(true);
    for (const href of ['Work.dc.html', 'http://example.com', '/Projects', 'projects']) {
      expect(Href.safeParse(href).success, href).toBe(false);
    }
  });

  it('keeps media under /media with a known extension', () => {
    expect(MediaPath.safeParse('/media/stump/stump-hero.avif').success).toBe(true);
    expect(MediaPath.safeParse('/_blob/abc').success).toBe(false);
    expect(MediaPath.safeParse('/media/../secret.png').success).toBe(false);
  });

  it('rejects unknown keys on an image', () => {
    const image = { src: '/media/a/b.webp', width: 10, height: 10, alt: '' };
    expect(Image.safeParse(image).success).toBe(true);
    expect(Image.safeParse({ ...image, title: 'x' }).success).toBe(false);
  });

  it('turns a paragraph into runs and into plain text', () => {
    const paragraph = Paragraph.parse(['See ', { text: 'PAS', href: '/projects/pas' }, '.']);
    expect(toSpans(paragraph)).toEqual([
      { text: 'See ' },
      { text: 'PAS', href: '/projects/pas' },
      { text: '.' },
    ]);
    expect(paragraphText(paragraph)).toBe('See PAS.');
    expect(toSpans('One line.')).toEqual([{ text: 'One line.' }]);
  });
});
