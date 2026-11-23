import { useMemo, type ComponentPropsWithoutRef, type ReactNode } from 'react';

import type { Fact, PublicProject } from '@cwc/content';
import type { PageSection, ProjectPageContent } from '@cwc/content/hand';
import { FreshnessProvider, useFreshMark } from '@cwc/content/react';
import {
  AiSystemEvolution,
  ArtifactList,
  BrainsThatFeedIt,
  BrainZones,
  Breadcrumb,
  Container,
  DetailsStrip,
  DuoLensMark,
  GoDeeper,
  GrowSteps,
  HandoffFooter,
  Heading,
  HeroCapture,
  HeroDrawn,
  HeroFigure,
  IdeaCompare,
  Ladder,
  LinkCards,
  PasFamily,
  PhoneFigures,
  ProjectOpening,
  ProjectStateBadge,
  RingsDecor,
  Text,
  Thread,
  ThreadColumn,
  ThreadScope,
  ThreadSection,
  TitanFlow,
  WhereItsAt,
} from '@cwc/ui';

import { statusKeyTone, toFreshProp } from '../content/live';
import { renderParagraph } from '../content/paragraph';
import { statusTone } from '../content/status';
import { RouterLink } from '../shell/RouterLink';
import { projectLabels, type ProjectLabels } from './ProjectTemplate.labels';
import { hasLog, ProjectLog } from './ProjectTemplate.live';
import { cropFor, lookFor, type PageLook } from './ProjectTemplate.looks';
import {
  deeperMeasure,
  renderBody,
  toArtifact,
  toDeeperItems,
  toFacts,
  toFigure,
  whereItsAtParagraphs,
  type SectionOf,
} from './ProjectTemplate.map';

/** A link inside a page: the router for a site path, a plain anchor for `#id` and anything else. */
function PageLink({ href, ...rest }: ComponentPropsWithoutRef<'a'> & { href: string }) {
  return href.startsWith('/') ? <RouterLink href={href} {...rest} /> : <a href={href} {...rest} />;
}

function Hero({ hero, look }: { hero: ProjectPageContent['hero']; look: PageLook }) {
  const figure = hero.figure;
  // A page with no imagery opens on the drawn rings.
  if (!figure) return <RingsDecor />;
  if (figure.type === 'zones') {
    const { type: _type, caption, ...zones } = figure;
    return (
      <HeroDrawn caption={caption}>
        <BrainZones {...zones} />
      </HeroDrawn>
    );
  }
  if (figure.type === 'flow') {
    const [feedbackNote = '', measureNote = ''] = figure.notes;
    return (
      <HeroDrawn padded={false} caption={figure.caption}>
        <TitanFlow
          label={figure.label}
          steps={figure.steps}
          feedbackNote={feedbackNote}
          measureNote={measureNote}
        />
      </HeroDrawn>
    );
  }
  if (look.heroCapture) {
    return (
      <HeroCapture image={figure.image} caption={figure.caption} captionNote={figure.captionNote} />
    );
  }
  return (
    <HeroFigure
      image={figure.image}
      caption={figure.caption}
      crop={cropFor(figure.image.src)}
      className={look.heroClear ? '@[864px]:ml-8!' : undefined}
    />
  );
}

function Deeper({ section }: { section: SectionOf<'goDeeper'> }) {
  const { cards, feature, artifacts } = section;
  const artifactsLabel = section.artifactsLabel ?? section.title;
  const intro =
    cards || feature || artifacts ? (
      <>
        {cards ? (
          <LinkCards
            label={cards.label}
            cards={cards.items.map((card) => ({ ...card, tone: statusTone(card.status) }))}
            linkAs={PageLink}
          />
        ) : null}
        {feature ? (
          <GrowSteps
            id={feature.id}
            title={feature.title}
            text={feature.text}
            stepsLabel={feature.stepsLabel}
            steps={feature.steps}
          />
        ) : null}
        {artifacts ? (
          <ArtifactList
            label={artifactsLabel}
            artifacts={artifacts.map(toArtifact)}
            min={220}
            align="stretch"
            headingLevel={3}
            className="mb-10!"
          />
        ) : null}
      </>
    ) : undefined;
  return (
    <GoDeeper
      id={section.id}
      title={section.title}
      items={toDeeperItems(section)}
      artifactsLabel={artifactsLabel}
      intro={intro}
      measure={deeperMeasure(section)}
    />
  );
}

