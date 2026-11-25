"use client";

import { useRef } from "react";
import { Check } from "@phosphor-icons/react";
import { cabins, cabinImg, eur, looks, type CabinId } from "@/content/data";
import { useNight } from "@/lib/providers";
import { LookSwitch } from "@/components/LookSwitch";

/** One carriage, three zones: a side view you click into, not three equal cards. */
export function Cabins() {
  const { cabin, setCabin, look } = useNight();
  const lookLabel = looks.find((l) => l.id === look)?.label ?? "";
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const idx = cabins.findIndex((c) => c.id === cabin);
  const c = cabins[idx];

  const onKey = (e: React.KeyboardEvent, i: number) => {
    let n = -1;
    if (e.key === "ArrowRight") n = (i + 1) % cabins.length;
    if (e.key === "ArrowLeft") n = (i - 1 + cabins.length) % cabins.length;
    if (e.key === "Home") n = 0;
    if (e.key === "End") n = cabins.length - 1;
    if (n < 0) return;
    e.preventDefault();
    setCabin(cabins[n].id as CabinId);
    tabs.current[n]?.focus();
  };

  return (
    <section id="cabins" aria-labelledby="cabins-h" className="mx-auto max-w-[1400px] px-4 py-24 md:px-8 md:py-32">
      <h2 id="cabins-h" className="wide max-w-[18ch] text-[clamp(2rem,4.4vw,3.4rem)]">
        Choose where you sleep.
      </h2>
      <p className="mt-4 max-w-[52ch] text-fog">Every train carries all three. Pick a part of the carriage to look inside.</p>

      {/* carriage side view */}
      <div className="mt-12 rounded border border-rail bg-carriage p-3 md:p-4">
        <div role="tablist" aria-label="Cabin class" className="grid grid-cols-3 gap-2">
          {cabins.map((x, i) => {
            const sel = x.id === cabin;
            return (
              <button
                key={x.id}
                ref={(el) => {
                  tabs.current[i] = el;
                }}
                role="tab"
                id={`tab-${x.id}`}
                aria-selected={sel}
                aria-controls="cabin-panel"
                tabIndex={sel ? 0 : -1}
                onClick={() => setCabin(x.id)}
                onKeyDown={(e) => onKey(e, i)}
                className={`group rounded border px-3 pb-4 pt-3 text-left transition-colors ${
                  sel ? "border-lamp bg-lamp/10" : "border-rail hover:border-fog"
                }`}
              >
                {/* window row of this part of the carriage */}
                <span className="flex gap-1.5" aria-hidden="true">
                  {Array.from({ length: x.id === "seat" ? 6 : x.id === "couchette" ? 4 : 3 }, (_, k) => (
                    <span key={k} className={`block h-5 flex-1 rounded-sm ${sel ? "bg-lamp/70" : "bg-rail"}`} />
                  ))}
                </span>
                <span className="mt-4 block text-lg font-semibold">{x.short}</span>
                <span className="block font-mono text-sm text-fog">from {eur(x.priceFrom)}</span>
              </button>
            );
          })}
        </div>
        <div className="mt-2 flex justify-between px-6" aria-hidden="true">
          {[0, 1, 2, 3].map((k) => (
            <span key={k} className="block h-3 w-10 rounded-full bg-rail" />
          ))}
        </div>
      </div>

      <div className="mt-8">
        <LookSwitch id="look-cabins" label="Outside the window" />
      </div>

      <div id="cabin-panel" role="tabpanel" aria-labelledby={`tab-${c.id}`} className="mt-6 grid gap-8 md:grid-cols-12 md:items-center">
        <figure className="md:col-span-7">
          <img
            key={`${c.id}-${look}`}
            src={cabinImg(c.id, look)}
            alt={`${c.alt}. ${lookLabel} outside.`}
            width={1600}
            height={1000}
            className="aspect-[16/10] w-full rounded object-cover"
          />
          <figcaption className="mt-2 font-mono text-xs text-fog">{lookLabel} outside the window.</figcaption>
        </figure>
        <div className="md:col-span-5">
          <h3 className="wide text-[clamp(1.6rem,2.6vw,2.2rem)]">{c.name}</h3>
          <p className="mt-2 text-fog">{c.berths}</p>
          <ul className="mt-6 grid gap-3">
            {c.includes.map((it) => (
              <li key={it} className="flex items-start gap-3">
                <Check size={18} className="mt-1 shrink-0 text-lamp" aria-hidden="true" />
                {it}
              </li>
            ))}
          </ul>
          <p className="mt-8 font-mono text-2xl">
            from <span className="text-lamp">{eur(c.priceFrom)}</span> <span className="text-base text-fog">per traveller</span>
          </p>
        </div>
      </div>
    </section>
  );
}
