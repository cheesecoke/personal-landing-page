import type { ReactNode } from 'react';

import { Thread, ThreadColumn, ThreadScope } from '../../../layout';

/**
 * The frame Home's sections sit in under the hero: a full-width column with the thread 36px left
 * of the page column. Stories only.
 */
export function HomeStory({ children }: { children: ReactNode }) {
  return (
    <ThreadScope hash={false}>
      <ThreadColumn placement="edge">
        <Thread placement="edge" bottom={84} />
        {children}
      </ThreadColumn>
    </ThreadScope>
  );
}
