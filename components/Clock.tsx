"use client";

import { useEffect, useState } from "react";
import { NIGHT_START, clockLabel } from "@/content/data";
import { useNight } from "@/lib/providers";

const onBoard = (m: number) => {
  const r = Math.round(m);
  return `${Math.floor(r / 60)}:${String(r % 60).padStart(2, "0")}`;
};

/** The station clock: night look reads departure time (19:42 onward); daytime looks count time on board. */
export function Clock() {
  const { look } = useNight();
  const night = look === "night";
  const [m, setM] = useState(0);

  useEffect(() => {
    const on = (e: Event) => setM((e as CustomEvent<number>).detail);
    window.addEventListener("nocturne:clock", on);
    return () => window.removeEventListener("nocturne:clock", on);
  }, []);

  const total = (night ? NIGHT_START : 0) + m;
  const label = night ? clockLabel(m) : onBoard(m);
  const minAngle = (total % 60) * 6;
  const hourAngle = ((total / 60) % 12) * 30;

  return (
    <div
      className="pointer-events-none fixed right-4 top-[76px] z-30 hidden items-center gap-3 rounded border border-rail bg-carriage/90 py-2 pl-2 pr-3 md:flex md:right-8"
      role="timer"
      aria-label={night ? `Time ${label}` : `Time on board ${label}`}
    >
      <svg viewBox="0 0 40 40" className="h-9 w-9" aria-hidden="true">
        <circle cx="20" cy="20" r="18" fill="none" stroke="#273049" strokeWidth="2" />
        {Array.from({ length: 12 }, (_, i) => (
          <line key={i} x1="20" y1="3.5" x2="20" y2="6" stroke="#9AA3B5" strokeWidth="1.2" transform={`rotate(${i * 30} 20 20)`} />
        ))}
        <line x1="20" y1="20" x2="20" y2="11" stroke="#ECEEF2" strokeWidth="2.2" strokeLinecap="round" transform={`rotate(${hourAngle} 20 20)`} />
        <line x1="20" y1="21.5" x2="20" y2="6.5" stroke="#FFB547" strokeWidth="1.4" strokeLinecap="round" transform={`rotate(${minAngle} 20 20)`} />
        <circle cx="20" cy="20" r="1.6" fill="#FFB547" />
      </svg>
      <span className="font-mono text-lg tabular-nums">
        {label}
        {!night && <span className="ml-1.5 text-xs text-fog">on board</span>}
      </span>
    </div>
  );
}
