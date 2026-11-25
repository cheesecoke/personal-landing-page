import { cleanup, render } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { afterEach, describe, expect, it } from 'vitest';

import { PortalSpiral } from './PortalSpiral';

afterEach(cleanup);

const svgIn = (container: HTMLElement) => container.querySelector('svg')!;

describe('PortalSpiral', () => {
  it('renders an svg that fills its container', () => {
    const { container } = render(<PortalSpiral className="extra" />);
    const svg = svgIn(container);
    expect(svg).toBeTruthy();
    expect(svg.getAttribute('preserveAspectRatio')).toBe('none');
    expect(svg.classList.contains('extra')).toBe(true);
    expect(svg.querySelectorAll('path').length).toBeGreaterThan(10);
  });

  it('is decoration: hidden from assistive technology, nothing focusable', () => {
    const { container } = render(<PortalSpiral />);
    const svg = svgIn(container);
    expect(svg.getAttribute('aria-hidden')).toBe('true');
    expect(svg.getAttribute('focusable')).toBe('false');
    expect(container.querySelectorAll('a, button, [tabindex]')).toHaveLength(0);
  });

  it('takes its speed from the speed prop, at rest by default', () => {
    const { container, rerender } = render(<PortalSpiral />);
    expect(svgIn(container).getAttribute('data-speed')).toBe('rest');
    rerender(<PortalSpiral speed="active" />);
    expect(svgIn(container).getAttribute('data-speed')).toBe('active');
    rerender(<PortalSpiral speed={2.5} />);
    expect(svgIn(container).getAttribute('data-speed')).toBe('2.5');
  });

  it('draws the same markup every time, so the server render hydrates cleanly', () => {
    expect(renderToString(<PortalSpiral />)).toBe(renderToString(<PortalSpiral />));
  });

  it('gives two spirals on one page their own gradient ids', () => {
    const { container } = render(
      <>
        <PortalSpiral />
        <PortalSpiral />
      </>,
    );
    const ids = [...container.querySelectorAll('radialGradient')].map((g) => g.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
