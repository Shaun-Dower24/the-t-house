"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Waveform } from "@/components/ui/waveform";

function hash(index: number, seed: number) {
  const value = Math.sin(index * 12.9898 + seed * 78.233) * 43758.5453;
  return value - Math.floor(value);
}

function speechLevel(seconds: number, seed: number) {
  const phase = seconds * 4.2 + seed;
  const syllable = Math.floor(phase);
  const syllablePosition = phase - syllable;
  const pulse = Math.sin(syllablePosition * Math.PI) ** 1.5;
  const emphasis = 0.4 + 0.6 * hash(syllable, seed);
  const phrase = 0.75 + 0.25 * Math.sin(seconds * 0.9 + seed);

  return hash(syllable + 5, seed) < 0.17 ? 0.03 : 0.03 + 0.87 * pulse * emphasis * phrase;
}

const getBarLevel = () => speechLevel(performance.now() / 1000, 3);
const getLineLevel = () => speechLevel(performance.now() / 1000, 7);
const recordedPeaks = Array.from({ length: 96 }, (_, index) => speechLevel(index / 12, 2));

export default function WaveformDemo() {
  const [active, setActive] = useState(true);
  const [position, setPosition] = useState(40);

  return (
    <section className="mx-auto grid w-full max-w-2xl gap-5 bg-[var(--surface)] p-4 text-[var(--sign-white)] sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">Simulated audio</h2>
        <Button type="button" variant="outline" size="sm" onClick={() => setActive((previous) => !previous)}>
          {active ? "Pause live preview" : "Resume live preview"}
        </Button>
      </div>

      <div className="grid min-w-0 gap-3 sm:grid-cols-2">
        <div className="min-w-0 rounded-md border border-[var(--line)] bg-[var(--canvas)] p-3">
          <h3 className="text-sm text-[var(--muted-text)]">Live bars</h3>
          <Waveform
            level={getBarLevel}
            active={active}
            label="Simulated live bars"
            className="mt-2 h-12 w-full text-[var(--signature-red)]"
          />
        </div>
        <div className="min-w-0 rounded-md border border-[var(--line)] bg-[var(--canvas)] p-3">
          <h3 className="text-sm text-[var(--muted-text)]">Live line</h3>
          <Waveform
            variant="line"
            level={getLineLevel}
            active={active}
            label="Simulated live line"
            className="mt-2 h-12 w-full"
          />
        </div>
      </div>

      <div className="min-w-0 rounded-md border border-[var(--line)] bg-[var(--canvas)] p-3">
        <h3 className="text-sm text-[var(--muted-text)]">Recorded peaks</h3>
        <Waveform peaks={recordedPeaks} progress={position / 100} className="mt-2 h-12 w-full" />
        <label className="mt-2 grid gap-1 text-sm">
          <span>Playback position <span aria-hidden="true" className="tabular-nums">{position}%</span></span>
          <input
            type="range"
            min={0}
            max={100}
            value={position}
            aria-valuetext={`${position}%`}
            onChange={(event) => setPosition(event.currentTarget.valueAsNumber)}
            className="w-full accent-[var(--signature-red)]"
          />
        </label>
      </div>
    </section>
  );
}
