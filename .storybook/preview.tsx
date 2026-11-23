import type { Preview } from '@storybook/react-vite';

import { palette } from '@cwc/tokens';

import { withMotion, withRouter, withSiteDate } from './decorators';
import { DEFAULT_SITE_DATE, siteDateItems } from './site-date';

// Tailwind, the tokens, the fonts and the base styles: the same CSS the site loads.
import './preview.css';

const preview: Preview = {
  decorators: [withRouter, withSiteDate, withMotion],
  globalTypes: {
    motion: {
      description: 'Reduced motion',
      toolbar: {
        title: 'Motion',
        icon: 'play',
        items: [
          { value: 'system', title: 'Motion: system setting' },
          { value: 'reduce', title: 'Motion: reduced' },
        ],
        dynamicTitle: true,
      },
    },
    siteDate: {
      description: 'The date stories treat as today (drives freshness)',
      toolbar: {
        title: 'Site date',
        icon: 'calendar',
        items: siteDateItems,
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    motion: 'system',
    siteDate: DEFAULT_SITE_DATE,
    backgrounds: { value: 'ground' },
  },
  parameters: {
    // Dark on purpose: every story sits on Ground.
    backgrounds: {
      options: {
        ground: { name: 'Ground', value: palette.ground },
        surface: { name: 'Surface', value: palette.surface },
        raised: { name: 'Raised', value: palette.raised },
      },
    },
    viewport: {
      options: {
        phone: { name: 'Phone 390', styles: { width: '390px', height: '844px' }, type: 'mobile' },
        tablet: {
          name: 'Tablet 768',
          styles: { width: '768px', height: '1024px' },
          type: 'tablet',
        },
        desktop: {
          name: 'Desktop 1440',
          styles: { width: '1440px', height: '900px' },
          type: 'desktop',
        },
      },
    },
    // Accessibility violations fail the story test.
    a11y: { test: 'error' },
    controls: { matchers: { date: /Date$/i } },
    options: {
      storySort: { order: ['Foundations', 'Primitives', 'Layout', 'Sections', 'Templates'] },
    },
  },
};

export default preview;
