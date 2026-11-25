"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ArrowRight } from "@phosphor-icons/react";
import { routes, ORIGIN } from "@/content/data";
import { useNight } from "@/lib/providers";

export function Hero() {
  const { scrollTo, routeId, setRouteId, travellers, setTravellers, date, setDate } = useNight();
  const root = useRef<HTMLElement>(null);
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || !root.current) return;
    const ctx = gsap.context(() => {
      gsap.from(".h-line > span", { yPercent: 110, duration: 1.1, ease: "power4.out", stagger: 0.1, delay: 0.15 });
      gsap.from(".h-fade", { opacity: 0, y: 14, duration: 0.9, ease: "power3.out", delay: 0.5, stagger: 0.08 });
    }, root);
    return () => ctx.revert();
  }, []);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    scrollTo("#book");
  };

  const field = "w-full rounded border border-rail bg-night/80 px-3 py-3 text-paper focus:border-lamp focus:outline-none";

  return (
    <section ref={root} className="relative flex min-h-[100dvh] items-end overflow-hidden pb-10 pt-24 md:items-center md:pb-0">
      {/* platform at dusk: a slow push-in stands in for the film until the GPU render succeeds */}
      <img
        src="/img/hero.webp"
        alt=""
        aria-hidden="true"
        fetchPriority="high"
        className="hero-still absolute inset-0 h-full w-full object-cover object-[70%_50%]"
      />
      <div
        className="absolute inset-0 bg-[linear-gradient(to_right,rgba(11,16,32,0.92)_0%,rgba(11,16,32,0.55)_42%,transparent_70%),linear-gradient(to_top,#0B1020_0%,transparent_35%)]"
        aria-hidden="true"
      />

      <div className="relative mx-auto w-full max-w-[1400px] px-4 md:px-8">
        <h1 className="wide text-[clamp(2.2rem,4.2vw,4.4rem)]">
          <span className="h-line block overflow-hidden pb-1">
            <span className="block">Fall asleep in Paris.</span>
          </span>
          <span className="h-line block overflow-hidden pb-2">
            <span className="block text-lamp">Wake up in Vienna.</span>
          </span>
        </h1>
        <p className="h-fade mt-6 max-w-[44ch] text-lg text-paper/80">
          Night trains across Europe. Your bed moves, your morning starts in a new city.
        </p>

        <form
          id="search"
          onSubmit={submit}
          className="h-fade mt-10 grid max-w-[980px] grid-cols-2 gap-3 rounded border border-rail bg-carriage/95 p-4 md:grid-cols-[1fr_1.3fr_1.1fr_0.9fr_auto] md:items-end"
          aria-label="Find a night train"
        >
          <div className="grid gap-1.5">
            <label htmlFor="s-from" className="text-sm text-fog">
              From
            </label>
            <select id="s-from" className={field} defaultValue={ORIGIN}>
              <option>{ORIGIN}</option>
            </select>
          </div>
          <div className="grid gap-1.5">
            <label htmlFor="s-to" className="text-sm text-fog">
              To
            </label>
            <select id="s-to" className={field} value={routeId} onChange={(e) => setRouteId(e.target.value)}>
              {routes.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.to}
                </option>
              ))}
            </select>
          </div>
          <div className="grid gap-1.5">
            <label htmlFor="s-date" className="text-sm text-fog">
              Date
            </label>
            <input id="s-date" type="date" className={field} value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div className="grid gap-1.5">
            <label htmlFor="s-pax" className="text-sm text-fog">
              Travellers
            </label>
            <select id="s-pax" className={field} value={travellers} onChange={(e) => setTravellers(Number(e.target.value))}>
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="col-span-2 flex min-h-[50px] items-center justify-center gap-2 rounded bg-lamp px-5 font-semibold text-night transition-transform active:scale-[0.98] md:col-span-1"
          >
            Find a night train <ArrowRight size={18} weight="bold" aria-hidden="true" />
          </button>
        </form>
      </div>
    </section>
  );
}
