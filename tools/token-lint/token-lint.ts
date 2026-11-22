/**
 * Token lint for `packages/ui`: components take colour and timing from tokens, never literals.
 *
 * Rules
 * - `literal-colour`: no hex colours, `rgb()`/`rgba()`/`hsl()`/`hsla()` literals.
 * - `raw-duration`: no literal durations (`.4s`, `400ms`). `0s` and `0ms` are allowed.
 * - `signal-with-ember`: Signal and Ember never appear in the same component file.
 *
 * Opt out of one line with a `token-lint-ignore` comment on it, with a reason.
 */

export type RuleId = 'literal-colour' | 'raw-duration' | 'signal-with-ember';

export interface Finding {
  file: string;
  line: number;
  rule: RuleId;
  text: string;
  message: string;
}

const IGNORE = 'token-lint-ignore';

const HEX = /#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})(?![0-9a-zA-Z_-])/g;
// A colour function with a literal first channel; `rgb(from var(...))` and `rgb(var(...))` pass.
const COLOUR_FUNCTION = /\b(?:rgb|rgba|hsl|hsla|oklch|oklab|lab|lch)\(\s*[\d.]/g;
const DURATION = /(?<![\w.#-])(\d*\.?\d+)(ms|s)(?![\w-])/g;
// Tailwind's numeric duration utilities (`duration-300`) are raw durations too.
const DURATION_UTILITY = /(?<![\w-])(?:duration|delay)-(?!0\b)\d+\b/g;
const ACCENT = (name: string) =>
  new RegExp(
    `(?:--palette-|--status-|\\b(?:bg|text|border|outline|ring|fill|stroke|shadow|decoration|from|to|via)-)${name}\\b`,
  );

/** In TS/TSX, hex colours and durations only count inside string or template literals. */
function codeStrings(line: string): string {
  const parts = line.match(/'(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"|`(?:[^`\\]|\\.)*`?/g);
  return parts ? parts.join(' ') : '';
}

export function lintSource(file: string, source: string): Finding[] {
  const findings: Finding[] = [];
  const isCss = file.endsWith('.css');
  const lines = source.split('\n');
  let signalLine = 0;
  let emberLine = 0;

  lines.forEach((raw, index) => {
    const line = index + 1;
    if (raw.includes(IGNORE)) return;
    const text = isCss ? raw : codeStrings(raw);

    for (const match of text.matchAll(HEX)) {
      // An id selector or anchor (`#main`) is not a colour.
      if (!isCss && /^#[a-zA-Z-]+$/.test(match[0]) && !/^#[0-9a-fA-F]+$/.test(match[0])) continue;
      findings.push({
        file,
        line,
        rule: 'literal-colour',
        text: match[0],
        message: 'Use a colour token (a Tailwind colour utility or var(--…)), not a hex value.',
      });
    }
    for (const match of text.matchAll(COLOUR_FUNCTION)) {
      findings.push({
        file,
        line,
        rule: 'literal-colour',
        text: `${match[0]}…`,
        message: 'Use a colour token, not a literal colour function.',
      });
    }
    for (const match of text.matchAll(DURATION)) {
      if (Number(match[1]) === 0) continue;
      findings.push({
        file,
        line,
        rule: 'raw-duration',
        text: match[0],
        message:
          'Use a motion token (duration-<name> or var(--duration-<name>)), not a raw duration.',
      });
    }

    for (const match of text.matchAll(DURATION_UTILITY)) {
      findings.push({
        file,
        line,
        rule: 'raw-duration',
        text: match[0],
        message: 'Use a motion token utility (duration-<name>), not a numeric duration.',
      });
    }

    if (!signalLine && ACCENT('signal').test(raw)) signalLine = line;
    if (!emberLine && ACCENT('ember').test(raw)) emberLine = line;
  });

  if (signalLine && emberLine && !/\.stories\.tsx?$/.test(file)) {
    findings.push({
      file,
      line: Math.max(signalLine, emberLine),
      rule: 'signal-with-ember',
      text: 'signal + ember',
      message:
        'Signal and Ember never appear in the same component. Use the semantic status tokens (status-build, status-live) if this is a status.',
    });
  }

  return findings;
}

export const LINTED_FILE = /\.(css|ts|tsx)$/;
export const SKIPPED_FILE = /\.(test|spec)\.tsx?$|\.d\.ts$/;
