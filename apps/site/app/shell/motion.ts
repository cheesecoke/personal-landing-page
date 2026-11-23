/**
 * Mirrors the reader's reduced-motion setting on the document as `data-motion="reduce"`, the one
 * switch components and tests read (`:root:not([data-motion='reduce'])`, `useReducedMotion`).
 *
 * It is the text of an inline script: it runs in the `<head>`, before the first paint and before
 * React hydrates, and keeps the attribute in step if the setting changes while the page is open.
 * A failure leaves the page as it was. It is a fixed string (not a function turned into text) so
 * the pre-rendered HTML and the browser's render carry the same script.
 */
export const motionMirrorScript = [
  'try{(function(){',
  "var m=window.matchMedia('(prefers-reduced-motion: reduce)'),r=document.documentElement;",
  "function s(){if(m.matches)r.setAttribute('data-motion','reduce');else r.removeAttribute('data-motion')}",
  "s();m.addEventListener('change',s)",
  '})()}catch(e){}',
].join('');
