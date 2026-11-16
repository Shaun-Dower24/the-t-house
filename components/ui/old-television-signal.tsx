"use client";

import { shaderMaterial } from "@react-three/drei/core/shaderMaterial.js";
import { extend, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef, type RefObject } from "react";
import { Color, Vector2 } from "three";

interface OldTelevisionSignalProps {
  pointer: RefObject<{ x: number; y: number }>;
}

const WaveShaderMaterial = shaderMaterial({
  uTime: 0,
  uPointer: new Vector2(),
  uLight: new Color("white"),
  uDark: new Color("black"),
}, `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`, `
  uniform float uTime;
  uniform vec2 uPointer;
  uniform vec3 uLight;
  uniform vec3 uDark;
  varying vec2 vUv;

  float hash(vec2 cell) {
    vec3 p = fract(cell.xyx * 0.1031);
    p += dot(p, p.yzx + 33.33);
    return fract((p.x + p.y) * p.z);
  }

  float smoothNoise(vec2 point) {
    vec2 cell = floor(point);
    vec2 weight = fract(point);
    weight = weight * weight * (3.0 - 2.0 * weight);
    return mix(
      mix(hash(cell), hash(cell + vec2(1.0, 0.0)), weight.x),
      mix(hash(cell + vec2(0.0, 1.0)), hash(cell + vec2(1.0, 1.0)), weight.x),
      weight.y
    );
  }

  void main() {
    vec2 st = vUv + uPointer * 0.12;
    float waveX = sin(st.x * 8.0 + uTime * 0.9) * 0.1;
    float waveY = sin(st.y * 6.0 + uTime * 0.7) * 0.1;
    float waveDiagonal = sin((st.x + st.y) * 4.0 + uTime * 1.2) * 0.05;
    float waves = waveX + waveY + waveDiagonal;

    float broadNoise = smoothNoise(st * 3.0 + vec2(uTime * 0.15, uTime * 0.08));
    float fineNoise = smoothNoise(st * 7.0 - vec2(uTime * 0.08, 0.0));
    float noise = mix(broadNoise, fineNoise, 0.32);
    float ripple = sin(st.y * 14.0 + waves * 18.0 + uTime * 0.62);
    float level = smoothstep(0.15, 0.93, 0.53 + waves * 1.6 + (noise - 0.5) * 0.32 + ripple * 0.09);
    float grain = (hash(floor(gl_FragCoord.xy) + floor(uTime * 14.0)) - 0.5) * 0.028;

    float fade = 1.0 - smoothstep(0.23, 0.74, length((vUv - 0.5) * vec2(1.0, 1.1)));
    float shade = mix(0.6, 1.0, smoothstep(0.2, 0.63, vUv.x));
    vec3 color = mix(uDark, uLight, level);
    gl_FragColor = vec4(color, (0.06 + level * 0.17 + grain) * fade * shade);
    #include <colorspace_fragment>
  }
`);

const WaveMaterial = extend(WaveShaderMaterial);

export function OldTelevisionSignal({ pointer }: OldTelevisionSignalProps) {
  const materialRef = useRef<InstanceType<typeof WaveShaderMaterial>>(null);
  const canvas = useThree((state) => state.gl.domElement);

  useEffect(() => {
    const material = materialRef.current;
    if (!material) return;

    const palette = getComputedStyle(canvas);
    const light = palette.getPropertyValue("--sign-white").trim();
    const dark = palette.getPropertyValue("--canvas").trim();
    if (light) material.uLight.setStyle(light);
    if (dark) material.uDark.setStyle(dark);
  }, [canvas]);

  useFrame(({ clock }, delta) => {
    const material = materialRef.current;
    if (!material) return;

    const cursor = material.uPointer;
    const drift = 1 - Math.exp(-5 * delta);
    cursor.x += (pointer.current.x - cursor.x) * drift;
    cursor.y += (pointer.current.y - cursor.y) * drift;
    material.uTime = clock.elapsedTime;
  });

  return (
    <mesh frustumCulled={false}>
      <planeGeometry args={[2, 2]} />
      <WaveMaterial ref={materialRef} depthTest={false} depthWrite={false} toneMapped={false} transparent />
    </mesh>
  );
}
