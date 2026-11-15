"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, type RefObject } from "react";
import { Color, Vector2, type ShaderMaterial } from "three";
import { OldTelevisionSignal } from "./old-television-signal";

export type HeroSignal = "vhs" | "old-television";

interface SignalProps {
  pointer: RefObject<{ x: number; y: number }>;
}

interface VhsHeroSceneProps extends SignalProps {
  signal: HeroSignal;
}

const vertexShader = `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const fragmentShader = `
  uniform float uTime;
  uniform vec2 uPointer;
  uniform vec3 uRed;
  uniform vec3 uWhite;
  varying vec2 vUv;

  float hash(vec2 cell) {
    vec3 p = fract(vec3(cell.xyx) * 0.1031);
    p += dot(p, p.yzx + 33.33);
    return fract((p.x + p.y) * p.z);
  }

  float noise(vec2 point) {
    vec2 cell = floor(point);
    vec2 blend = fract(point);
    blend = blend * blend * (3.0 - 2.0 * blend);
    return mix(
      mix(hash(cell), hash(cell + vec2(1.0, 0.0)), blend.x),
      mix(hash(cell + vec2(0.0, 1.0)), hash(cell + vec2(1.0, 1.0)), blend.x),
      blend.y
    );
  }

  void main() {
    vec2 uv = vUv;

    // A soft tracking band crosses the signal once per tape cycle.
    float phase = fract(uTime / 9.0);
    float window = smoothstep(0.5, 0.58, phase) * (1.0 - smoothstep(0.74, 0.82, phase));
    float bandPosition = mix(0.12, 0.87, smoothstep(0.5, 0.82, phase));
    float tracking = (1.0 - smoothstep(0.003, 0.035, abs(uv.y - bandPosition))) * window;
    uv.x += sin(uv.y * 18.0 + uTime * 0.7) * 0.007 + tracking * 0.022;

    float field = noise(uv * vec2(5.0, 7.0) + vec2(uTime * 0.043, 0.0));
    float smear = noise(uv * vec2(3.0, 23.0) + vec2(field * 1.15, uTime * 0.12));
    float snow = hash(floor(gl_FragCoord.xy * 0.8) + floor(uTime * 18.0));
    float scanline = 1.0 - smoothstep(0.22, 0.62, fract(gl_FragCoord.y * 0.25));
    float pointerGlow = 1.0 - smoothstep(0.08, 0.5, distance(uv, uPointer * 0.5 + 0.5));
    float redSignal = smoothstep(0.46, 0.88, field * 0.7 + smear * 0.3 + pointerGlow * 0.09);
    float whiteSignal = scanline * 0.019 + snow * 0.036 + tracking * 0.038;

    // Dimming across the perimeter keeps the texture behind the content.
    float fade = 1.0 - smoothstep(0.28, 0.72, length((vUv - 0.5) * vec2(1.0, 1.13)));
    float redAmount = redSignal * 0.18;
    float signal = redAmount + whiteSignal;
    vec3 color = mix(uWhite, uRed, redAmount / max(signal, 0.001));
    gl_FragColor = vec4(color, min(signal * fade, 0.23));
    #include <colorspace_fragment>
  }
`;

function ContextRecovery() {
  const canvas = useThree((state) => state.gl.domElement);
  const setFrameloop = useThree((state) => state.setFrameloop);

  useEffect(() => {
    function onContextLost() {
      canvas.style.visibility = "hidden";
      setFrameloop("never");
    }

    function onContextRestored() {
      canvas.style.visibility = "";
      setFrameloop("always");
    }

    canvas.addEventListener("webglcontextlost", onContextLost);
    canvas.addEventListener("webglcontextrestored", onContextRestored);
    return () => {
      canvas.removeEventListener("webglcontextlost", onContextLost);
      canvas.removeEventListener("webglcontextrestored", onContextRestored);
    };
  }, [canvas, setFrameloop]);

  return null;
}

function TapeSignal({ pointer }: SignalProps) {
  const materialRef = useRef<ShaderMaterial>(null);
  const canvas = useThree((state) => state.gl.domElement);
  const uniforms = useMemo(() => {
    const palette = getComputedStyle(canvas);
    return {
      uTime: { value: 0 },
      uPointer: { value: new Vector2() },
      uRed: { value: new Color(palette.getPropertyValue("--signature-red").trim()) },
      uWhite: { value: new Color(palette.getPropertyValue("--sign-white").trim()) },
    };
  }, [canvas]);

  useFrame(({ clock }, delta) => {
    const values = materialRef.current?.uniforms as typeof uniforms | undefined;
    if (!values) return;

    const cursor = values.uPointer.value;
    const drift = 1 - Math.exp(-5 * delta);
    cursor.x += (pointer.current.x - cursor.x) * drift;
    cursor.y += (pointer.current.y - cursor.y) * drift;
    values.uTime.value = clock.elapsedTime;
  });

  return (
    <mesh frustumCulled={false}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={materialRef}
        depthTest={false}
        depthWrite={false}
        fragmentShader={fragmentShader}
        toneMapped={false}
        transparent
        uniforms={uniforms}
        vertexShader={vertexShader}
      />
    </mesh>
  );
}

export default function VhsHeroScene({ pointer, signal }: VhsHeroSceneProps) {
  return (
    <Canvas
      dpr={1}
      fallback={null}
      gl={{ alpha: true, antialias: false, powerPreference: "low-power" }}
      style={{ pointerEvents: "none" }}
    >
      <ContextRecovery />
      {signal === "old-television" ? <OldTelevisionSignal pointer={pointer} /> : <TapeSignal pointer={pointer} />}
    </Canvas>
  );
}
