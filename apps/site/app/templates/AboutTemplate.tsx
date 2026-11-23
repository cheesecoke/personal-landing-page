import type { AboutContent } from '@cwc/content/hand';
import {
  AboutIntro,
  BuildWith,
  Container,
  CurrentRoleBlock,
  FieldNotes,
  HandoffFooter,
  NowBlock,
  Portrait,
  RingsTimeline,
  stumpRings,
  Thread,
  ThreadColumn,
  ThreadNode,
  ThreadScope,
  type BuildWithStage,
  type BuildWithTool,
  type CurrentRole,
  type NowEntry,
  type PortraitLook,
  type RingsItem,
} from '@cwc/ui';

import { renderParagraph, splitLead } from '../content/paragraph';
import { RouterLink } from '../shell/RouterLink';

type Rings = AboutContent['rings'];
type Chapter = Rings['chapters'][number];

/**
 * Detail paragraphs the page leaves out, by chapter id and position. The wildland fire chapter
 * keeps its summary line and its last paragraph; the two before it are not shown.
 */
const hiddenDetails: Record<string, readonly number[]> = { 'wildland-fire': [0, 1] };

/**
 * The chapters as the `RingsTimeline` section takes them.
 *
 * Hand content names one ring per chapter; a chapter lights every ring from its own up to the
 * next chapter's, so no ring of the drawing is left out (Roots is the two at the centre). A
 * chapter with no ring is a note between rings. The markers follow the board: the first chapter
 * has no years and is the dashed root; the warm chapter and the current job are filled dots.
 * A dashed rule (time passed) sits above the first chapter, the one after the root, and the one
 * after a note.
 *
 * `role` is the live current role. The chapter that carries a hand-written role line shows it
 * instead, written as "<title>, since <Month Year>." with the chapter's `sinceLabel` as the word
 * in the middle. Without live data, or without that word, the hand-written line shows.
 */
export function toRingsItems(rings: Rings, role?: CurrentRole | null): RingsItem[] {
  const ringed = rings.chapters.filter((chapter) => chapter.ring !== null);
  const ringsOf = (chapter: Chapter): number[] => {
    const next = ringed[ringed.indexOf(chapter) + 1];
    const from = chapter.ring ?? 0;
    const to = next?.ring != null ? next.ring - 1 : from;
    return Array.from({ length: Math.max(1, to - from + 1) }, (_, index) => from + index);
  };
  const isRoot = (chapter: Chapter | undefined) =>
    chapter !== undefined && chapter === ringed[0] && !chapter.years;

  return rings.chapters.map((chapter, index): RingsItem => {
    if (chapter.ring === null) {
      return {
        kind: 'note',
        id: chapter.id,
        label: chapter.label,
        years: chapter.years,
        text: chapter.summary,
      };
    }
    const before = rings.chapters[index - 1];
    const hidden = hiddenDetails[chapter.id] ?? [];
    const details = chapter.details?.filter((_, position) => !hidden.includes(position));
    return {
      id: chapter.id,
      label: chapter.label,
      years: chapter.years,
      // The current job opens with the role: live data when there is some, else the hand line.
      summary: chapter.role ? (
        <CurrentRoleBlock
          role={chapter.sinceLabel ? (role ?? null) : null}
          sinceLabel={chapter.sinceLabel}
          fallback={chapter.role}
        >
          {chapter.summary}
        </CurrentRoleBlock>
      ) : (
        chapter.summary
      ),
      rings: ringsOf(chapter),
      tone: chapter.tone,
      marker: isRoot(chapter) ? 'root' : chapter.tone === 'ember' || chapter.role ? 'dot' : 'ring',
      gapBefore: index === 0 || before?.ring === null || isRoot(before),
      details: details?.map(splitLead),
      link: chapter.more,
      // The chapter's log line ("Latest from the log") is not shown on this page.
    };
  });
}

