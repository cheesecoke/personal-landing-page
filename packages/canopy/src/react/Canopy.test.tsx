import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen, waitFor, within } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { Canopy } from './Canopy';

afterEach(cleanup);

describe('Canopy on the server', () => {
  it('pre-renders the list, the heading and the flat drawing without touching the stage', () => {
    const html = renderToString(<Canopy variant="full" />);
    expect(html).toContain('12 personal projects.');
    expect(html).toContain('My personal projects, watch them grow.');
    expect(html).toMatch(/<noscript>.*data-canopy-flat="wide".*<\/noscript>/s);
    expect(html).not.toContain('<canvas');
    expect(html).toContain('data-canopy-mode="loading"');
  });

  it('pre-renders the teaser as a labelled picture with no list', () => {
    const html = renderToString(<Canopy variant="teaser" />);
    expect(html).toContain('role="img"');
    expect(html).toContain('data-canopy-flat="narrow"');
    expect(html).not.toContain('<nav');
    expect(html).not.toContain('<button');
  });
});

/* jsdom has no canvas, WebGL or matchMedia: the stage cannot start, which is the case under test. */
describe('Canopy when the stage cannot start', () => {
  it('shows the flat drawing and says the list works on its own', async () => {
    const onStage = vi.fn();
    const { container } = render(<Canopy variant="full" onStage={onStage} />);
    await waitFor(() =>
      expect(container.querySelector('[data-canopy]')).toHaveAttribute('data-canopy-mode', 'flat'),
    );
    expect(container.querySelectorAll('svg[data-canopy-flat]')).toHaveLength(2);
    expect(container.querySelector('canvas')).toBeNull();
    expect(screen.getByText(/The list beside it works on its own/)).toBeInTheDocument();
    expect(onStage).not.toHaveBeenCalled();
  });

  it('still opens a project from the list, with a real link in its card', async () => {
    const { container } = render(<Canopy variant="full" flat />);
    const list = within(screen.getByRole('navigation', { name: 'Projects' }));
    const row = list.getByRole('button', { name: /^Thread Quest/ });
    row.click();
    const card = within(await screen.findByRole('complementary', { name: 'Selected project' }));
    expect(card.getByRole('link', { name: /Open project/ })).toHaveAttribute(
      'href',
      '/projects/thread-quest',
    );
    expect(row).toHaveAttribute('aria-pressed', 'true');
    expect(card.getAllByRole('listitem')).toHaveLength(3);
    card.getByRole('button', { name: 'Back to the whole tree' }).click();
    await waitFor(() => expect(container.querySelector('[data-canopy-card]')).toBeNull());
  });

  it('goes back to the whole tree on Esc, wherever the focus is', async () => {
    const { container } = render(<Canopy variant="full" flat />);
    screen.getByRole('button', { name: /^PAS/ }).click();
    await waitFor(() => expect(container.querySelector('[data-canopy-card]')).not.toBeNull());
    // Nothing in the tree has focus: Safari does not focus a clicked button.
    (document.activeElement as HTMLElement | null)?.blur();
    document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await waitFor(() => expect(container.querySelector('[data-canopy-card]')).toBeNull());
  });

  it('hands the link to the app router through renderLink', async () => {
    render(
      <Canopy
        variant="full"
        flat
        renderLink={({ href, className, children }) => (
          <a href={`/base${href}`} className={className} data-router="">
            {children}
          </a>
        )}
      />,
    );
    screen.getByRole('button', { name: /^Distill/ }).click();
    const link = await screen.findByRole('link', { name: /Open in AI system/ });
    expect(link).toHaveAttribute('href', '/base/projects/ai-system#distill');
    expect(link).toHaveAttribute('data-router');
  });

  it('calls onNavigate from the plain link', async () => {
    const onNavigate = vi.fn((_: string, e: { preventDefault: () => void }) => e.preventDefault());
    render(<Canopy variant="full" flat onNavigate={onNavigate} />);
    screen.getByRole('button', { name: /^PAS/ }).click();
    (await screen.findByRole('link', { name: /Open project/ })).click();
    expect(onNavigate).toHaveBeenCalledWith('/projects/pas', expect.anything());
  });
});
