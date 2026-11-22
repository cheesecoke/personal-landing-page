import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { Cluster, Container, Grid, Section, SplitLayout, Stack } from './index';

const has = (el: Element | null, ...names: string[]) =>
  names.every((name) => el?.classList.contains(name) ?? false);

afterEach(cleanup);

describe('layout primitives', () => {
  it('Container renders the page column with the gutter, as the element asked for', () => {
    render(
      <Container as="header" data-testid="c">
        x
      </Container>,
    );
    const el = screen.getByTestId('c');
    expect(el.tagName).toBe('HEADER');
    expect(has(el, 'max-w-[calc(var(--container-max)+2*var(--gutter))]', 'px-gutter')).toBe(true);
    expect(has(el, '@container')).toBe(false);
  });

  it('Container has a narrower project column', () => {
    render(
      <Container width="project" data-testid="c">
        x
      </Container>,
    );
    expect(has(screen.getByTestId('c'), 'max-w-page', 'px-gutter')).toBe(true);
  });

  it('Container can be a query container', () => {
    render(
      <Container query data-testid="c">
        x
      </Container>,
    );
    expect(has(screen.getByTestId('c'), '@container')).toBe(true);
  });

  it('Section is a positioned section with the board spacing', () => {
    render(<Section aria-label="Details">x</Section>);
    const el = screen.getByRole('region', { name: 'Details' });
    expect(has(el, 'relative', 'mt-[clamp(56px,5.5vw,80px)]')).toBe(true);
  });

  it('Stack and Cluster map px gaps to whole class names', () => {
    render(
      <>
        <Stack gap={18} data-testid="s">
          x
        </Stack>
        <Cluster gapX={48} gapY={32} justify="between" data-testid="k">
          x
        </Cluster>
      </>,
    );
    expect(has(screen.getByTestId('s'), 'flex-col', 'gap-4.5')).toBe(true);
    expect(
      has(screen.getByTestId('k'), 'flex-wrap', 'gap-x-12', 'gap-y-8', 'justify-between'),
    ).toBe(true);
  });

  it('Grid resets list styles when it renders a list', () => {
    render(
      <Grid as="ul" min={150}>
        <li>x</li>
      </Grid>,
    );
    expect(
      has(
        screen.getByRole('list'),
        'list-none',
        'grid-cols-[repeat(auto-fit,minmax(min(150px,100%),1fr))]',
      ),
    ).toBe(true);
  });

  it('SplitLayout queries its own width', () => {
    render(
      <SplitLayout data-testid="split">
        <div>a</div>
        <div>b</div>
      </SplitLayout>,
    );
    const root = screen.getByTestId('split');
    expect(has(root, '@container')).toBe(true);
    expect(has(root.firstElementChild, '@lg:grid-cols-[minmax(0,400px)_minmax(0,1fr)]')).toBe(true);
  });
});