/** The portrait's two looks as the `Portrait` section takes them. */
export function toPortraitLooks(portrait: AboutContent['person']['portrait']): {
  normal: PortraitLook;
  cyber: PortraitLook;
} {
  const { stills, clips, glance } = portrait;
  const still = ({ src, width, height }: (typeof stills)['normal']) => ({ src, width, height });
  return {
    normal: {
      still: still(stills.normal),
      alt: stills.normal.alt,
      clips: {
        idle: clips.normalIdle.src,
        glance: clips.normalGlance.src,
        glanceTiming: glance.normal,
        transform: clips.toCyber.src,
      },
    },
    cyber: {
      still: still(stills.cyber),
      alt: stills.cyber.alt,
      clips: {
        idle: clips.cyberIdle.src,
        glance: clips.cyberGlance.src,
        glanceTiming: glance.cyber,
        transform: clips.toNormal.src,
      },
    },
  };
}

/** The tool groups in order: the first is what was tried, the last is current, any between "also". */
export function toBuildWith(groups: AboutContent['tools']['groups']): {
  tools: BuildWithTool[];
  stageLabels: Record<BuildWithStage, string>;
} {
  const stageOf = (index: number): BuildWithStage =>
    index === groups.length - 1 ? 'current' : index === 0 ? 'tried' : 'also';
  const stageLabels: Record<BuildWithStage, string> = { tried: '', also: '', current: '' };
  const tools = groups.flatMap((group, index) => {
    const stage = stageOf(index);
    stageLabels[stage] ||= group.label;
    return group.tools.map((name) => ({ name, stage }));
  });
  return { tools, stageLabels };
}

export interface AboutTemplateProps {
  /** The page's hand content (`about.json`). */
  content: AboutContent;
  /** Live data: the Now line. Without it there is no Now section. */
  now?: NowEntry | null;
  /** Live data: the current role. Without it the current job's ring shows the hand-written line. */
  currentRole?: CurrentRole | null;
}

/**
 * About: the chapters as growth rings (the page title is theirs), the person, the tools, the Now
 * line when there is one, and the hand-off.
 */
export function AboutTemplate({ content, now = null, currentRole = null }: AboutTemplateProps) {
  const { rings, person, tools, next } = content;
  const [lead, ...rest] = person.paragraphs;
  const looks = toPortraitLooks(person.portrait);
  return (
    <ThreadScope>
      <Container>
        <ThreadColumn placement="column">
          <Thread placement="column" fadeIn={2} bottom={129}>
            <ThreadNode placement="rail" top={52} />
            <ThreadNode placement="rail" bottom={0} />
          </Thread>

          <RingsTimeline
            title={rings.title}
            lead={rings.lead}
            art={{
              ...stumpRings,
              src: rings.image.src,
              alt: rings.image.alt,
              sources: rings.image.sources,
            }}
            items={toRingsItems(rings, currentRole)}
            ending={rings.ungrown}
            defaultSelected={rings.openChapter}
            linkAs={RouterLink}
          />

          <AboutIntro
            className="mt-30"
            aria-label={person.label}
            portrait={
              <Portrait
                normal={looks.normal}
                cyber={looks.cyber}
                toggleLabel={person.portrait.toggle.label}
                onLabel={person.portrait.toggle.on}
                offLabel={person.portrait.toggle.off}
                caption={person.portrait.caption}
              />
            }
            lead={lead ? renderParagraph(lead) : null}
            body={
              rest.length
                ? rest.map((paragraph, index) => (
                    <span key={index}>
                      {index > 0 ? ' ' : null}
                      {renderParagraph(paragraph)}
                    </span>
                  ))
                : undefined
            }
          >
            <FieldNotes title={person.rules.title} notes={person.rules.items} />
          </AboutIntro>

          <BuildWith
            className="mt-26"
            title={tools.title}
            titleId={tools.id}
            listLabel={tools.listLabel}
            {...toBuildWith(tools.groups)}
            facts={tools.facts.map((fact) => ({ label: fact.term, value: fact.value }))}
            link={tools.link}
            linkAs={RouterLink}
          />

          <NowBlock
            className="mt-24"
            now={now}
            label={content.now.title}
            titleId={content.now.id}
          />

          <HandoffFooter
            space="about"
            aria-label={next.label}
            label={next.eyebrow}
            title={next.link.label}
            href={next.link.href}
            linkAs={RouterLink}
          />
        </ThreadColumn>
      </Container>
    </ThreadScope>
  );
}
