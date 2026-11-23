import type { ReactNode } from 'react';

import type { HomeContent } from '@cwc/content/hand';
import {
  AtWorkPipeline,
  HomeHandoff,
  ProjectMapTeaser,
  ProjectPlates,
  ProofRow,
  StumpHero,
  Thread,
  ThreadColumn,
  ThreadScope,
  type ProjectPlate,
  type ProofFact,
  type Status,
  type StumpHeroProject,
} from '@cwc/ui';

import { statusTone } from '../content/status';
import { RouterLink } from '../shell/RouterLink';

/**
 * What live data adds to Home, already cut down to what the page shows. Hand content names the
 * live project (`project`) or fact (`fact`) each piece pairs with; anything not found here keeps
 * its hand value.
 */
export interface HomeLive {
  /** The status word and its dot, by project slug. */
  status?: Record<string, { label: string; tone: Status }>;
  /** A counted fact's value and the day it was counted (`YYYY-MM-DD`), by `project/key`. */
  facts?: Record<string, { value: string; asOf: string }>;
}

/** The new marks, by project slug. The caller picks them (one per project, three a page at most). */
export type HomeFresh = Record<string, { ageDays: number; lifeDays: number }>;

/** The key a live fact is filed under in `HomeLive.facts`. */
export const factKey = (fact: { project: string; key: string }) => `${fact.project}/${fact.key}`;

/** A day as a sentence reads it: "20 November 2026". */
const longDate = (iso: string) =>
  new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${iso}T00:00:00Z`));

type Stump = HomeContent['hero']['stump'];

/** The stump's projects: the hand word and its dot, or the live status when there is one. */
export function toHeroProjects(
  projects: Stump['projects'],
  live: HomeLive = {},
): StumpHeroProject[] {
  return projects.map((project) => {
    const status = project.project ? live.status?.[project.project] : undefined;
    return {
      name: project.name,
      status: status?.label ?? project.status,
      dot: status?.tone ?? statusTone(project.status),
      href: project.href,
    };
  });
}

/** The proof row: a number with a unit is a count, anything else a phrase. */
export function toProofFacts(proof: HomeContent['proof'], live: HomeLive = {}): ProofFact[] {
  return proof.items.map((item) => {
    const counted = item.fact ? live.facts?.[factKey(item.fact)] : undefined;
    return {
      key: item.href + item.value,
      kind: item.unit === undefined ? 'phrase' : 'count',
      value: counted?.value ?? item.value,
      unit: item.unit,
      caption: item.caption,
      href: item.href,
      asOf:
        counted && proof.asOfLabel
          ? { dateTime: counted.asOf, label: `${proof.asOfLabel} ${longDate(counted.asOf)}` }
          : undefined,
    };
  });
}

/** The plates, with the live status and the new mark of the project each one names. */
export function toPlates(
  plates: HomeContent['ownTime']['plates'],
  live: HomeLive = {},
  fresh: HomeFresh = {},
): ProjectPlate[] {
  return plates.map((plate) => {
    const status = plate.project ? live.status?.[plate.project] : undefined;
    return {
      key: plate.href,
      name: plate.name,
      summary: plate.line,
      href: plate.href,
      kind: plate.imageKind,
      status: status?.tone ?? statusTone(plate.status),
      statusLabel: status?.label ?? plate.status,
      fresh: plate.project ? (fresh[plate.project] ?? null) : null,
      image: plate.image,
      frame: plate.frame,
      phoneFrame: plate.phoneFrame,
      featured: plate.featured,
      weight: plate.weight,
    };
  });
}

export interface HomeTemplateProps {
  /** The page's hand content (`home.json`): every word, image and plate frame. */
  content: HomeContent;
  /** Live data. Without it every status and number is the hand one, and no fact has a date. */
  live?: HomeLive;
  /** Live data: the new marks. Without it no plate carries one. */
  fresh?: HomeFresh;
  /**
   * The tree teaser. It is another package's component, so it is passed in; the section makes it
   * one link to the map. Without it the page goes from the plates to the hand-off.
   */
  map?: ReactNode;
}

/**
 * Home: the stump hero, then the proof row, the work pipeline, the project plates and the map
 * teaser on the thread, then the hand-off to Projects.
 *
 * The hero runs up behind the site header: the shell sets `--stump-hero-lift` to the header's
 * height on this page.
 */
export function HomeTemplate({ content, live, fresh, map }: HomeTemplateProps) {
  const { hero, proof, atWork, ownTime, next } = content;
  const { stump } = hero;
  const headline = hero.headline;
  const underlined = headline.at(-1)?.endsWith(hero.underlined) ? hero.underlined : undefined;

  return (
    <>
      <StumpHero
        eyebrow={hero.eyebrow}
        headline={headline}
        underline={underlined}
        lead={hero.lead}
        primaryAction={hero.actions.find((action) => action.variant === 'primary')}
        secondaryAction={hero.actions.find((action) => action.variant === 'quiet')}
        image={stump.wide}
        litImage={stump.wideLit}
        phoneImage={stump.phone}
        projects={toHeroProjects(stump.projects, live)}
        rings={stump.rings.map((ring) => ({
          name: ring.label,
          detail: ring.when,
          tone: ring.tone,
        }))}
        projectsLabel={stump.listLabel}
        linkAs={RouterLink}
      />
      <ThreadScope>
        <ThreadColumn placement="edge">
          <Thread placement="edge" bottom={84} />
          <ProofRow
            aria-label={proof.label}
            facts={toProofFacts(proof, live)}
            linkAs={RouterLink}
          />
          <AtWorkPipeline
            label={atWork.eyebrow}
            title={atWork.title}
            body={atWork.text}
            link={atWork.link}
            steps={atWork.flow.steps}
            flowLabel={atWork.flow.label}
            linkAs={RouterLink}
          />
          <ProjectPlates
            label={ownTime.title}
            intro={ownTime.lead}
            allLink={ownTime.link}
            plates={toPlates(ownTime.plates, live, fresh)}
            linkAs={RouterLink}
          />
          {map ? (
            <ProjectMapTeaser
              title={content.map.title}
              link={content.map.link}
              mapLink={{ label: content.map.mapLinkLabel, href: content.map.link.href }}
              linkAs={RouterLink}
            >
              {map}
            </ProjectMapTeaser>
          ) : null}
          <HomeHandoff
            aria-label={next.label}
            label={next.label}
            next={next.link}
            aside={next.aside}
            linkAs={RouterLink}
          />
        </ThreadColumn>
      </ThreadScope>
    </>
  );
}
