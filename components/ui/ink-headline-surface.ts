/*!
 * @license MIT
 * Ink Headline by Ryan (@ryanonline1234).
 * https://21st.dev/@ryanonline1234/components/ink-headline
 * https://github.com/ryanonline1234/ease-atlas
 *
 * Copyright (c) 2026 Ryan (@ryanonline1234)
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

export const INK_MAX_UNITS = 64;
export const INK_HANDOFF = 0.9;

const vertexShader = `#version 300 es
in vec2 aPos;
out vec2 vUv;
void main() {
  vUv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}`;

// The upstream mask holds the heading's glyphs (r) and each word's unit
// index + 1 filled over its box (g). Per unit, an fbm field leaning on the
// position across the unit's span (reading order) is thresholded into a soaking
// front with a pooled band. Past the glyph, a mip-blurred copy of the mask with
// ragged noise is thresholded at a level that falls as the word wets, so the ink
// bleeds outward; the bleed's edge pools into a darker outline, and both fade as
// the ink dries, thinning toward the edge of the unit's tile. Output is premultiplied ink in the heading's color.
const fragmentShader = `#version 300 es
precision highp float;
precision highp int;
in vec2 vUv;
out vec4 fragColor;
uniform sampler2D uMask;
uniform vec2 uResolution;
uniform float uUnits[64];
uniform vec2 uSpan[64];
uniform vec4 uTile[64];
uniform float uFeather;
uniform float uBleed;
uniform float uNoiseScale;
uniform float uEm;
uniform float uLod;
uniform float uHandoff;
uniform vec3 uInk;

uint hashU(uvec2 p) {
  uint n = p.x * 1664525u ^ (p.y * 22695477u + 12345u);
  n ^= n >> 15u; n *= 2246822519u;
  n ^= n >> 13u; n *= 3266489917u;
  n ^= n >> 16u;
  return n;
}
float hash2(vec2 p) {
  ivec2 ip = ivec2(floor(p)) + 32768;
  return float(hashU(uvec2(ip))) / 4294967295.0;
}
float vnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash2(i), hash2(i + vec2(1.0, 0.0)), u.x), mix(hash2(i + vec2(0.0, 1.0)), hash2(i + vec2(1.0, 1.0)), u.x), u.y);
}
float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  mat2 m = mat2(0.8, 0.6, -0.6, 0.8);
  for (int i = 0; i < 4; i++) {
    v += a * vnoise(p);
    p = m * p * 2.03 + 11.7;
    a *= 0.5;
  }
  return v / 0.9375;
}

void main() {
  vec4 m0 = texelFetch(uMask, ivec2(vUv * uResolution), 0);
  float unit = floor(m0.g * 255.0 + 0.5);
  if (unit < 0.5 || unit > 64.0) { fragColor = vec4(0.0); return; }
  int k = int(unit) - 1;
  float p = uUnits[k];
  if (p <= 0.0 || p >= uHandoff) { fragColor = vec4(0.0); return; } // not started, or handed off to the text

  float glyph = m0.r;
  vec2 q = vUv * uResolution / uEm; // in ems, so the ink scales with the type
  float n = fbm(q * uNoiseScale + unit * 3.17);
  vec2 span = uSpan[k];
  float lean = clamp((vUv.x - span.x) / max(span.y - span.x, 1e-4), 0.0, 1.0);
  float f = mix(n, lean, 0.35); // soaks in roughly in reading order

  float w = max(uFeather, 0.01);
  // ink wicks ahead along paper fibers: thin curved strands from ridged noise
  vec2 fq = q * 9.0;
  float r1 = 1.0 - abs(2.0 * vnoise(vec2(fq.x * 3.0 + fq.y * 1.2, fq.y * 0.7 - fq.x * 0.3) + vnoise(fq * 1.7) * 1.5) - 1.0);
  float r2 = 1.0 - abs(2.0 * vnoise(vec2(fq.x * 0.6 - fq.y * 0.4 + 5.0, fq.y * 3.0 + fq.x * 0.9) + vnoise(fq * 1.3 + 9.0) * 1.5) - 1.0);
  float fib = pow(max(r1, r2), 14.0);

  // light ink means dark paper, where fibers read as sparks: keep them shorter there
  float dark = smoothstep(0.45, 0.75, dot(uInk, vec3(0.299, 0.587, 0.114)));
  float t = -w + (1.0 + 2.0 * w) * p;
  float front = 1.0 - smoothstep(t - w, t + w * 0.25, f - fib * w * mix(0.35, 0.15, dark));
  float band = smoothstep(t - w * 0.9, t, f) * (1.0 - smoothstep(t, t + w * 0.25, f));
  float settle = smoothstep(0.62, uHandoff, p); // solid by the handoff

  // in the letter: lighter while wet, darker where it pools at the front, solid once dry
  float wetTone = 0.8 + 0.15 * band + 0.06 * (vnoise(q * 40.0) - 0.5);
  float inLetter = glyph * front * mix(wetTone, 1.0, settle);

  // past the letter: the wet ink bleeds out into the paper and its spreading edge pools into a dark
  // outline; then the bleed and its outline fade as the ink dries, leaving the letter
  float soft = textureLod(uMask, vUv, uLod + 1.0).r; // blurred coverage: about 0.5 on the edge, falling away outside
  float rag = (fbm(q * 6.0 + unit * 1.3) - 0.5) * 0.22;
  float grow = 1.0 - pow(1.0 - clamp(p / 0.45, 0.0, 1.0), 2.0);
  float level = mix(0.48, 0.15, grow * uBleed);
  float s = soft + rag;
  float bled = smoothstep(level - 0.025, level + 0.025, s) * (1.0 - glyph);
  float rim = bled * (1.0 - smoothstep(level + 0.02, level + 0.11, s));
  float fade = smoothstep(0.0, 0.06, p) * (1.0 - smoothstep(0.45, 0.82, p));
  // thin out toward the edge of this word's tile, so a neighbour's tile never cuts the bleed off straight
  vec4 tile = uTile[k];
  vec2 px = vUv * uResolution;
  float edgeDist = min(min(px.x - tile.x, tile.z - px.x), min(px.y - tile.y, tile.w - px.y));
  float keep = smoothstep(0.0, uEm * 0.12, edgeDist);
  float outLetter = step(0.0001, uBleed) * (bled * 0.14 + rim * mix(0.62, 0.36, dark) + rim * fib * mix(0.25, 0.08, dark)) * front * fade * keep;

  float a = clamp(inLetter + outLetter, 0.0, 1.0);
  fragColor = vec4(uInk * a, a);
}`;


const uniformNames = [
  "uMask", "uResolution", "uUnits", "uSpan", "uTile", "uFeather",
  "uBleed", "uNoiseScale", "uEm", "uLod", "uHandoff", "uInk",
] as const;

type UniformName = (typeof uniformNames)[number];
type UniformLocations = Record<UniformName, WebGLUniformLocation | null>;

export interface DrawUniforms {
  units: Float32Array;
  /** Each unit's left and right edge as a fraction of the canvas width. */
  spans: Float32Array;
  /** Each unit's device-pixel bounds, with y increasing from the bottom. */
  tiles: Float32Array;
  feather: number;
  bleed: number;
  noiseScale: number;
  em: number;
  lod: number;
  ink: [number, number, number];
}

