/**
 * The garden's one full-screen pass (WebGL2, GLSL ES 3.00). It draws the scene image with every
 * motion as a small change of where each pixel is read from, so nothing is painted over it except
 * the faint light, the mist and the far birds:
 *
 * - Water: the reflection is displaced by the slope of a gentle wave field that lives on the pond's
 *   plane and is projected to the screen, so ripples are larger and slower in front, finer toward
 *   the horizon, and stretched sideways as on real still water. Wavelengths too small to draw are
 *   faded out rather than aliased. Masked to the open surface (mask R).
 * - Pads and floating leaves bob on the long waves only, each where it floats (mask B).
 * - Foliage: one breeze, a gust field travelling left to right across the scene, so trees stir in
 *   turn; each point moves as far as the mask says it is free (mask G: zero on trunks, rocks and
 *   the portal, most at wisteria and bamboo tips).
 * - Light: the sun's glow and rays breathe very slightly. Mist drifts along the far shore.
 * - Birds: a few far silhouettes with a wingbeat (positions from `gardenMath.ts`).
 *
 * All positions are in the pixels of the full render (2688 by 1520). `uAmp` eases everything in
 * from zero, so the first frame is the still image.
 */
export const VERTEX_SHADER = /* glsl */ `#version 300 es
in vec2 aPos;
out vec2 vUv;
void main() {
  // One triangle that covers the canvas; uv (0,0) is the image's top-left.
  vUv = vec2(aPos.x * 0.5 + 0.5, 0.5 - aPos.y * 0.5);
  gl_Position = vec4(aPos, 0.0, 1.0);
}`;

