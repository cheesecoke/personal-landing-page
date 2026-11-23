import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { handContent } from '../content/hand.server';
import { factKey, toHeroProjects, toPlates, toProofFacts } from './HomeTemplate';

const { home } = handContent(join(import.meta.dirname, '../../content/hand'));

describe('Home hand content', () => {
  it('carries the approved headline and sub-line', () => {
    expect(home.hero.headline).toEqual(['What I’ve built,', 'and what’s', 'still growing.']);
    expect(home.hero.lead).toBe(
      'I’m a software engineer: I build apps people use, the tools engineers build with, and AI systems. Whatever brought you here, the work is below.',
    );
  });
});

describe('toHeroProjects', () => {
  const projects = home.hero.stump.projects;

  it('uses the hand word and its dot without live data', () => {
    expect(toHeroProjects(projects).map((project) => [project.status, project.dot])).toEqual([
      ['Daily use', 'live'],
      ['Daily use', 'live'],
      ['First version', 'private'],
      ['In build', 'build'],
    ]);
  });

  it('takes the live status of the project a callout names', () => {
    const live = { status: { 'duo-decide': { label: 'Live', tone: 'live' as const } } };
    const duo = toHeroProjects(projects, live).at(-1)!;
    expect([duo.status, duo.dot]).toEqual(['Live', 'live']);
  });
});

describe('toProofFacts', () => {
  it('reads a phrase and two counts, undated without live data', () => {
    const facts = toProofFacts(home.proof);
    expect(facts.map((fact) => fact.kind)).toEqual(['phrase', 'count', 'count']);
    expect(facts.every((fact) => fact.asOf === undefined)).toBe(true);
    expect(new Set(facts.map((fact) => fact.key)).size).toBe(facts.length);
  });

  it('takes the live value and its date', () => {
    const fact = home.proof.items[1]!.fact!;
    const live = { facts: { [factKey(fact)]: { value: '181', asOf: '2026-11-20' } } };
    const counted = toProofFacts(home.proof, live)[1]!;
    expect(counted.value).toBe('181');
    expect(counted.asOf).toEqual({ dateTime: '2026-11-20', label: 'As of 20 November 2026' });
  });
});

describe('toPlates', () => {
  it('keeps the frames from hand content and features the first plate', () => {
    const plates = toPlates(home.ownTime.plates);
    expect(plates.map((plate) => plate.featured ?? false)).toEqual([true, false, false]);
    expect(plates.every((plate) => plate.frame.aspect > 0 && plate.fresh === null)).toBe(true);
  });

  it('marks the plate whose project changed', () => {
    const plates = toPlates(home.ownTime.plates, {}, { pas: { ageDays: 2, lifeDays: 14 } });
    expect(plates.map((plate) => plate.fresh)).toEqual([{ ageDays: 2, lifeDays: 14 }, null, null]);
  });
});
