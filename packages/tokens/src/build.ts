import {
  breakpoint,
  duration,
  ease,
  edge,
  font,
  glow,
  layout,
  palette,
  semantic,
  tokens,
  tone,
  type,
  type PaletteName,
  type TypeRole,
} from './tokens';

const HEADER = '/* Generated from packages/tokens/src/tokens.ts. Do not edit. */';

const kebab = (name: string) => name.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);

/** Durations are stored in ms; CSS gets seconds below 1s precision the way the design writes them. */
export const cssDuration = (ms: number) => `${ms / 1000}s`;

const hexToRgb = (hex: string) =>
  [1, 3, 5].map((start) => Number.parseInt(hex.slice(start, start + 2), 16)).join(' ');

const paletteVar = (name: PaletteName) => `var(--palette-${kebab(name)})`;

const block = (selector: string, lines: string[]) =>
  `${selector} {\n${lines.map((line) => `  ${line}`).join('\n')}\n}`;

const entries = <T extends object>(object: T) =>
  Object.entries(object) as [keyof T & string, T[keyof T]][];

/** `tokens.css`: every token as a custom property on `:root`. */
export function toTokensCss(): string {
  const lines: string[] = [];

  lines.push('/* Primitives */');
  for (const [name, hex] of entries(palette)) lines.push(`--palette-${kebab(name)}: ${hex};`);

  lines.push('', '/* Semantic colour */');
  for (const [group, roles] of entries(semantic)) {
    for (const [role, name] of entries(roles)) {
      lines.push(`--${group}-${role}: ${paletteVar(name)};`);
    }
  }
  for (const [group, roles] of entries(tone)) {
    for (const [role, hex] of entries(roles)) lines.push(`--${group}-${kebab(role)}: ${hex};`);
  }
  for (const [name, value] of entries(glow)) {
    lines.push(
      `--glow-${name}: 0 0 ${value.blur} rgb(${hexToRgb(palette[value.color])} / ${value.alpha});`,
    );
  }

  for (const [name, value] of entries(edge)) {
    lines.push(
      `--edge-${name}: inset 0 1px 0 rgb(${hexToRgb(palette[value.color])} / ${value.alpha});`,
    );
  }

  lines.push('', '/* Type */');
  for (const [name, stack] of entries(font)) lines.push(`--font-${name}: ${stack};`);
  for (const [name, role] of entries(type) as [string, TypeRole][]) {
    lines.push(
      `--type-${name}-size: ${role.size};`,
      `--type-${name}-weight: ${role.weight};`,
      `--type-${name}-line-height: ${role.lineHeight};`,
      `--type-${name}-tracking: ${role.tracking};`,
    );
    if (role.stretch) lines.push(`--type-${name}-stretch: ${role.stretch};`);
  }

  lines.push('', '/* Space and layout */');
  for (const [name, value] of entries(layout)) lines.push(`--${kebab(name)}: ${value};`);

  lines.push('', '/* Motion */');
  for (const [name, value] of entries(ease)) lines.push(`--ease-${name}: ${value};`);
  for (const [name, ms] of entries(duration)) lines.push(`--duration-${name}: ${cssDuration(ms)};`);

  return `${HEADER}\n${block(':root', lines)}\n`;
}

function typeDeclarations(name: string, role: TypeRole): string[] {
  const lines = [
    `font-family: var(--font-${role.font});`,
    `font-size: var(--type-${name}-size);`,
    `font-weight: var(--type-${name}-weight);`,
    `line-height: var(--type-${name}-line-height);`,
    `letter-spacing: var(--type-${name}-tracking);`,
  ];
  if (role.stretch) lines.push(`font-stretch: var(--type-${name}-stretch);`);
  if (role.uppercase) lines.push('text-transform: uppercase;');
  lines.push(`color: ${paletteVar(role.color)};`);
  return lines;
}

/**
 * `theme.css`: the Tailwind v4 theme. `@theme inline` points utilities at the custom properties
 * in `tokens.css`, so both files must be loaded. Tailwind's default colours, breakpoints,
 * container sizes, fonts, radii and easings are cleared: only tokens exist.
 */
