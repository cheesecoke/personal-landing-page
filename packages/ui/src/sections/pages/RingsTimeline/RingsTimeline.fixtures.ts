import { palette } from '@cwc/tokens';

import type { RingsArt, RingsItem } from './RingsTimeline';
import { stumpRings } from './stumpRings';

/**
 * A stand-in for the stump image: the same rings, drawn as plain lines in the image's own space.
 * The site passes the real image; the geometry is the same.
 */
const placeholder = () => {
  const { width, height } = stumpRings.viewBox;
  const rings = stumpRings.rings
    .map(
      (ring) =>
        `<polygon points="${ring.points}" fill="none" stroke="${palette.tick}" stroke-width="3"/>`,
    )
    .join('');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}"><rect width="${width}" height="${height}" fill="${palette.ground}"/><ellipse cx="992" cy="756" rx="430" ry="372" fill="${palette.raised}"/>${rings}</svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
};

export const stumpArt: RingsArt = {
  ...stumpRings,
  src: placeholder(),
  alt: 'A stylised tree stump seen from above, its growth rings drawn as thin lines of light, one ring glowing orange',
};

/** The About board's chapters, oldest first. */
export const chapters: RingsItem[] = [
  {
    id: 'roots',
    label: 'Roots',
    summary: 'I came to engineering through design, and I still think like an artist.',
    rings: [0, 1],
    marker: 'root',
    gapBefore: true,
    details: [
      {
        lead: 'Digital Arts, BA',
        text: ', 2013. I studied design before I wrote any production code.',
      },
      {
        lead: 'Concept first.',
        text: 'The thing I learned in school and have carried through my whole career is the concept: what are you building, and why? What is it trying to say or solve? Once that is clear, I use any and all tools to get there.',
      },
    ],
  },
  {
    id: 'truecar',
    label: 'TrueCar',
    years: '2014–2019',
    summary:
      'The go-to frontend engineer on a platform migration for 600+ partners. Two hackathon wins.',
    rings: [2],
    gapBefore: true,
    details: [
      {
        lead: 'Junior to senior.',
        text: 'I worked on four product teams in four years and was promoted along the way. Every move meant a new codebase, and I was productive fast each time.',
      },
      {
        lead: 'The MPP migration.',
        text: 'The company moved its Multi-Partner Platform off a legacy stack to React/Redux, with Node.js middleware and Cypress test coverage. I was the go-to CSS and frontend engineer, which is why they pulled me onto it. I led the frontend side: the assets, the components, and a one-to-one check of the new build against the legacy code. The platform got faster, more reliable, and quicker to release for every partner on it.',
      },
      {
        lead: 'Hackathon winner.',
        text: 'My team won the TrueCar Hackathon in 2017 and again in 2019.',
      },
      {
        lead: 'Mentoring.',
        text: 'I shared frontend practices through pairing and code reviews, and I mentored the junior developers coming up behind me.',
      },
    ],
  },
  {
    id: 'tradesy',
    label: 'Tradesy',
    years: '2019–2020',
    summary: 'Sole engineer on a growth team at a resale marketplace. Owned the move to React.',
    rings: [3],
    details: [
      {
        lead: 'Influencer pages.',
        text: "As the growth team's only engineer, I built the influencer pages myself. I learned PHP backend work so I could ship every feature end to end.",
      },
      {
        lead: 'Legacy to React.',
        text: 'I owned the migration of the legacy frontend to React.',
      },
      {
        lead: 'Shared component library.',
        text: 'I set up a shared component library along the way, so new features started from common parts instead of from scratch.',
      },
    ],
  },
  {
    id: 'wildland-fire',
    label: 'Wildland fire',
    years: '2022–2024',
    summary:
      'Some time on a wildland fire crew: academy, engine, then a hotshot crew. Top Cadet, then Rookie of the Year.',
    rings: [4],
    tone: 'ember',
    marker: 'dot',
    details: [
      {
        lead: 'Decisions under pressure.',
        text: 'I worked long assignments in remote terrain where the stakes were high, on a tight crew where every role depended on the others. The lesson I brought back: stay calm, and do the job in front of you.',
      },
    ],
  },
  {
    kind: 'note',
    id: 'back-to-software',
    label: 'Back to software',
    years: '2025',
    text: 'I came back from the fireline to a field that had changed. For me, AI is a dream come true: a chance to grow and work twice as fast.',
  },
  {
    id: 'porchpass',
    label: 'PorchPass',
    years: '2025–2026',
    summary: 'Owned the core dealer tools and led AI adoption across the company.',
    rings: [5],
    gapBefore: true,
    details: [
      {
        lead: 'Company-wide AI adoption.',
        text: 'People were running LLM experiments on their own. I turned those into shared decisions about which tools to use, how to roll them out, and how to keep them safe.',
      },
      {
        lead: 'Reliable dealer tools.',
        text: 'I owned the core dealer tools end to end in React/TypeScript. I built custom UI components and hardened the API integrations so the tools held up for dealer partners.',
      },
      {
        lead: 'A modern frontend.',
        text: 'I worked with product, design, and backend to rebuild the frontend architecture around reusable components and responsive design. Features shipped faster, and the UI became consistent across the platform.',
      },
    ],
  },
  {
    id: 'titan-intake',
    label: 'Titan Intake',
    years: '2026–now',
    summary:
      'Senior Software Engineer, AI, since January 2026. I build the pipeline between a product spec and shipped code.',
    rings: [6],
    marker: 'dot',
    details: [
      {
        text: 'I build agent pipelines that turn a product spec into tested code, and the evaluation and memory layers that help them improve over time. I also teach the team how to work with AI.',
      },
    ],
    link: { label: 'More about the work', href: '/work/titan-intake' },
  },
];

export const ending = 'Not yet grown.';
