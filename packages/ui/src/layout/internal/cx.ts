/** Join class names, skipping empty values. Class names stay whole strings (Tailwind scans them). */
export function cx(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(' ');
}
