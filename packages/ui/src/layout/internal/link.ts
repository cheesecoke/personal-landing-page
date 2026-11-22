import type { ElementType } from 'react';

/**
 * A link the shell renders. `href` is passed to the link element as `href`; to use a router link,
 * give the component `linkAs` a small adapter that maps `href` to the router's prop.
 */
export interface SiteLink {
  label: string;
  href: string;
  /** Set in Smoke rather than Ash: a page that is not open yet (Beyond). */
  quiet?: boolean;
}

/** The element or component used for internal links. Default `a`. It receives `href`. */
export type LinkComponent = ElementType;
