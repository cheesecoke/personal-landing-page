import type { ReactNode } from 'react';

import { Container, Thread, ThreadColumn, ThreadScope } from '../../../layout';

/**
 * The page column the About, Projects, Beyond and Contact boards share: the page container, the
 * thread at its left and the content indented beside it. Stories only.
 */
export function StoryPage({ children, thread = true }: { children: ReactNode; thread?: boolean }) {
  return (
    <ThreadScope hash={false}>
      <Container as="main">
        <ThreadColumn placement="column" className="pb-16">
          {thread ? <Thread placement="column" fadeIn={2} /> : null}
          {children}
        </ThreadColumn>
      </Container>
    </ThreadScope>
  );
}
