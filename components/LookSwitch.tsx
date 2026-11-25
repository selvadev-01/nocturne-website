"use client";

import { useRef } from "react";
import { looks, type LookId } from "@/content/data";
import { useNight } from "@/lib/providers";

/** Pick the conditions to ride in. One shared choice drives the journey film and the cabin views. */
export function LookSwitch({ label = "Ride it in", id }: { label?: string; id: string }) {
  const { look, setLook } = useNight();
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const onKey = (e: React.KeyboardEvent, i: number) => {
    let n = -1;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") n = (i + 1) % looks.length;
    if (e.key === "ArrowLeft" || e.key === "ArrowUp") n = (i - 1 + looks.length) % looks.length;
    if (n < 0) return;
    e.preventDefault();
    setLook(looks[n].id as LookId);
    refs.current[n]?.focus();
  };

  if (looks.length < 2) return null; // nothing to switch between yet

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
      <span id={`${id}-label`} className="font-mono text-xs uppercase tracking-[0.14em] text-fog">
        {label}
      </span>
      <div role="radiogroup" aria-labelledby={`${id}-label`} className="flex flex-wrap gap-1 rounded border border-rail bg-night/85 p-1">
        {looks.map((l, i) => {
          const on = l.id === look;
          return (
            <button
              key={l.id}
              ref={(el) => {
                refs.current[i] = el;
              }}
              type="button"
              role="radio"
              aria-checked={on}
              tabIndex={on ? 0 : -1}
              title={l.note}
              onClick={() => setLook(l.id)}
              onKeyDown={(e) => onKey(e, i)}
              className={`min-h-[40px] rounded-sm px-3 text-sm font-medium transition-colors ${
                on ? "bg-lamp text-night" : "text-paper/80 hover:bg-rail/60 hover:text-paper"
              }`}
            >
              {l.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
