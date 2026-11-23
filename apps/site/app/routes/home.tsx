import { useMemo } from 'react';

import { FreshnessProvider, useFreshness } from '@cwc/content/react';

import { freshShoots, toCanopyCopy, toCanopyData, withCanopyFresh } from '../content/canopy';
import { handContent } from '../content/hand.server';
import { freshCandidates, statusKeyTone, toFreshProp } from '../content/live';
import { liveContent } from '../content/live.server';
import { pageMeta } from '../content/meta';
import { PreloadImage } from '../content/preload';
import { factKey, HomeTemplate, type HomeFresh, type HomeLive } from '../templates/HomeTemplate';
import { HomeTemplateMap } from '../templates/HomeTemplateMap';
import type { Route } from './+types/home';

const named = <T,>(values: readonly (T | undefined)[]) =>
  values.filter((value): value is T => value !== undefined);

/**
 * Home's hand content, and from live data only what the page shows: the status of each project
 * the stump and the plates name, the facts the proof row names, the plates' change dates, and
 * the project tree (the same data and words as on Projects).
 */
export function loader() {
  const { home, map } = handContent();
  const { projects } = liveContent();
  const plateSlugs = named(home.ownTime.plates.map((plate) => plate.project));
  const slugs = new Set([
    ...named(home.hero.stump.projects.map((project) => project.project)),
    ...plateSlugs,
  ]);

  const live: Required<HomeLive> = { status: {}, facts: {} };
  for (const project of projects) {
    if (slugs.has(project.slug)) {
      live.status[project.slug] = {
        label: project.status.label,
        tone: statusKeyTone(project.status.key),
      };
    }
  }
  for (const { fact } of home.proof.items) {
    const project = fact && projects.find((entry) => entry.slug === fact.project);
    const counted =
      project?.visibility === 'public'
        ? project.facts.find((entry) => entry.key === fact?.key)
        : undefined;
    if (fact && counted) live.facts[factKey(fact)] = { value: counted.value, asOf: counted.asOf };
  }

  return {
    content: home,
    live,
    candidates: freshCandidates(projects, plateSlugs).filter((candidate) =>
      plateSlugs.includes(candidate.id),
    ),
    map: {
      data: toCanopyData(map, projects),
      shoots: freshShoots(projects),
      words: { headline: map.headline, hint: map.hint, labels: map.labels },
    },
  };
}

// Home's title is the site name alone.
export const meta: Route.MetaFunction = ({ data }) =>
  pageMeta({ path: '/', description: data?.content.hero.lead });

/** The plates' new marks, decided in the browser once the page has hydrated. */
function HomePage({ content, live, candidates, map }: Route.ComponentProps['loaderData']) {
  const { markFor, marks } = useFreshness();
  // The tree carries the same new marks as the plates above it.
  const tree = useMemo(() => withCanopyFresh(map.data, marks, map.shoots), [map, marks]);
  const copy = useMemo(() => toCanopyCopy(map.words), [map.words]);
  const fresh: HomeFresh = {};
  for (const { id } of candidates) {
    const mark = toFreshProp(markFor(id));
    if (mark) fresh[id] = mark;
  }
  const { wide, phone } = content.hero.stump;
  return (
    <>
      {/* The hero render is the largest paint: fetch the one this screen shows, early. */}
      <PreloadImage image={wide} media="(min-width: 900px)" />
      <PreloadImage image={phone} media="(max-width: 899.98px)" />
      <HomeTemplate
        content={content}
        live={live}
        fresh={fresh}
        map={<HomeTemplateMap data={tree} copy={copy} />}
      />
    </>
  );
}

export default function Home({ loaderData }: Route.ComponentProps) {
  return (
    <FreshnessProvider candidates={loaderData.candidates}>
      <HomePage {...loaderData} />
    </FreshnessProvider>
  );
}
