import '@testing-library/jest-dom/vitest';
import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import { createRef } from 'react';
import { renderToString } from 'react-dom/server';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

import { createRun, startRun, step } from '../run';
import { DiveGame, type DiveGameHandle } from './DiveGame';

afterEach(cleanup);

/* jsdom has no 2D canvas: the game runs its loop and HUD without drawing, which is what is tested. */
beforeAll(() => {
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
});

describe('DiveGame on the server', () => {
  it('pre-renders the labelled area and the canvas, with no HUD and no seed yet', () => {
    const html = renderToString(<DiveGame />);
    expect(html).toContain('aria-label="Portal dive"');
    expect(html).toContain('<canvas');
    expect(html).not.toContain('progressbar');
  });
});

describe('DiveGame in the browser', () => {
  it('starts a run on mount and shows lives and progress', async () => {
    const ref = createRef<DiveGameHandle>();
    render(<DiveGame ref={ref} seed={4} />);
    await waitFor(() => expect(ref.current?.state()?.status).toBe('running'));
    expect(ref.current!.state()!.seed).toBe(4);
    expect(await screen.findByRole('progressbar', { name: 'Progress' })).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Lives: 3/3');
  });

  it('draws a fresh seed per mount when none is given', async () => {
    const a = createRef<DiveGameHandle>();
    const b = createRef<DiveGameHandle>();
    render(
      <>
        <DiveGame ref={a} />
        <DiveGame ref={b} />
      </>,
    );
    await waitFor(() => expect(a.current?.state()).toBeTruthy());
    expect(a.current!.state()!.seed).not.toBe(b.current!.state()!.seed);
  });

  it('waits for start() when autoStart is off, and restart() lays out a new run', async () => {
    const ref = createRef<DiveGameHandle>();
    render(<DiveGame ref={ref} seed={9} autoStart={false} />);
    await waitFor(() => expect(ref.current?.state()?.status).toBe('ready'));
    act(() => ref.current!.start());
    expect(ref.current!.state()!.status).toBe('running');
    act(() => ref.current!.restart(21));
    await waitFor(() => expect(ref.current!.state()!.seed).toBe(21));
    expect(ref.current!.state()!.status).toBe('ready');
  });

  it('steals only the steering keys, and only while running', async () => {
    const ref = createRef<DiveGameHandle>();
    render(<DiveGame ref={ref} seed={2} />);
    await waitFor(() => expect(ref.current?.state()?.status).toBe('running'));
    const fire = (key: string) => {
      const e = new KeyboardEvent('keydown', { key, cancelable: true });
      window.dispatchEvent(e);
      window.dispatchEvent(new KeyboardEvent('keyup', { key }));
      return e.defaultPrevented;
    };
    expect(fire('ArrowLeft')).toBe(true);
    expect(fire('d')).toBe(true);
    expect(fire('Escape')).toBe(false);
    expect(fire('Tab')).toBe(false);
    expect(fire('ArrowDown')).toBe(false);
  });

  it('leaves the keys alone while paused', async () => {
    const ref = createRef<DiveGameHandle>();
    render(<DiveGame ref={ref} seed={2} paused />);
    await waitFor(() => expect(ref.current?.state()?.status).toBe('running'));
    const e = new KeyboardEvent('keydown', { key: 'ArrowLeft', cancelable: true });
    window.dispatchEvent(e);
    expect(e.defaultPrevented).toBe(false);
  });

  it('reports the end once, with the score', async () => {
    let s = startRun(createRun({ seed: 3 }));
    while (s.status === 'running') s = step(s, { steer: 0 }, 16);
    const onEnd = vi.fn();
    render(<DiveGame initialState={s} onEnd={onEnd} />);
    await waitFor(() => expect(onEnd).toHaveBeenCalledTimes(1));
    expect(onEnd.mock.calls[0]![0]).toMatchObject({
      status: 'crashed',
      livesLeft: 0,
      ringsHit: 3,
      ringsTotal: s.course.length,
      clean: false,
    });
    await new Promise((r) => setTimeout(r, 100));
    expect(onEnd).toHaveBeenCalledTimes(1);
  });

  it('does not advance while paused', async () => {
    const ref = createRef<DiveGameHandle>();
    render(<DiveGame ref={ref} seed={5} paused />);
    await waitFor(() => expect(ref.current?.state()).toBeTruthy());
    await new Promise((r) => setTimeout(r, 100));
    expect(ref.current!.state()!.elapsedMs).toBe(0);
  });
});