export function toThemeCss(): string {
  const theme: string[] = [
    '--color-*: initial;',
    '--font-*: initial;',
    '--breakpoint-*: initial;',
    '--container-*: initial;',
    '--radius-*: initial;',
    '--ease-*: initial;',
    '--shadow-*: initial;',
    '',
    '--color-transparent: transparent;',
    '--color-current: currentcolor;',
  ];

  for (const [name] of entries(palette)) {
    theme.push(`--color-${kebab(name)}: ${paletteVar(name)};`);
  }
  theme.push('');
  for (const [role] of entries(semantic.text)) {
    theme.push(`--text-color-${role}: var(--text-${role});`);
  }
  for (const group of ['accent', 'status', 'fresh', 'thread'] as const) {
    for (const [role] of entries(semantic[group])) {
      theme.push(`--color-${group}-${role}: var(--${group}-${role});`);
    }
  }
  // Tones: `border-line-tick-major`, `border-thread-next`, `text-diagram`.
  for (const [group, roles] of entries(tone)) {
    for (const [role] of entries(roles)) {
      const name = `${group}-${kebab(role)}`;
      theme.push(
        group === 'text'
          ? `--text-color-${kebab(role)}: var(--${name});`
          : `--color-${name}: var(--${name});`,
      );
    }
  }
  for (const [name] of entries(glow)) theme.push(`--shadow-glow-${name}: var(--glow-${name});`);
  for (const [name] of entries(edge)) theme.push(`--shadow-${name}: var(--edge-${name});`);

  theme.push('');
  // Same names as tokens.css, so these carry the value itself (a var() would point at itself).
  for (const [name, stack] of entries(font)) theme.push(`--font-${name}: ${stack};`);

  theme.push(
    '',
    '--spacing: var(--space-unit);',
    '--spacing-gutter: var(--gutter);',
    '--spacing-touch: var(--touch-target);',
    `--radius-panel: ${layout.radiusPanel};`,
    `--radius-button: ${layout.radiusButton};`,
    '--container-page: var(--container-max);',
    '--container-measure: var(--measure);',
  );

  // Breakpoints double as container-query sizes, so `md:` and `@md:` mean the same width.
  theme.push('');
  for (const [name, px] of entries(breakpoint)) {
    if (px === 0) continue;
    theme.push(`--breakpoint-${name}: ${px}px;`, `--container-${name}: ${px}px;`);
  }

  theme.push('');
  for (const [name, value] of entries(ease)) theme.push(`--ease-${name}: ${value};`);

  const utilities: string[] = [];
  for (const [name, role] of entries(type) as [string, TypeRole][]) {
    utilities.push(block(`@utility type-${name}`, typeDeclarations(name, role)));
  }
  for (const [name] of entries(duration)) {
    utilities.push(
      block(`@utility duration-${name}`, [
        `--tw-duration: var(--duration-${name});`,
        `transition-duration: var(--duration-${name});`,
      ]),
      block(`@utility animate-duration-${name}`, [`animation-duration: var(--duration-${name});`]),
    );
  }

  // `motion-ok:` is the only place motion goes: the OS allows it and the page has not opted out.
  const variant = [
    '@custom-variant motion-ok {',
    '  @media (prefers-reduced-motion: no-preference) {',
    "    :root:not([data-motion='reduce']) & {",
    '      @slot;',
    '    }',
    '  }',
    '}',
  ].join('\n');

  return `${HEADER}\n${block('@theme inline', theme)}\n\n${utilities.join('\n\n')}\n\n${variant}\n`;
}

/** `tokens.json`: plain values for code that cannot read CSS (three.js). */
export function toTokensJson(): string {
  return `${JSON.stringify(tokens, null, 2)}\n`;
}

export const generatedFiles = {
  'tokens.css': toTokensCss,
  'theme.css': toThemeCss,
  'tokens.json': toTokensJson,
} as const;
