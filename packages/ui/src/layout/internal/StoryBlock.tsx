import type { ReactNode } from 'react';

/** A plain outlined block for layout stories, so the layout is what you see. Stories only. */
export function StoryBlock({ children, tall }: { children?: ReactNode; tall?: boolean }) {
  return (
    <div
      className={
        tall
          ? 'type-label flex min-h-40 items-center justify-center rounded-panel border border-hairline bg-surface p-4'
          : 'type-label flex min-h-16 items-center justify-center rounded-panel border border-hairline bg-surface p-4'
      }
    >
      {children}
    </div>
  );
}
