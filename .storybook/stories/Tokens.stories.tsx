import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactNode } from 'react';

import {
  breakpoint,
  cssDuration,
  duration,
  ease,
  font,
  fresh,
  glow,
  layout,
  palette,
  semantic,
  texture,
  type,
  type TypeRole,
} from '@cwc/tokens';

/** Everything on this page is read from `packages/tokens/src/tokens.ts`. */
const meta = {
  title: 'Foundations/Tokens',
  parameters: { layout: 'fullscreen' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const kebab = (name: string) => name.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
const title = (name: string) =>
  kebab(name)
    .replace(/-/g, ' ')
    .replace(/^./, (c) => c.toUpperCase());

function Section({ label, note, children }: { label: string; note?: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-5 border-t border-hairline pt-6">
      <div className="flex flex-col gap-3">
        <h2 className="type-label m-0">{label}</h2>
        {note ? <p className="type-h3 m-0">{note}</p> : null}
      </div>
      {children}
    </section>
  );
}

function Value({ name, value }: { name: string; value: ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="type-label">{name}</span>
      <span className="font-readout text-bone">{value}</span>
    </div>
  );
}

const typeSamples: Record<keyof typeof type, string> = {
  hero: 'What I’ve built, and what’s still growing.',
  h1: 'Rings',
  h2: 'Duo Decide',
  h3: 'How a decision works',
  lead: 'A decision app for couples.',
  body: 'Vote mode finishes when both have voted.',
  label: 'About / Titan Intake',
  button: 'See the projects',
  nav: 'Projects',
  link: 'All projects',
  handoff: 'AI system',
  'readout-numeral': '1,167',
  'readout-status': 'In build',
  'readout-stardate': '2026.324',
};

// Tailwind only emits classes it can read as whole strings, so the names are spelled out.
const typeClass: Record<keyof typeof type, string> = {
  hero: 'type-hero',
  h1: 'type-h1',
  h2: 'type-h2',
  h3: 'type-h3',
  lead: 'type-lead',
  body: 'type-body',
  label: 'type-label',
  button: 'type-button',
  nav: 'type-nav',
  link: 'type-link',
  handoff: 'type-handoff',
  'readout-numeral': 'type-readout-numeral',
  'readout-status': 'type-readout-status',
  'readout-stardate': 'type-readout-stardate',
};

const typeSpec = (role: TypeRole) =>
  [
    role.font === 'sans' ? 'Mona Sans' : 'Tomorrow',
    role.size,
    role.weight,
    role.stretch ? `width ${role.stretch}` : null,
    `line ${role.lineHeight}`,
    `tracking ${role.tracking}`,
    role.uppercase ? 'uppercase' : null,
    title(role.color),
  ]
    .filter(Boolean)
    .join(' · ');

/** Plot a cubic-bezier easing as an SVG path in a 100 × 100 box. */
function EasingCurve({ value }: { value: string }) {
  const [x1 = 0, y1 = 0, x2 = 1, y2 = 1] = (value.match(/-?\d*\.?\d+/g) ?? []).map(Number);
  const d = `M0 100 C${x1 * 100} ${100 - y1 * 100} ${x2 * 100} ${100 - y2 * 100} 100 0`;
  return (
    <svg aria-hidden="true" viewBox="-4 -4 108 108" className="size-24 overflow-visible">
      <path d="M0 100 H100 M0 100 V0" fill="none" className="stroke-tick" strokeWidth="1" />
      <path d={d} fill="none" className="stroke-signal" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

const longestDuration = Math.max(...Object.values(duration));
const longestLife = Math.max(...Object.values(fresh.life));

export const Tokens: Story = {
  render: () => (
    <div className="mx-auto flex max-w-page flex-col gap-11 px-gutter py-16">
      <header className="flex flex-col gap-3">
        <div className="type-label">Design system</div>
        <h1 className="type-h1 m-0">Tokens</h1>
      </header>

      <Section label="Palette">
        <div className="grid grid-cols-[repeat(auto-fill,minmax(96px,1fr))] gap-3">
          {Object.entries(palette).map(([name, hex]) => (
            <div key={name} className="flex flex-col gap-2.5">
              <div
                className="h-14 rounded-button border border-hairline"
                style={{ backgroundColor: hex }}
              />
              <div className="flex flex-col gap-0.5">
                <span className="text-[13px] text-bone">{title(name)}</span>
                <span className="type-label">{hex}</span>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section label="Semantic colour">
        <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-x-8 gap-y-4">
          {Object.entries(semantic).flatMap(([group, roles]) =>
            Object.entries(roles).map(([role, name]) => (
              <div key={`${group}.${role}`} className="flex items-center gap-3">
                <span
                  className="size-6 flex-none rounded-full border border-hairline"
                  style={{ backgroundColor: palette[name] }}
                />
                <Value name={`${group}.${role}`} value={title(name)} />
              </div>
            )),
          )}
          {Object.entries(glow).map(([name, value]) => (
            <div key={name} className="flex items-center gap-3">
              <span className="h-px w-6 flex-none bg-signal shadow-glow-signal" />
              <Value
                name={`glow.${name}`}
                value={`${title(value.color)} ${value.alpha * 100}% · ${value.blur}`}
              />
            </div>
          ))}
        </div>
      </Section>

      <Section label="Type" note="Mona Sans speaks. Tomorrow only measures.">
        <div className="flex flex-col gap-4">
          {Object.entries(font).map(([name, stack]) => (
            <Value key={name} name={`font.${name}`} value={stack} />
          ))}
        </div>
        <div className="flex flex-col">
          {(Object.entries(type) as [keyof typeof type, TypeRole][]).map(([name, role]) => (
            <div key={name} className="flex flex-col gap-3 border-t border-hairline py-5">
              <div className="type-label">
                {name} · {typeSpec(role)}
              </div>
              <div className={typeClass[name]}>{typeSamples[name]}</div>
            </div>
          ))}
        </div>
      </Section>

      <Section label="Space and layout">
        <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-x-8 gap-y-4">
          {Object.entries(layout).map(([name, value]) => (
            <Value key={name} name={kebab(name)} value={value} />
          ))}
        </div>
      </Section>

      <Section label="Breakpoints (min width)">
        <div className="grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-x-8 gap-y-4">
          {Object.entries(breakpoint).map(([name, px]) => (
            <Value key={name} name={name} value={`${px}px`} />
          ))}
        </div>
      </Section>

      <Section label="Motion">
        <div className="flex flex-wrap gap-12">
          {Object.entries(ease).map(([name, value]) => (
            <div key={name} className="flex flex-col gap-3">
              <EasingCurve value={value} />
              <Value name={`ease.${name}`} value={value} />
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-3">
          {Object.entries(duration).map(([name, ms]) => (
            <div key={name} className="grid grid-cols-[140px_64px_1fr] items-center gap-4">
              <span className="type-label">{name}</span>
              <span className="font-readout text-hinoki">{cssDuration(ms)}</span>
              <span className="h-px bg-tick">
                <span
                  className="block h-px bg-signal"
                  style={{
                    width: `${Math.max(1, (Math.sqrt(ms) / Math.sqrt(longestDuration)) * 100)}%`,
                  }}
                />
              </span>
            </div>
          ))}
        </div>
      </Section>

      <Section label="Freshness">
        <div className="flex flex-col gap-3">
          {Object.entries(fresh.life).map(([kind, days]) => (
            <div key={kind} className="grid grid-cols-[140px_64px_1fr] items-center gap-4">
              <span className="type-label">life.{kind}</span>
              <span className="font-readout text-hinoki">{days}d</span>
              <span className="h-px bg-fresh-track">
                <span
                  className="block h-px bg-fresh-ring"
                  style={{ width: `${(days / longestLife) * 100}%` }}
                />
              </span>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-x-12 gap-y-4">
          <Value name="cap (markers per page)" value={fresh.cap} />
          <Value name="nav (days, release only)" value={`${fresh.nav}d`} />
        </div>
      </Section>

      <Section label="Texture">
        <div className="flex flex-wrap gap-x-12 gap-y-4">
          <Value name="grain opacity" value={texture.grain.opacity} />
          <Value name="base frequency" value={texture.grain.baseFrequency} />
          <Value name="octaves" value={texture.grain.numOctaves} />
        </div>
      </Section>
    </div>
  ),
};
