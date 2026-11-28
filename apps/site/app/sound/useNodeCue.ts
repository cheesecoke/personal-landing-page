import { useCallback, useEffect, useRef } from 'react';

import type { CanopySelection } from '@cwc/canopy';

import { siteCue } from './site';

/**
 * For `<Canopy onSelectionChange>`: a node lighting up (hovered, focused or opened) rings its own
 * note, the node's place in the tree picking it. Moving within one node rings once.
 */
export function useNodeCue(nodes: readonly { id: string }[]) {
  const last = useRef<string | null>(null);
  const order = useRef(nodes);
  useEffect(() => {
    order.current = nodes;
  }, [nodes]);
  return useCallback((selection: CanopySelection) => {
    const id = selection.hover ?? selection.active;
    if (id && id !== last.current) {
      siteCue(
        'node',
        Math.max(
          0,
          order.current.findIndex((node) => node.id === id),
        ),
      );
    }
    last.current = id;
  }, []);
}
