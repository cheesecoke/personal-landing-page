/**
 * Every public page, in site order. One list feeds the pre-render config, the build check and the
 * route test, so a route cannot exist without a static HTML file.
 *
 * Personal projects live under /projects. "work" is only the job page. Entries without their own
 * page (Distill, Finance brain, Business brain, One Rep) are anchors on a parent page, not routes.
 */
export const pagePaths = [
  '/',
  '/projects',
  '/projects/pas',
  '/projects/pas/atti',
  '/projects/pas/lifebox',
  '/projects/personal-brain',
  '/projects/ai-system',
  '/projects/duo-decide',
  '/projects/thread-quest',
  '/work/titan-intake',
  '/about',
  '/beyond',
  '/contact',
] as const;

export type PagePath = (typeof pagePaths)[number];

/** The catch-all route is pre-rendered here; the build copies it to `404.html` for the host. */
export const notFoundPath = '/404';

export const prerenderPaths = [...pagePaths, notFoundPath] as const;

/** The header nav, in order. The site name links Home. */
export const navItems = [
  { label: 'Projects', to: '/projects' },
  { label: 'About', to: '/about' },
  { label: 'Beyond', to: '/beyond' },
  { label: 'Contact', to: '/contact' },
] as const satisfies readonly { label: string; to: PagePath }[];