export const FRAGMENT_SHADER = /* glsl */ `#version 300 es
precision highp float;

uniform sampler2D uImage;
uniform sampler2D uMask;
uniform vec2 uImgPx;      // render pixels this image covers (the whole render, or its left half)
uniform vec2 uMaskScale;  // image uv to mask uv
uniform float uTime;      // seconds
uniform float uAmp;       // 0..1: the ease-in
uniform float uPx;        // render pixels per canvas pixel
uniform vec2 uTexel;      // one canvas pixel, in image uv
uniform vec4 uBirds[5];   // x, y, wingspan (render px), wing angle
uniform float uBirdAlpha[5];
uniform int uBirdCount;

in vec2 vUv;
out vec4 outColor;

const float HORIZON = 792.0;          // the pond's horizon line, render px
const vec2 SUN = vec2(1765.0, 565.0); // the sun, behind the trees on the right

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}

// ---- Water ---------------------------------------------------------------------------------------

// The slope of the water at render point p, in world units on the pond's plane, and how much of
// it is long swell (for the floating things). X runs across, Z away from the viewer (1 = the
// foreground). Screen pixels per world unit: h across, h*h/730 in depth.
vec2 waterSlope(vec2 p, float t, out vec2 swell, out float crest) {
  float h = max(p.y - HORIZON, 2.0);
  vec2 W = vec2((p.x - 1344.0) / h, 730.0 / h);
  float across = h / uPx;              // canvas px per world unit, across
  float depth = h * h / 730.0 / uPx;   // canvas px per world unit, in depth

  // Four slow waves, mostly toward the viewer, at a few angles: wavelength (world), period (s),
  // steepness (slope), direction.
  vec2 g = vec2(0.0);
  swell = vec2(0.0);
  crest = 0.0;
  const int N = 4;
  vec4 waves[N] = vec4[N](
    vec4(0.060, 4.2, 0.55, 0.22),
    vec4(0.036, 3.1, 0.38, -0.38),
    vec4(0.022, 2.4, 0.26, 0.62),
    vec4(0.013, 1.8, 0.18, -0.12)
  );
  float phases[N] = float[N](0.0, 1.7, 4.1, 2.6);
  // Patches of slightly livelier water drifting across, like faint cat's paws.
  float patchy = 0.55 + 0.45 * noise(W * vec2(5.0, 2.6) + vec2(t * 0.021, -t * 0.034));
  for (int i = 0; i < N; i++) {
    vec4 w = waves[i];
    vec2 dir = normalize(vec2(w.w, 1.0));
    float k = 6.2831853 / w.x;
    float ph = dot(dir * k, W) + 6.2831853 * t / w.y + phases[i];
    // How many canvas pixels one wavelength covers on screen: fade out what cannot be drawn.
    float onScreen = w.x * min(across / max(abs(dir.x), 0.2), depth / max(abs(dir.y), 0.2));
    float drawable = smoothstep(2.5, 7.0, onScreen);
    float c = cos(ph);
    g += dir * (w.z * c * drawable);
    if (i < 2) swell += dir * (w.z * c);
    crest += max(0.0, sin(ph)) * drawable * w.z;
  }
  g *= patchy;
  return g;
}

// ---- Foliage -------------------------------------------------------------------------------------

// One breeze crossing the scene from left to right: a soft gust field moving at about 150 render
// px a second. Each point leans downwind with the gust and flutters a little with it.
vec2 foliage(vec2 p, float t, float freedom) {
  float gust = noise(vec2((p.x - 150.0 * t) / 560.0, p.y / 760.0 + 3.1));
  gust = smoothstep(0.12, 0.88, gust);
  float lean = gust * 1.6 - 0.45;
  float f1 = noise(p / 36.0 + vec2(t * 1.05, t * 0.65)) - 0.5;
  float f2 = noise(p / 36.0 + vec2(-t * 0.8, t * 1.2) + 17.0) - 0.5;
  vec2 d = vec2(3.0 * lean, 0.35 * lean) + (0.35 + gust) * vec2(f1, f2) * 1.1;
  // The freest things (wisteria ends, bamboo tops) swing proportionally more than the pine.
  return d * freedom * (0.8 + 0.7 * freedom);
}

// ---- Birds ---------------------------------------------------------------------------------------

float seg(vec2 p, vec2 a, vec2 b) {
  vec2 pa = p - a;
  vec2 ba = b - a;
  float k = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
  return length(pa - ba * k);
}

// Coverage of one far bird: two bent wings from a small body. The wing angle raises and lowers
// the elbows and tips (screen y grows downward).
float bird(vec2 p, vec4 b) {
  vec2 q = p - b.xy;
  float s = b.z;
  if (abs(q.x) > s || abs(q.y) > s) return 0.0;
  float c = cos(b.w);
  float tipY = -0.30 * s * c;
  float elbowY = -0.12 * s * cos(b.w - 0.9);
  vec2 eL = vec2(-0.22 * s, elbowY);
  vec2 tL = vec2(-0.50 * s, tipY + 0.05 * s);
  vec2 eR = vec2(0.22 * s, elbowY);
  vec2 tR = vec2(0.50 * s, tipY);
  float d = min(min(seg(q, vec2(0.0), eL), seg(q, eL, tL)),
                min(seg(q, vec2(0.0), eR), seg(q, eR, tR)));
  d = min(d, length(q * vec2(0.9, 1.5)) - 0.08 * s);
  float half_ = 0.05 * s;
  float aa = 0.7 * uPx;
  return 1.0 - smoothstep(half_ - aa, half_ + aa, d);
}

void main() {
  vec2 p = vUv * uImgPx;
  vec3 m = texture(uMask, vUv * uMaskScale).rgb;
  float t = uTime;

  vec2 d = vec2(0.0);
  float crest = 0.0;
  float waterHere = m.r;
  if (m.r > 0.002 || m.b > 0.002) {
    vec2 swell;
    vec2 slope = waterSlope(p, t, swell, crest);
    float near = clamp((p.y - HORIZON) / 728.0, 0.0, 1.0);
    // Reflection displacement: up to ~2.4 render px in front, less far off; mostly sideways.
    float a = 2.4 * near;
    d += m.r * vec2(slope.x * a, slope.y * a * 0.55);
    // Pads ride the long swell under them: a slow drift and bob of a fraction of a pixel.
    float bobPhase = noise(p / 70.0) * 6.2831853;
    vec2 bob = vec2(swell.x * 0.7 + 0.18 * sin(t * 0.55 + bobPhase), swell.y * 0.35);
    d += m.b * bob * (0.9 + 1.1 * near);
  }
  if (m.g > 0.002) d += foliage(p, t, m.g);
  d *= uAmp;

  // The image, drawn the way the page scales it: the full-size level, averaged over the pixel's
  // footprint (four taps), rather than a blend with a half-size level, which is softer.
  vec2 uv = vUv + d / uImgPx;
  vec2 q = uTexel * 0.25;
  vec3 col = 0.25 * (textureLod(uImage, uv + vec2(-q.x, -q.y), 0.0).rgb
                   + textureLod(uImage, uv + vec2(q.x, -q.y), 0.0).rgb
                   + textureLod(uImage, uv + vec2(-q.x, q.y), 0.0).rgb
                   + textureLod(uImage, uv + vec2(q.x, q.y), 0.0).rgb);
  float lum = dot(col, vec3(0.2126, 0.7152, 0.0722));

  // A faint moving glint along the sun's path on the water, only where it is already bright.
  if (waterHere > 0.01) {
    float h = max(p.y - HORIZON, 1.0);
    float path = exp(-pow((p.x - SUN.x) / (14.0 + 0.16 * h), 2.0));
    float glint = path * waterHere * smoothstep(0.55, 0.9, lum) * smoothstep(0.2, 0.55, crest);
    col += vec3(1.0, 0.9, 0.72) * glint * 0.10 * uAmp;
  }

  // The sun breathes: its glow and rays through the trees swell and ease by a few percent.
  vec2 v = p - SUN;
  float r = length(v);
  if (r < 720.0) {
    float breathe = 0.6 + 0.25 * sin(t * 0.52) + 0.3 * (noise(vec2(t * 0.33, 1.7)) - 0.5);
    float glow = exp(-r * r / (2.0 * 150.0 * 150.0));
    // Rays only fall downward from the sun, through the trees, where the painting has them; the
    // angle is measured from straight down, so there is no seam where it wraps.
    float down = v.y / max(r, 1.0);
    float ray = noise(vec2(acos(clamp(v.x / max(r, 1.0), -1.0, 1.0)) * 15.0, t * 0.05));
    float rays = ray * ray * ray * exp(-r / 300.0) * smoothstep(40.0, 150.0, r)
               * smoothstep(0.15, 0.55, down);
    col += vec3(1.0, 0.86, 0.66) * (glow * 0.05 + rays * 0.06) * breathe * (0.25 + lum) * uAmp;
  }

  // Mist drifting slowly along the far shore.
  float band = smoothstep(672.0, 724.0, p.y) * (1.0 - smoothstep(772.0, 806.0, p.y))
             * smoothstep(880.0, 1010.0, p.x) * (1.0 - smoothstep(1640.0, 1760.0, p.x));
  if (band > 0.0) {
    float n = noise(vec2((p.x - t * 5.5) / 230.0, p.y / 46.0)) * 0.65
            + noise(vec2((p.x - t * 8.5) / 95.0, p.y / 26.0 + 4.0)) * 0.35;
    float mist = band * smoothstep(0.42, 0.82, n);
    col = mix(col, max(col, vec3(0.97, 0.86, 0.80)), mist * 0.12 * uAmp);
  }

  // The far flock: dark silhouettes, softened by the haze between here and them.
  for (int i = 0; i < 5; i++) {
    if (i >= uBirdCount) break;
    float cover = bird(p, uBirds[i]) * uBirdAlpha[i];
    if (cover > 0.0) {
      vec3 ink = mix(vec3(0.243, 0.188, 0.149), col, 0.32);
      col = mix(col, ink, cover * 0.9);
    }
  }

  outColor = vec4(col, 1.0);
}`;
