export type ClassValue = string | false | null | undefined;

/** Join class names, skipping the falsy ones. Class names stay whole strings (Tailwind needs that). */
export function cx(...values: ClassValue[]): string {
  return values.filter(Boolean).join(' ');
}