interface Resources {
  gl: WebGL2RenderingContext;
  program: WebGLProgram;
  vertices: WebGLVertexArrayObject;
  uniforms: UniformLocations;
  sizeLimit: number;
}

interface MaskTexture {
  texture: WebGLTexture;
  width: number;
  height: number;
}

function compileShader(gl: WebGL2RenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;

  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return shader;

  gl.deleteShader(shader);
  return null;
}

function linkProgram(gl: WebGL2RenderingContext) {
  const vertex = compileShader(gl, gl.VERTEX_SHADER, vertexShader);
  if (!vertex) return null;

  const fragment = compileShader(gl, gl.FRAGMENT_SHADER, fragmentShader);
  const program = fragment ? gl.createProgram() : null;
  if (program && fragment) {
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
  }
  gl.deleteShader(vertex);
  gl.deleteShader(fragment);

  if (!program) return null;
  if (gl.getProgramParameter(program, gl.LINK_STATUS)) return program;

  gl.deleteProgram(program);
  return null;
}

function initialize(canvas: HTMLCanvasElement): Resources | null {
  let gl: WebGL2RenderingContext | null;
  try {
    gl = canvas.getContext("webgl2", {
      alpha: true,
      antialias: false,
      premultipliedAlpha: true,
      preserveDrawingBuffer: true,
      powerPreference: "low-power",
    });
  } catch {
    return null;
  }
  if (!gl || gl.isContextLost()) return null;

  const program = linkProgram(gl);
  if (!program) return null;

  const vertices = gl.createVertexArray();
  const buffer = gl.createBuffer();
  const position = gl.getAttribLocation(program, "aPos");
  const uniforms = Object.fromEntries(
    uniformNames.map((name) => [name, gl.getUniformLocation(program, name)]),
  ) as UniformLocations;

  let ready = false;
  try {
    if (!vertices || !buffer || position < 0 || Object.values(uniforms).includes(null)) return null;

    gl.useProgram(program);
    gl.bindVertexArray(vertices);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
    gl.uniform1i(uniforms.uMask, 0);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
    // The mask stores indices and coverage in its color channels.
    gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, gl.NONE);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, 0);
    gl.enable(gl.SCISSOR_TEST);

    const sizeLimit = Math.min(4096, gl.getParameter(gl.MAX_TEXTURE_SIZE), gl.getParameter(gl.MAX_RENDERBUFFER_SIZE));
    if (sizeLimit < 1 || gl.getError() !== gl.NO_ERROR || gl.isContextLost()) return null;

    ready = true;
    return { gl, program, vertices, uniforms, sizeLimit };
  } finally {
    if (!ready) {
      gl.deleteVertexArray(vertices);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
    }
  }
}

