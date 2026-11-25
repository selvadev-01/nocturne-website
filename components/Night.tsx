"use client";

import { useEffect, useRef, useState } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { chapters, NIGHT_LENGTH, clockLabel } from "@/content/data";
import { setClock } from "@/lib/providers";

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const smooth = (a: number, b: number, x: number) => {
  const t = clamp((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};

/** The one pinned scroll: the night, 19:42 to 07:18, through a carriage window. */
export function Night() {
  const section = useRef<HTMLElement>(null);
  const layers = useRef<(HTMLDivElement | null)[]>([]);
  const [active, setActive] = useState(0);
  const [reduce, setReduce] = useState(false);

  useEffect(() => setReduce(window.matchMedia("(prefers-reduced-motion: reduce)").matches), []);

  useEffect(() => {
    if (reduce || !section.current) return;
    let current = -1;
    const update = (p: number) => {
      const minute = p * NIGHT_LENGTH;
      setClock(minute);
      let i = 0;
      while (i < chapters.length - 1 && minute >= chapters[i + 1].minute) i++;
      chapters.forEach((c, k) => {
        const el = layers.current[k];
        if (!el) return;
        const start = c.minute;
        const end = k < chapters.length - 1 ? chapters[k + 1].minute : NIGHT_LENGTH + 1;
        const span = end - start;
        // hold each window, cross-fade over the last quarter into the next
        const fadeIn = k === 0 ? 1 : smooth(start - span * 0.25, start, minute);
        const fadeOut = k === chapters.length - 1 ? 1 : 1 - smooth(end - span * 0.25, end, minute);
        el.style.opacity = String(Math.min(fadeIn, fadeOut));
        // the landscape keeps sliding past the window
        const local = clamp((minute - start + span * 0.25) / (span * 1.25));
        el.style.transform = `scale(1.12) translateX(${(0.5 - local) * 5}%)`;
      });
      if (i !== current) {
        current = i;
        setActive(i);
      }
    };
    const st = ScrollTrigger.create({
      trigger: section.current,
      start: "top top",
      end: "+=600%",
      pin: true,
      scrub: true,
      anticipatePin: 1,
      onUpdate: (s) => update(s.progress),
      onLeave: () => setClock(NIGHT_LENGTH),
      onLeaveBack: () => setClock(0),
    });
    update(0);
    ScrollTrigger.sort();
    ScrollTrigger.refresh();
    return () => st.kill();
  }, [reduce]);

  if (reduce) {
    return (
      <section id="night" aria-labelledby="night-h" className="mx-auto max-w-[1400px] px-4 py-24 md:px-8">
        <h2 id="night-h" className="wide text-[clamp(2rem,4.4vw,3.4rem)]">
          One night, 19:42 to 07:18.
        </h2>
        <ol className="mt-12 grid gap-10 md:grid-cols-2">
          {chapters.map((c) => (
            <li key={c.id}>
              <img src={c.img} alt={c.alt} loading="lazy" className="aspect-video w-full rounded object-cover" />
              <p className="mt-4 font-mono text-lamp">{clockLabel(c.minute)}</p>
              <h3 className="mt-1 text-xl font-semibold">{c.title}</h3>
              <p className="mt-1 text-fog">{c.copy}</p>
            </li>
          ))}
        </ol>
      </section>
    );
  }

  const ch = chapters[active];
  const dawn = "dawn" in ch && ch.dawn;

  return (
    <section id="night" ref={section} aria-labelledby="night-h" className="relative h-[100dvh] overflow-hidden bg-night">
      <h2 id="night-h" className="sr-only">
        One night on the train, 19:42 to 07:18
      </h2>
      {chapters.map((c, k) => (
        <div
          key={c.id}
          ref={(el) => {
            layers.current[k] = el;
          }}
          className="absolute inset-0 will-change-transform"
          style={{ opacity: k === 0 ? 1 : 0 }}
        >
          <img src={c.img} alt={k === active ? c.alt : ""} className="h-full w-full object-cover" />
        </div>
      ))}
      {/* carriage window: rounded inner frame and edge shade */}
      <div className="pointer-events-none absolute inset-3 rounded-[28px] shadow-[0_0_0_200px_#0B1020,inset_0_0_120px_40px_rgba(11,16,32,0.75)] md:inset-8 md:rounded-[44px]" aria-hidden="true" />

      <div className="absolute inset-x-0 bottom-0 mx-auto max-w-[1400px] px-6 pb-12 md:px-14 md:pb-16">
        <div
          className={`max-w-[30rem] rounded p-6 transition-colors duration-700 ${dawn ? "bg-dawn text-night" : "bg-night/85 text-paper"}`}
          aria-live="polite"
        >
          <p className={`font-mono text-3xl tabular-nums ${dawn ? "text-night" : "text-lamp"}`}>{clockLabel(ch.minute)}</p>
          <h3 className="wide mt-3 text-[clamp(1.6rem,3vw,2.4rem)]">{ch.title}</h3>
          <p className={`mt-2 text-lg ${dawn ? "text-night/80" : "text-paper/80"}`}>{ch.copy}</p>
        </div>
      </div>

      <ol className="absolute right-6 top-1/2 hidden -translate-y-1/2 gap-3 md:right-14 md:grid" aria-hidden="true">
        {chapters.map((c, k) => (
          <li key={c.id} className={`font-mono text-sm transition-colors ${k === active ? "text-lamp" : "text-paper/45"}`}>
            {clockLabel(c.minute)}
          </li>
        ))}
      </ol>
    </section>
  );
}
