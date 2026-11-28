import type { Bird } from './gardenMath';
import { MAX_BIRDS } from './gardenMath';
import { FRAGMENT_SHADER, VERTEX_SHADER } from './gardenShader';

/** The render the scene and its masks were drawn against. */
const RENDER = { width: 2688, height: 1520 } as const;

export interface GardenRenderer {
  /** Uploads (or replaces) the scene image: the wide render or the tall left half. */
  setImage: (img: HTMLImageElement) => void;
  /** Sets the canvas's backing size. */
  resize: (width: number, height: number) => void;
  /** Draws one frame `seconds` in, with the motion at `amp` (0..1) and these birds. */
  draw: (seconds: number, amp: number, birds: readonly Bird[]) => void;
  /** Frees everything, and lets the context go. */
  dispose: () => void;
}

function compile(gl: WebGL2RenderingContext, type: number, source: string): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS) && !gl.isContextLost()) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

/**
 * The garden's renderer on a WebGL2 context: one program, two textures (the scene and its masks),
 * one triangle. Returns null if anything is missing, so the caller can keep the plain image.
 */
export function createGardenRenderer(
  gl: WebGL2RenderingContext,
  masks: HTMLImageElement,
): GardenRenderer | null {
  const vs = compile(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
  const fs = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
  const program = gl.createProgram();
  if (!vs || !fs || !program) return null;
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  gl.deleteShader(vs);
  gl.deleteShader(fs);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    gl.deleteProgram(program);
    return null;
  }
  gl.useProgram(program);

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const aPos = gl.getAttribLocation(program, 'aPos');
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  const u = (name: string) => gl.getUniformLocation(program, name);
  const uniforms = {
    image: u('uImage'),
    mask: u('uMask'),
    imgPx: u('uImgPx'),
    maskScale: u('uMaskScale'),
    time: u('uTime'),
    amp: u('uAmp'),
    px: u('uPx'),
    texel: u('uTexel'),
    birds: u('uBirds'),
    birdAlpha: u('uBirdAlpha'),
    birdCount: u('uBirdCount'),
  };

  // The masks are data, not colour: read exactly as stored, no colour management.
  const maskTex = gl.createTexture();
  gl.activeTexture(gl.TEXTURE1);
  gl.bindTexture(gl.TEXTURE_2D, maskTex);
  gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, gl.NONE);
  gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, masks);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.uniform1i(uniforms.mask, 1);

  // The scene: colour managed as the page shows it. The shader filters it (see `gardenShader.ts`).
  const imageTex = gl.createTexture();
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, imageTex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.uniform1i(uniforms.image, 0);

  let imgPx: [number, number] = [RENDER.width, RENDER.height];
  const birdData = new Float32Array(MAX_BIRDS * 4);
  const birdAlpha = new Float32Array(MAX_BIRDS);

  return {
    setImage: (img) => {
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, imageTex);
      gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, gl.BROWSER_DEFAULT_WEBGL);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      // The tall image is the render's left half at full height; the wide one is all of it.
      const tall = img.naturalWidth < img.naturalHeight;
      imgPx = tall
        ? [RENDER.height * (img.naturalWidth / img.naturalHeight), RENDER.height]
        : [RENDER.width, RENDER.height];
      gl.uniform2f(uniforms.imgPx, imgPx[0], imgPx[1]);
      gl.uniform2f(uniforms.maskScale, imgPx[0] / RENDER.width, 1);
    },
    resize: (width, height) => {
      gl.viewport(0, 0, width, height);
      gl.uniform1f(uniforms.px, imgPx[0] / Math.max(1, width));
      gl.uniform2f(uniforms.texel, 1 / Math.max(1, width), 1 / Math.max(1, height));
    },
    draw: (seconds, amp, birds) => {
      gl.uniform1f(uniforms.time, seconds);
      gl.uniform1f(uniforms.amp, amp);
      const n = Math.min(MAX_BIRDS, birds.length);
      for (let i = 0; i < n; i += 1) {
        const b = birds[i]!;
        birdData.set([b.x, b.y, b.span, b.wing], i * 4);
        birdAlpha[i] = b.alpha;
      }
      gl.uniform4fv(uniforms.birds, birdData);
      gl.uniform1fv(uniforms.birdAlpha, birdAlpha);
      gl.uniform1i(uniforms.birdCount, n);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    },
    dispose: () => {
      gl.deleteTexture(imageTex);
      gl.deleteTexture(maskTex);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    },
  };
}