/** One detached WebGL canvas renders into the top-left rectangle copied by each heading. */
export class InkSurface {
  private readonly canvas = document.createElement("canvas");
  private readonly textures = new Map<number, MaskTexture>();
  private readonly lostCallbacks = new Map<number, () => void>();
  private resources: Resources | null;

  constructor() {
    this.canvas.width = 2;
    this.canvas.height = 2;
    this.canvas.addEventListener("webglcontextlost", this.onLost);
    this.canvas.addEventListener("webglcontextrestored", this.onRestored);
    this.resources = initialize(this.canvas);
  }

  get available() {
    return this.resources !== null && !this.resources.gl.isContextLost();
  }

  private onLost = (event: Event) => {
    event.preventDefault();
    this.resources = null;
    this.textures.clear();

    const callbacks = [...this.lostCallbacks.values()];
    this.lostCallbacks.clear();
    for (const notify of callbacks) {
      try {
        notify();
      } catch (error) {
        console.error("Ink Headline fallback failed", error);
      }
    }
  };

  private onRestored = () => {
    this.resources = initialize(this.canvas);
  };

  register(id: number, onLost: () => void) {
    if (this.available) this.lostCallbacks.set(id, onLost);
    else onLost();
  }

  upload(id: number, mask: HTMLCanvasElement): boolean {
    const resources = this.resources;
    if (!resources || !this.available) return false;

    const { gl, sizeLimit } = resources;
    const { width, height } = mask;
    if (width < 1 || height < 1 || width > sizeLimit || height > sizeLimit) return false;

    const previous = this.textures.get(id);
    const texture = previous?.texture ?? gl.createTexture();
    if (!texture) return false;

    try {
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      if (!previous) {
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      }
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, mask);
      gl.generateMipmap(gl.TEXTURE_2D);
      if (gl.getError() === gl.NO_ERROR && !gl.isContextLost()) {
        this.textures.set(id, { texture, width, height });
        return true;
      }
    } catch {
      // An unreadable source can throw before WebGL reports an error.
    }

    gl.deleteTexture(texture);
    this.textures.delete(id);
    return false;
  }

  forget(id: number) {
    const mask = this.textures.get(id);
    if (mask && this.resources) this.resources.gl.deleteTexture(mask.texture);
    this.textures.delete(id);
    this.lostCallbacks.delete(id);
  }

  draw(id: number, target: CanvasRenderingContext2D, width: number, height: number, u: DrawUniforms): boolean {
    const resources = this.resources;
    const mask = this.textures.get(id);
    if (!resources || !mask || !this.available || width !== mask.width || height !== mask.height) return false;
    if (u.units.length !== INK_MAX_UNITS || u.spans.length !== INK_MAX_UNITS * 2
      || u.tiles.length !== INK_MAX_UNITS * 4 || !Number.isFinite(u.em) || u.em <= 0) return false;

    const { gl, program, vertices, uniforms } = resources;
    const canvas = this.canvas;
    // Keep the largest allocation and use its upper-left rectangle for smaller headings.
    if (canvas.width < width) canvas.width = width;
    if (canvas.height < height) canvas.height = height;
    if (gl.drawingBufferWidth !== canvas.width || gl.drawingBufferHeight !== canvas.height) return false;

    const y = canvas.height - height;
    gl.useProgram(program);
    gl.bindVertexArray(vertices);
    gl.viewport(0, y, width, height);
    gl.scissor(0, y, width, height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, mask.texture);
    gl.uniform2f(uniforms.uResolution, width, height);
    gl.uniform1fv(uniforms.uUnits, u.units);
    gl.uniform2fv(uniforms.uSpan, u.spans);
    gl.uniform4fv(uniforms.uTile, u.tiles);
    gl.uniform1f(uniforms.uFeather, u.feather);
    gl.uniform1f(uniforms.uBleed, u.bleed);
    gl.uniform1f(uniforms.uNoiseScale, u.noiseScale);
    gl.uniform1f(uniforms.uEm, u.em);
    gl.uniform1f(uniforms.uLod, u.lod);
    gl.uniform1f(uniforms.uHandoff, INK_HANDOFF);
    gl.uniform3f(uniforms.uInk, ...u.ink);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    if (gl.getError() !== gl.NO_ERROR || gl.isContextLost()) return false;

    try {
      target.clearRect(0, 0, width, height);
      target.drawImage(canvas, 0, 0, width, height, 0, 0, width, height);
      return !gl.isContextLost();
    } catch {
      return false;
    }
  }
}

let surface: InkSurface | null = null;

export function getSurface(): InkSurface | null {
  if (typeof document === "undefined") return null;
  surface ??= new InkSurface();
  return surface.available ? surface : null;
}