interface SectionContext {
  look: PageLook;
  /** Live counts that replace the hand-written ones. */
  facts?: readonly Fact[];
  /** Live "where it's at" text. It replaces the hand paragraphs only when the words differ. */
  whereItsAt?: string;
  /** What goes in the log slot. Nothing: the slot is left out, node and all. */
  log?: (slot: SectionOf<'log'>) => ReactNode;
}

function renderSection(
  section: PageSection,
  index: number,
  sections: readonly PageSection[],
  context: SectionContext,
): ReactNode {
  const key = `${section.type}-${index}`;
  switch (section.type) {
    case 'whereItsAt':
      return (
        <WhereItsAt
          key={key}
          id={section.id}
          title={section.title}
          paragraphs={whereItsAtParagraphs(section.paragraphs, context.whereItsAt)}
          facts={toFacts(section.facts, context.facts)}
          mark={context.look.mark === 'duo-lens' ? <DuoLensMark /> : undefined}
        />
      );
    case 'log': {
      const log = context.log?.(section);
      return log ? (
        <ThreadSection
          key={key}
          as="div"
          id={section.id}
          measure="log"
          className="z-1 flex scroll-mt-6 flex-col gap-6"
        >
          {log}
        </ThreadSection>
      ) : null;
    }
    case 'family':
      return (
        <PasFamily
          key={key}
          label={section.label}
          members={section.members}
          figure={section.figure ? toFigure(section.figure) : undefined}
          linkAs={PageLink}
        />
      );
    case 'figures':
      return section.title ? (
        <PhoneFigures
          key={key}
          id={section.id}
          title={section.title}
          paragraphs={section.paragraphs?.map(renderParagraph)}
          figures={section.figures}
        />
      ) : (
        <DetailsStrip
          key={key}
          id={section.id}
          label={section.label ?? ''}
          figures={section.figures.map(toFigure)}
          narrow={context.look.detailsNarrow}
          // A cropped image is pulled up over the section before it; its empty ground must not
          // cover that section's text.
          className={cropFor(section.figures[0]!.image.src) ? 'z-0!' : undefined}
        />
      );
    case 'timeline': {
      // The block the last stop links to is the prose section that follows.
      const next = sections[index + 1];
      return (
        <AiSystemEvolution
          key={key}
          id={section.id}
          title={section.title}
          label={section.label}
          stops={section.stops}
          figure={section.figure}
          next={
            next?.type === 'prose'
              ? {
                  id: next.id,
                  title: next.title,
                  paragraphs: next.paragraphs.map(renderParagraph),
                }
              : undefined
          }
          linkAs={PageLink}
        />
      );
    }
    case 'prose':
      // Already shown as the end of the timeline before it.
      if (sections[index - 1]?.type === 'timeline') return null;
      return (
        <ThreadSection
          key={key}
          id={section.id}
          aria-label={section.title}
          measure="log"
          className="z-1 scroll-mt-6"
        >
          <Heading level={2} role="label" className="mb-4">
            {section.title}
          </Heading>
          <Text measure>{renderBody(section.paragraphs)}</Text>
        </ThreadSection>
      );
    case 'compare':
      return (
        <IdeaCompare
          key={key}
          id={section.id}
          title={section.title}
          lead={section.lead}
          intro={renderParagraph(section.intro)}
          cards={section.cards}
          outro={renderParagraph(section.outro)}
          figure={section.figure ? toFigure(section.figure) : undefined}
        />
      );
    case 'ladder':
      return (
        <DetailsStrip key={key} label={section.label}>
          <Ladder stepsLabel={section.stepsLabel} steps={section.steps} text={section.text} />
        </DetailsStrip>
      );
    case 'feeds':
      return (
        <BrainsThatFeedIt
          key={key}
          id={section.id}
          title={section.title}
          items={section.items}
          diagram={section.diagram}
        />
      );
    case 'goDeeper':
      return <Deeper key={key} section={section} />;
  }
}

