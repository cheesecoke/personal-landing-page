// Fixture data as typed objects, safe to import in the browser (stories, templates, tests).
// Everything is parsed on import, so a fixture that drifts from the schema fails loudly.
import seedAbout from '../fixtures/seed/about.json';
import seedMeta from '../fixtures/seed/meta.json';
import seedAiSystem from '../fixtures/seed/projects/ai-system.json';
import seedAtti from '../fixtures/seed/projects/atti.json';
import seedBusinessBrain from '../fixtures/seed/projects/business-brain.json';
import seedDistill from '../fixtures/seed/projects/distill.json';
import seedDuoDecide from '../fixtures/seed/projects/duo-decide.json';
import seedFinanceBrain from '../fixtures/seed/projects/finance-brain.json';
import seedLifebox from '../fixtures/seed/projects/lifebox.json';
import seedOneRep from '../fixtures/seed/projects/one-rep.json';
import seedPas from '../fixtures/seed/projects/pas.json';
import seedPersonalBrain from '../fixtures/seed/projects/personal-brain.json';
import seedThisSite from '../fixtures/seed/projects/this-site.json';
import seedThreadQuest from '../fixtures/seed/projects/thread-quest.json';
import seedTitanLog from '../fixtures/seed/titan-log.json';
import aboutEmpty from '../fixtures/valid/about.empty.json';
import aboutGrowing from '../fixtures/valid/about.growing.json';
import metaPublished from '../fixtures/valid/meta.published.json';
import projectEmpty from '../fixtures/valid/project.empty.json';
import projectGrowing from '../fixtures/valid/project.growing.json';
import projectLive from '../fixtures/valid/project.live.json';
import projectNameOnly from '../fixtures/valid/project.name-only.json';
import projectNoUpdate from '../fixtures/valid/project.no-update.json';
import titanLogDisabled from '../fixtures/valid/titan-log.disabled.json';
import titanLogEnabled from '../fixtures/valid/titan-log.enabled.json';
import type { LiveContent } from './live';
import { aboutSchema, metaSchema, titanLogSchema } from './schema/about';
import { nameOnlyProjectSchema, projectSchema, publicProjectSchema } from './schema/project';

const seedTitan = titanLogSchema.parse(seedTitanLog);

/**
 * The seed data: exactly what `loadLiveContent()` returns while nothing has been published. Use it
 * for template stories; routes get the same shape from the loader.
 */
export const seedContent: LiveContent = {
  meta: metaSchema.parse(seedMeta),
  projects: [
    seedAiSystem,
    seedAtti,
    seedBusinessBrain,
    seedDistill,
    seedDuoDecide,
    seedFinanceBrain,
    seedLifebox,
    seedOneRep,
    seedPas,
    seedPersonalBrain,
    seedThisSite,
    seedThreadQuest,
  ].map((project) => projectSchema.parse(project)),
  about: aboutSchema.parse(seedAbout),
  titanLog: seedTitan.enabled ? seedTitan : null,
};

/** One fixture per state a component can be in. */
export const fixtures = {
  /** A growing project with a recent log, shoots, rings and facts. */
  projectGrowing: publicProjectSchema.parse(projectGrowing),
  /** An example of a live project: release, release notes, a grown shoot. Not real. */
  projectLive: publicProjectSchema.parse(projectLive),
  /** A growing project whose newest entry is months old. */
  projectNoUpdate: publicProjectSchema.parse(projectNoUpdate),
  /** A public project with no log, release, shoots, rings or facts. */
  projectEmpty: publicProjectSchema.parse(projectEmpty),
  projectNameOnly: nameOnlyProjectSchema.parse(projectNameOnly),
  aboutGrowing: aboutSchema.parse(aboutGrowing),
  aboutEmpty: aboutSchema.parse(aboutEmpty),
  /** The job log switched off: components render nothing. */
  titanLogDisabled: titanLogSchema.parse(titanLogDisabled),
  /** Sample entries, for stories and tests only. */
  titanLogEnabled: titanLogSchema.parse(titanLogEnabled),
  metaPublished: metaSchema.parse(metaPublished),
};
