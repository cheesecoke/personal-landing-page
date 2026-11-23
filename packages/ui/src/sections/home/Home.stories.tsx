import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { SiteNav } from '../../layout';
import { RingArcs } from '../../primitives';
import { AtWorkPipeline } from './AtWorkPipeline/AtWorkPipeline';
import { HomeHandoff } from './HomeHandoff/HomeHandoff';
import {
  atWorkCopy,
  handoffCopy,
  heroCopy,
  heroProjects,
  heroRings,
  mapCopy,
  plateAlts,
  platesCopy,
  projectPlates,
  proofFacts,
} from './internal/homeCopy';
import { HomeStory } from './internal/HomeStory';
import { plateArt, stumpPhoneArt, stumpWideArt, stumpWideLitArt } from './internal/storyArt';
import { ProjectMapTeaser } from './ProjectMapTeaser/ProjectMapTeaser';
import { ProjectPlates, type ProjectPlate } from './ProjectPlates/ProjectPlates';
import { ProofRow } from './ProofRow/ProofRow';
import { StumpHero } from './StumpHero/StumpHero';

const art = {
  pas: plateArt('signal'),
  'duo-decide': plateArt('ember'),
  'ai-system': plateArt('ash'),
};
const plates: ProjectPlate[] = projectPlates.map((plate) => {
  const key = plate.key as keyof typeof art;
  return { ...plate, image: { ...art[key], alt: plateAlts[key] } };
});

/** Home's sections in the board's order, on the Home thread. Not the page template: a reference. */
function HomeSections() {
  return (
    <div className="overflow-x-clip">
      <StumpHero
        eyebrow={heroCopy.eyebrow}
        headline={heroCopy.headline}
        underline={heroCopy.underline}
        lead={heroCopy.lead}
        primaryAction={heroCopy.primaryAction}
        secondaryAction={heroCopy.secondaryAction}
        image={stumpWideArt}
        litImage={stumpWideLitArt}
        phoneImage={{ ...stumpPhoneArt, alt: heroCopy.phoneAlt }}
        projects={heroProjects}
        rings={heroRings}
        projectsLabel={heroCopy.projectsLabel}
        nav={
          <SiteNav
            name="Chase Cole"
            label="Site"
            menu={{ open: 'Menu', close: 'Close', home: 'Home' }}
            current="/"
            items={[
              { label: 'Projects', href: '/projects' },
              { label: 'About', href: '/about' },
              { label: 'Beyond', href: '/beyond', quiet: true },
              { label: 'Contact', href: '/contact' },
            ]}
          />
        }
      />
      <HomeStory>
        <ProofRow aria-label="Proof" facts={proofFacts} />
        <AtWorkPipeline {...atWorkCopy} />
        <ProjectPlates {...platesCopy} plates={plates} />
        <ProjectMapTeaser {...mapCopy}>
          <div className="flex h-[360px] items-center justify-center rounded-panel border border-dashed border-hairline md:h-[460px]">
            <RingArcs />
          </div>
        </ProjectMapTeaser>
        <HomeHandoff {...handoffCopy} />
      </HomeStory>
    </div>
  );
}

const meta = {
  title: 'Sections/Home/In page order',
  component: HomeSections,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof HomeSections>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Hero, proof, at work, plates, map, hand-off: one thread node per threaded section. */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    await expect(canvasElement.querySelectorAll('[data-thread-node]')).toHaveLength(4);
    await expect(canvasElement.ownerDocument.documentElement.scrollWidth).toBeLessThanOrEqual(
      canvasElement.ownerDocument.documentElement.clientWidth,
    );
  },
};

export const Tablet: Story = { globals: { viewport: { value: 'tablet' } } };
export const Phone: Story = { globals: { viewport: { value: 'phone' } } };
export const Reduced: Story = { globals: { motion: 'reduce' } };
