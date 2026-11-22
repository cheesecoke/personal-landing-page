import type { ElementType, ReactNode } from 'react';

/** The element or component used for links. Default `a`. It receives `href`. */
export type LinkComponent = ElementType;

/** A link as plain data: what it says and where it goes. */
export interface SectionLink {
  label: ReactNode;
  href: string;
}
