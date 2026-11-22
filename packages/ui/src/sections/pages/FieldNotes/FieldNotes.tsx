import type { ReactNode } from 'react';

import { cx, Label } from '../../../primitives';

export interface FieldNotesProps {
  /** The list's title ("Rules I work by"). */
  title: ReactNode;
  /** An id for the title. Default `about-rules`. */
  titleId?: string;
  /** One sentence each. */
  notes: ReactNode[];
  className?: string;
}

/**
 * Field notes: a short list of rules, each set large between hairlines. On About it sits beside
 * the portrait.
 */
export function FieldNotes({ title, titleId = 'about-rules', notes, className }: FieldNotesProps) {
  if (notes.length === 0) return null;
  return (
    <div className={cx('flex flex-col gap-3', className)}>
      <Label as="h2" id={titleId}>
        {title}
      </Label>
      <ul aria-labelledby={titleId} className="m-0 mt-2 list-none border-b border-hairline p-0">
        {notes.map((note, index) => (
          <li
            key={index}
            className="border-t border-hairline py-4.5 font-sans text-[clamp(21px,1.9vw,27px)] leading-[1.18] font-medium tracking-[-0.02em] text-primary [font-stretch:112.5%]"
          >
            {note}
          </li>
        ))}
      </ul>
    </div>
  );
}
