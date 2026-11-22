// Mobile budget check for the canopy stage: a phone-sized viewport with the CPU throttled 4x.
// Measures the frame rate through the grow-in and through opening a project, and checks that the
// stage renders nothing while idle, while off screen, and nothing but the final state under
// reduced motion.
//
//   pnpm storybook                        (or serve a `pnpm build-storybook` build)
//   pnpm --filter @cwc/canopy perf        CANOPY_URL=http://localhost:6006  GPU=swift  RATE=4
//
// GPU=swift uses SwiftShader (software GL, pessimistic); the default uses the machine's GPU.
import { chromium } from 'playwright';

const BASE = process.env.CANOPY_URL || 'http://localhost:6006';
const STORY = `${BASE}/iframe.html?id=sections-canopy--grow-in&viewMode=story`;
const RATE = Number(process.env.RATE || 4);
const swift = process.env.GPU === 'swift';
const MIN_FPS = 30;

const browser = await chromium.launch({
  args: swift
    ? ['--use-angle=swiftshader', '--enable-unsafe-swiftshader']
    : ['--enable-gpu', '--ignore-gpu-blocklist'],
});
const failures = [];
const check = (ok, message) => {
  if (!ok) failures.push(message);
};

async function run(label, opts = {}) {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
    reducedMotion: opts.reduced ? 'reduce' : 'no-preference',
  });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  const cdp = await context.newCDPSession(page);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: RATE });
  await page.addInitScript(() => {
    window.__raf = [];
    const raf = window.requestAnimationFrame.bind(window);
    window.requestAnimationFrame = (f) =>
      raf((t) => {
        window.__raf.push(t);
        f(t);
      });
  });
  if (opts.offscreen) {
    /* push the story far below the fold before it mounts */
    await page.addInitScript(() => {
      document.addEventListener('DOMContentLoaded', () => {
        const spacer = document.createElement('div');
        spacer.style.height = '2400px';
        document.body.insertBefore(spacer, document.body.firstChild);
      });
    });
  }
  await page.goto(STORY, { waitUntil: 'load' });
  await page.waitForFunction(() => !!window.__canopy, null, { timeout: 30000 });
  const perf = () => page.evaluate(() => window.__canopy.perf());
  const now = () => page.evaluate(() => performance.now());
  const fps = (from, to) =>
    page.evaluate(
      ([a, b]) => {
        const f = window.__raf.filter((t) => t >= a && t <= b);
        if (f.length < 2) return { frames: f.length, fps: 0 };
        const d = [];
        for (let i = 1; i < f.length; i++) d.push(f[i] - f[i - 1]);
        d.sort((x, y) => x - y);
        return {
          frames: f.length,
          fps: +((1000 * (f.length - 1)) / (f[f.length - 1] - f[0])).toFixed(1),
          p50ms: +d[Math.floor(d.length / 2)].toFixed(1),
          p95ms: +d[Math.floor(d.length * 0.95)].toFixed(1),
        };
      },
      [from, to],
    );

  const r = { label };
  const a0 = await now();
  await page.waitForTimeout(opts.offscreen ? 2500 : 6500);
  const a1 = await now();
  r.intro = await fps(a0, a1);
  r.after_intro = await perf();
  if (opts.offscreen) {
    r.rendered_while_offscreen = r.after_intro.rendered;
    check(
      r.rendered_while_offscreen === 0,
      `${label}: rendered ${r.rendered_while_offscreen} frames off screen`,
    );
    await page.evaluate(() => document.querySelector('[data-canopy]').scrollIntoView());
    await page.waitForTimeout(6500);
    r.after_scroll_in = await perf();
    check(r.after_scroll_in.rendered > 0, `${label}: nothing rendered after scrolling in`);
  }
  const i0 = (await perf()).rendered;
  await page.waitForTimeout(2000);
  r.idle_frames_rendered_in_2s = (await perf()).rendered - i0;
  check(
    r.idle_frames_rendered_in_2s === 0,
    `${label}: ${r.idle_frames_rendered_in_2s} frames rendered while idle`,
  );
  if (opts.reduced) {
    check(
      r.after_intro.rendered <= 3,
      `${label}: ${r.after_intro.rendered} frames for a still picture`,
    );
  } else if (!opts.offscreen) {
    const f0 = await now();
    await page.locator('button[data-id="duo-decide"]').click();
    await page.waitForTimeout(3500);
    r.focus = await fps(f0, await now());
    if (r.after_intro.mode === 'gl') {
      check(r.intro.fps >= MIN_FPS, `${label}: grow-in at ${r.intro.fps} fps`);
      check(r.focus.fps >= MIN_FPS, `${label}: opening a project at ${r.focus.fps} fps`);
    }
  }
  const final = await perf();
  r.final = { mode: final.mode, why: final.why, dpr: final.dpr, size: final.size, log: final.log };
  r.canvas_px = await page.evaluate(() => {
    const c = document.querySelector('[data-canopy] canvas');
    return c ? [c.width, c.height] : null;
  });
  r.errors = errors;
  check(errors.length === 0, `${label}: ${errors.length} console errors`);
  await context.close();
  return r;
}

const out = {
  gpu: swift ? 'swiftshader' : 'default',
  cpu_throttle: RATE,
  runs: [
    await run(`phone ${RATE}x CPU`),
    await run(`phone ${RATE}x CPU, reduced motion`, { reduced: true }),
    await run(`phone ${RATE}x CPU, starts off screen`, { offscreen: true }),
  ],
  failures,
};
console.log(JSON.stringify(out, null, 1));
await browser.close();
if (failures.length) process.exit(1);
