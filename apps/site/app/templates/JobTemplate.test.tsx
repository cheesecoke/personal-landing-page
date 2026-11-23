import { join } from 'node:path';

import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';

import { fixtures } from '@cwc/content/fixtures';

import { handContent } from '../content/hand.server';
import { JobTemplate } from './JobTemplate';

const { titanIntake } = handContent(join(import.meta.dirname, '../../content/hand'));

const page = (log?: Parameters<typeof JobTemplate>[0]['log']) =>
  render(
    <MemoryRouter>
      <JobTemplate content={titanIntake} log={log} />
    </MemoryRouter>,
  ).container;

describe('JobTemplate, on the real job page', () => {
  it('shows no log and leaves no shell for one, with no data or with the log switched off', () => {
    for (const container of [page(), page(null), page(fixtures.titanLogDisabled)]) {
      expect(container.querySelector('#log')).toBeNull();
      expect(container.querySelector('[data-log-entry]')).toBeNull();
      expect(container.textContent).not.toContain("Captain's log");
      expect(container.querySelectorAll('[data-thread-node]')).toHaveLength(4);
    }
  });

  it('prints no marker for Chase and no number', () => {
    const container = page();
    expect(container.textContent).not.toContain('[CONFIRM');
    // The one figure on the page is the year in the status line ("since January 2026").
    const status = titanIntake.hero.status;
    const rest = (container.textContent ?? '').replace(status, '');
    expect(rest).not.toMatch(/\d/);
  });

  it('draws the role under the title and the flow as the hero', () => {
    const container = page();
    expect(container.querySelectorAll('h1')).toHaveLength(1);
    expect(container.querySelector('h1')?.textContent).toBe(
      'Titan Intake · Senior Software Engineer, AI',
    );
    expect(container.querySelector('figure [role="img"]')).not.toBeNull();
    expect(container.querySelector('#what-it-is')).not.toBeNull();
  });

  it('would show the log only for a file that says enabled (sample entries, never shipped)', () => {
    const container = page(fixtures.titanLogEnabled);
    expect(container.querySelectorAll('#log [data-log-entry]')).toHaveLength(3);
  });
});
