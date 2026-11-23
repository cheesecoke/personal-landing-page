import { act, render, screen } from '@testing-library/react';
import { hydrateRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { FreshCandidate } from '../freshness';
import { FreshnessProvider, useFreshMark, useFreshness } from './FreshnessProvider';

const candidates: FreshCandidate[] = [
  { id: 'pas', project: 'pas', fresh: { changedAt: '2026-11-20', changeKind: 'update' } },
  {
    id: 'duo-decide',
    project: 'duo-decide',
    fresh: { changedAt: '2026-11-05', changeKind: 'update' },
  },
  {
    id: 'thread-quest',
    project: 'thread-quest',
    fresh: { changedAt: '2026-11-20', changeKind: 'update' },
  },
  { id: 'this-site', project: 'this-site', fresh: null },
];

function Row({ id }: { id: string }) {
  const mark = useFreshMark(id);
  return <li data-testid={id}>{mark ? `new ${mark.ageDays}d` : ''}</li>;
}
function Page() {
  const { now, navRing } = useFreshness();
  return (
    <ul data-now={now ?? 'unset'} data-nav-ring={String(navRing)}>
      {candidates.map(({ id }) => (
        <Row key={id} id={id} />
      ))}
    </ul>
  );
}
const text = (id: string) => screen.getByTestId(id).textContent;

afterEach(() => {
  vi.useRealTimers();
  document.body.innerHTML = '';
});

describe('FreshnessProvider', () => {
  it('draws markers for a fixed date', () => {
    render(
      <FreshnessProvider now="2026-11-22" candidates={candidates}>
        <Page />
      </FreshnessProvider>,
    );
    expect(text('pas')).toBe('new 2d');
    expect(text('thread-quest')).toBe('new 2d');
    expect(text('duo-decide')).toBe('');
    expect(text('this-site')).toBe('');
  });

  it('drains them as the date moves on', () => {
    const { rerender } = render(
      <FreshnessProvider now="2026-11-08" candidates={candidates}>
        <Page />
      </FreshnessProvider>,
    );
    expect(text('duo-decide')).toBe('new 3d');
    expect(text('pas')).toBe('new 0d');
    rerender(
      <FreshnessProvider now="2026-12-04" candidates={candidates}>
        <Page />
      </FreshnessProvider>,
    );
    expect(candidates.map(({ id }) => text(id))).toEqual(['', '', '', '']);
  });

  it('uses the real clock when no date is given', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-11-25T09:00:00Z'));
    render(
      <FreshnessProvider candidates={candidates}>
        <Page />
      </FreshnessProvider>,
    );
    expect(screen.getByRole('list').dataset.now).toBe('2026-11-25');
    expect(text('pas')).toBe('new 5d');
  });

  it('lets a page provider take the date from the one above it', () => {
    render(
      <FreshnessProvider now="2026-11-22">
        <FreshnessProvider candidates={candidates} cap={1}>
          <Page />
        </FreshnessProvider>
      </FreshnessProvider>,
    );
    expect(candidates.map(({ id }) => text(id))).toEqual(['new 2d', '', '', '']);
  });

  it('turns the nav ring on only for a recent release', () => {
    const release: FreshCandidate[] = [
      { id: 'app', project: 'app', fresh: { changedAt: '2026-11-21', changeKind: 'release' } },
    ];
    const { rerender } = render(
      <FreshnessProvider now="2026-11-22" candidates={release}>
        <Page />
      </FreshnessProvider>,
    );
    expect(screen.getByRole('list').dataset.navRing).toBe('true');
    rerender(
      <FreshnessProvider now="2026-11-29" candidates={release}>
        <Page />
      </FreshnessProvider>,
    );
    expect(screen.getByRole('list').dataset.navRing).toBe('false');
    rerender(
      <FreshnessProvider now="2026-11-22" candidates={candidates}>
        <Page />
      </FreshnessProvider>,
    );
    expect(screen.getByRole('list').dataset.navRing).toBe('false');
  });

  it('marks nothing without a provider', () => {
    render(<Page />);
    expect(screen.getByRole('list').dataset.now).toBe('unset');
    expect(text('pas')).toBe('');
  });
});

describe('pre-render and hydration', () => {
  const tree = (
    <FreshnessProvider candidates={candidates}>
      <Page />
    </FreshnessProvider>
  );

  it('pre-renders no date and no marker', () => {
    const html = renderToString(tree);
    expect(html).toContain('data-now="unset"');
    expect(html).not.toContain('new ');
  });

  it('hydrates without a mismatch, then sets the date and draws the markers', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-11-22T15:00:00Z'));
    const errors = vi.spyOn(console, 'error').mockImplementation(() => {});
    const recoverable = vi.fn();

    const container = document.createElement('div');
    document.body.append(container);
    container.innerHTML = renderToString(tree);
    expect(text('pas')).toBe('');

    await act(async () => {
      hydrateRoot(container, tree, { onRecoverableError: recoverable });
    });

    expect(recoverable).not.toHaveBeenCalled();
    expect(errors).not.toHaveBeenCalled();
    expect(screen.getByRole('list').dataset.now).toBe('2026-11-22');
    expect(text('pas')).toBe('new 2d');
    errors.mockRestore();
  });
});