export interface ProjectPageProps extends Omit<SectionContext, 'look'> {
  /** The page's hand content. */
  content: ProjectPageContent;
  /** The status line above the title. */
  status: ReactNode;
}

/**
 * The page every project (and the job) is drawn with: breadcrumb, opening, then the hand sections
 * in the order the content lists them, each mapped to its component, and the hand-off. The thread
 * runs down the gutter and follows the reader; a link to an anchor scrolls there and opens the row.
 */
export function ProjectPage({ content, status, ...context }: ProjectPageProps) {
  const { hero, sections, next, breadcrumb } = content;
  const look = lookFor(content.slug);
  return (
    <ThreadScope hash>
      <Container width="project">
        <ThreadColumn placement="gutter">
          <Breadcrumb
            aria-label={breadcrumb.label}
            items={breadcrumb.items}
            linkAs={RouterLink}
            className="relative z-2 pt-5"
          />
          <div className="relative pt-6">
            <Thread placement="gutter" top={40} bottom={56} />
            <ProjectOpening
              title={hero.title}
              subtitle={hero.subtitle}
              status={status}
              lead={hero.lead}
            >
              <Hero hero={hero} look={look} />
            </ProjectOpening>
            {sections.map((section, index) =>
              renderSection(section, index, sections, { ...context, look }),
            )}
            <HandoffFooter
              variant="project"
              aria-label={next.label}
              label={next.eyebrow}
              title={next.link.label}
              href={next.link.href}
              back={next.back}
              linkAs={RouterLink}
            />
          </div>
        </ThreadColumn>
      </Container>
    </ThreadScope>
  );
}

export interface ProjectTemplateProps {
  /** The page's hand content (`projects/<slug>.json`). */
  content: ProjectPageContent;
  /**
   * Live data: the project's published file. Without it the page shows hand content only: the
   * hand status word, the hand counts, and no log, release or rings.
   */
  project?: PublicProject | null;
  /** The day the page was built (`YYYY-MM-DD`): decides whether the log has gone quiet. */
  today?: string;
  /** The words around the live data. */
  labels?: ProjectLabels;
}

function ProjectStatus({ content, project }: Pick<ProjectTemplateProps, 'content' | 'project'>) {
  const mark = useFreshMark(content.slug);
  if (!project) {
    const label = content.hero.status;
    return <ProjectStateBadge status={statusTone(label)} label={label} />;
  }
  return (
    <ProjectStateBadge
      status={statusKeyTone(project.status.key)}
      label={project.status.label}
      fresh={toFreshProp(mark)}
      reserveMarker={project.fresh !== null}
    />
  );
}

/**
 * A project page. Hand content gives the page its words and its order; live data, when there is
 * some, gives the status, the counts, the log with what has not grown yet, the release (a live
 * project only) and the branch rings. The new mark sits on the status, drawn in the browser from
 * the date of the project's last change.
 */
export function ProjectTemplate({
  content,
  project = null,
  today,
  labels = projectLabels,
}: ProjectTemplateProps) {
  const candidates = useMemo(
    () =>
      project?.fresh ? [{ id: content.slug, project: content.slug, fresh: project.fresh }] : [],
    [content.slug, project],
  );
  return (
    <FreshnessProvider candidates={candidates}>
      <ProjectPage
        content={content}
        status={<ProjectStatus content={content} project={project} />}
        facts={project?.facts}
        whereItsAt={project?.whereItsAt}
        log={(slot) =>
          hasLog(project) ? (
            <ProjectLog
              title={slot.label}
              name={content.hero.title}
              project={project}
              today={today}
              labels={labels}
            />
          ) : null
        }
      />
    </FreshnessProvider>
  );
}
