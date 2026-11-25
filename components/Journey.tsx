"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight } from "@phosphor-icons/react";
import { routes, ORIGIN, duration, cabins, eur } from "@/content/data";
import { useNight, setClock } from "@/lib/providers";

/** One continuous Blender film (nocturne_journey.py): 2160 frames, Paris to Vienna through all four seasons. */
const FRAMES = 2160;
const FILM = { wide: "/video/journey-film-wide.mp4", mobile: "/video/journey-film-mobile.mp4", poster: "/img/journey-film.webp" };

type Chapter = {
  from: number;
  to: number;
  kicker: string;
  title: string;
  copy: string;
  parts?: [string, string][];
  cabin?: "seat" | "couchette" | "sleeper";
  dawn?: boolean;
};

// frame windows of the film (SHOTS_J in nocturne_journey.py)
const CHAPTERS: Chapter[] = [
  { from: 200, to: 300, kicker: "Paris, sunset", title: "Electric, all the way", copy: "One electric locomotive, six carriages. No airport, no kerosene, no security queue." },
  {
    from: 300,
    to: 455,
    kicker: "Inside the engine",
    title: "What pulls you through the night",
    copy: "The side panel lifts away so you can look in.",
    parts: [
      ["Pantograph", "on the roof, draws power from the overhead line"],
      ["Traction converters", "the two tall cabinets, they shape that power for the motors"],
      ["Cooling unit", "keeps the electronics at working temperature"],
      ["Main transformer", "under the floor, between the bogies"],
      ["Traction motors", "four, one on each axle"],
    ],
  },
  { from: 470, to: 735, kicker: "Spring", title: "Departure", copy: "Paris slides away. Green fields by the time you have unpacked." },
  { from: 800, to: 960, kicker: "On board", title: "Reclining seat", copy: "Six seats to a compartment, a table by the window.", cabin: "seat" },
  { from: 960, to: 1085, kicker: "On board", title: "Couchette", copy: "Six berths with fresh bedding. Spring turns to summer outside.", cabin: "couchette" },
  { from: 1085, to: 1192, kicker: "On board", title: "Private sleeper", copy: "A made bed, a basin and your own window on the night.", cabin: "sleeper" },
  { from: 1235, to: 1411, kicker: "Summer", title: "The river crossing", copy: "Over the valley on an old steel bridge. The line runs every night of the year." },
  { from: 1411, to: 1661, kicker: "Autumn", title: "Copper woods", copy: "Beech and fir in their autumn colours, and nothing to do but watch." },
  { from: 1661, to: 1880, kicker: "Winter", title: "Over the Alps", copy: "A stone viaduct above a frozen gorge. Snow outside, a warm bed inside." },
  { from: 1880, to: 2015, kicker: "Vienna", title: "Arrival at first light", copy: "Breakfast is served. Coffee is five minutes away.", dawn: true },
];

// film frame -> minutes on board (the train leaves at frame 470 and stops at frame 2010)
const minuteAt = (f: number) => Math.round(Math.min(1, Math.max(0, (f - 470) / (2010 - 470))) * 696);

// the route map that closes the film: real stops, simple equirectangular projection
const STOPS: { name: string; lon: number; lat: number; dx: number; dy: number }[] = [
  { name: "Paris", lon: 2.35, lat: 48.86, dx: -12, dy: -14 },
  { name: "Strasbourg", lon: 7.75, lat: 48.58, dx: 0, dy: 26 },
  { name: "Munich", lon: 11.58, lat: 48.14, dx: 0, dy: 26 },
  { name: "Salzburg", lon: 13.04, lat: 47.81, dx: 0, dy: 26 },
  { name: "Vienna", lon: 16.37, lat: 48.21, dx: 0, dy: -20 },
];
const px = (lon: number) => 40 + ((lon - 1.5) / 15.5) * 920;
const py = (lat: number) => 60 + ((49.6 - lat) / 2.6) * 300;
const MAP_D = STOPS.map((s, i) => `${i ? "L" : "M"}${px(s.lon).toFixed(1)} ${py(s.lat).toFixed(1)}`).join(" ");
const MAP_FROM = 2030;
const MAP_TO = 2120;

export function Journey() {
  const { scrollTo, routeId, setRouteId, travellers, setTravellers, date, setDate, setCabin } = useNight();
  const section = useRef<HTMLElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const hero = useRef<HTMLDivElement>(null);
  const map = useRef<HTMLDivElement>(null);
  const line = useRef<SVGPathElement>(null);
  const progress = useRef(0);
  const [chapter, setChapter] = useState(-1);
  const [mapOn, setMapOn] = useState(false);
  const [loaded, setLoaded] = useState(0);
  const [reduce, setReduce] = useState(false);

  useEffect(() => setReduce(window.matchMedia("(prefers-reduced-motion: reduce)").matches), []);

  // fetch the film into memory once so scrubbing seeks locally
  useEffect(() => {
    if (reduce || !video.current) return;
    const v = video.current;
    const url = window.matchMedia("(max-width: 767px)").matches ? FILM.mobile : FILM.wide;
    const ctrl = new AbortController();
    let obj = "";
    (async () => {
      try {
        const res = await fetch(url, { signal: ctrl.signal });
        const total = Number(res.headers.get("content-length")) || 0;
        const reader = res.body!.getReader();
        const parts: BlobPart[] = [];
        let got = 0;
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          parts.push(value);
          got += value.length;
          if (total) setLoaded(got / total);
        }
        obj = URL.createObjectURL(new Blob(parts, { type: "video/mp4" }));
        v.src = obj;
        v.addEventListener("loadedmetadata", () => (v.currentTime = progress.current * (v.duration - 0.05)), { once: true });
        setLoaded(1);
      } catch {
        if (!ctrl.signal.aborted) {
          v.src = url;
          setLoaded(1);
        }
      }
    })();
    return () => {
      ctrl.abort();
      if (obj) URL.revokeObjectURL(obj);
    };
  }, [reduce]);

  useEffect(() => {
    if (reduce || !section.current || !video.current) return;
    const v = video.current;
    let raf = 0;
    let current = -2;
    let mapShown = false;
    const tick = () => {
      if (v.duration && !v.seeking) {
        const want = progress.current * (v.duration - 0.05);
        if (Math.abs(want - v.currentTime) > 0.008) v.currentTime += (want - v.currentTime) * 0.4;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    const update = (p: number) => {
      progress.current = p;
      const f = p * FRAMES;
      setClock(minuteAt(f));
      if (hero.current) {
        const o = 1 - Math.min(1, Math.max(0, (f - 90) / 80));
        hero.current.style.opacity = String(o);
        hero.current.style.transform = `translateY(${(1 - o) * -40}px)`;
        hero.current.style.pointerEvents = o < 0.2 ? "none" : "auto";
      }
      const ci = CHAPTERS.findIndex((c) => f >= c.from && f < c.to);
      if (ci !== current) {
        current = ci;
        setChapter(ci);
      }
      const m = Math.min(1, Math.max(0, (f - MAP_FROM) / (MAP_TO - MAP_FROM)));
      if (line.current) line.current.style.strokeDashoffset = String(1 - m);
      if (map.current) map.current.style.opacity = String(Math.min(1, Math.max(0, (f - (MAP_FROM - 25)) / 30)));
      if ((f >= MAP_FROM - 25) !== mapShown) {
        mapShown = f >= MAP_FROM - 25;
        setMapOn(mapShown);
      }
    };
    const ctx = gsap.context(() => {
      gsap.from(".j-line > span", { yPercent: 110, duration: 1.1, ease: "power4.out", stagger: 0.1, delay: 0.15 });
      gsap.from(".j-fade", { opacity: 0, y: 14, duration: 0.9, ease: "power3.out", delay: 0.5, stagger: 0.08 });
    }, section);
    const st = ScrollTrigger.create({
      trigger: section.current,
      start: "top top",
      end: "+=2400%",
      pin: true,
      anticipatePin: 1,
      onUpdate: (s) => update(s.progress),
    });
    update(0);
    ScrollTrigger.sort();
    ScrollTrigger.refresh();
    return () => {
      cancelAnimationFrame(raf);
      st.kill();
      ctx.revert();
    };
  }, [reduce]);

  const field = "w-full rounded border border-rail bg-night/80 px-3 py-3 text-paper focus:border-lamp focus:outline-none";
  const ch = chapter >= 0 ? CHAPTERS[chapter] : null;
  const cab = ch?.cabin ? cabins.find((c) => c.id === ch.cabin) : undefined;

  return (
    <section ref={section} aria-label="The journey, Paris to Vienna" className="relative h-[100dvh] overflow-hidden bg-night">
      <video
        ref={video}
        poster={FILM.poster}
        muted
        playsInline
        preload="none"
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover object-[60%_50%]"
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(11,16,32,0.85)_0%,rgba(11,16,32,0.35)_40%,transparent_65%),linear-gradient(to_top,rgba(11,16,32,0.9)_0%,transparent_35%)]"
        aria-hidden="true"
      />

      {/* hero: frame 1 of the film */}
      <div ref={hero} className="absolute inset-0 flex items-end pb-28 pt-24 md:items-center md:pb-0">
        <div className="mx-auto w-full max-w-[1400px] px-4 md:px-8">
          <h1 className="wide text-[clamp(2.2rem,4.2vw,4.4rem)]">
            <span className="j-line block overflow-hidden pb-1">
              <span className="block">Fall asleep in Paris.</span>
            </span>
            <span className="j-line block overflow-hidden pb-2">
              <span className="block text-lamp">Wake up in Vienna.</span>
            </span>
          </h1>
          <p className="j-fade mt-6 max-w-[46ch] text-lg text-paper/80">
            Night trains across Europe. Scroll to ride the whole line: the engine, the cabins and all four seasons.
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              scrollTo("#book");
            }}
            className="j-fade mt-10 grid max-w-[980px] grid-cols-2 gap-3 rounded border border-rail bg-carriage/95 p-4 md:grid-cols-[1fr_1.3fr_1.1fr_0.9fr_auto] md:items-end"
            aria-label="Find a night train"
          >
            <div className="grid gap-1.5">
              <label htmlFor="s-from" className="text-sm text-fog">From</label>
              <select id="s-from" className={field} defaultValue={ORIGIN}>
                <option>{ORIGIN}</option>
              </select>
            </div>
            <div className="grid gap-1.5">
              <label htmlFor="s-to" className="text-sm text-fog">To</label>
              <select id="s-to" className={field} value={routeId} onChange={(e) => setRouteId(e.target.value)}>
                {routes.map((r) => (
                  <option key={r.id} value={r.id}>{r.to}</option>
                ))}
              </select>
            </div>
            <div className="grid gap-1.5">
              <label htmlFor="s-date" className="text-sm text-fog">Date</label>
              <input id="s-date" type="date" className={field} value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="grid gap-1.5">
              <label htmlFor="s-pax" className="text-sm text-fog">Travellers</label>
              <select id="s-pax" className={field} value={travellers} onChange={(e) => setTravellers(Number(e.target.value))}>
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
            <button type="submit" className="col-span-2 flex min-h-[50px] items-center justify-center gap-2 rounded bg-lamp px-5 font-semibold text-night active:scale-[0.98] md:col-span-1">
              Find a night train <ArrowRight size={18} weight="bold" aria-hidden="true" />
            </button>
          </form>
        </div>
      </div>

      {/* chapter caption */}
      {ch && (
        <div className="absolute inset-x-0 bottom-0 mx-auto max-w-[1400px] px-4 pb-24 md:px-8 md:pb-16" aria-live="polite">
          <div className={`max-w-[32rem] rounded p-6 transition-colors duration-700 ${ch.dawn ? "bg-dawn text-night" : "bg-night/85 text-paper"}`}>
            <p className={`font-mono text-sm uppercase tracking-[0.14em] ${ch.dawn ? "text-night/70" : "text-lamp"}`}>
              {ch.kicker}
              {ch.from >= 470 && <span className="ml-3 normal-case tracking-normal opacity-80">{duration(minuteAt(ch.from + 20))} on board</span>}
            </p>
            <h2 className="wide mt-3 text-[clamp(1.5rem,2.8vw,2.2rem)]">{ch.title}</h2>
            <p className={`mt-2 text-lg ${ch.dawn ? "text-night/80" : "text-paper/80"}`}>{ch.copy}</p>
            {ch.parts && (
              <dl className="mt-4 grid gap-2 border-t border-rail pt-4 text-sm">
                {ch.parts.map(([k, v]) => (
                  <div key={k} className="grid grid-cols-[9.5rem_1fr] gap-3">
                    <dt className="font-semibold text-paper">{k}</dt>
                    <dd className="text-fog">{v}</dd>
                  </div>
                ))}
              </dl>
            )}
            {cab && (
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-rail pt-4">
                <p className="font-mono">
                  from <span className="text-lamp">{eur(cab.priceFrom)}</span> <span className="text-sm text-fog">per traveller</span>
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setCabin(cab.id);
                    scrollTo("#book");
                  }}
                  className="flex min-h-[44px] items-center gap-2 rounded bg-lamp px-4 text-sm font-semibold text-night active:scale-[0.98]"
                >
                  Choose this cabin <ArrowRight size={16} weight="bold" aria-hidden="true" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* the route map that closes the ride */}
      <div ref={map} className="pointer-events-none absolute inset-0 flex items-center opacity-0" aria-hidden={!mapOn}>
        <div className="mx-auto w-full max-w-[1400px] px-4 md:px-8">
          <div className="pointer-events-auto max-w-[980px] rounded border border-rail bg-night/80 p-5 backdrop-blur-sm md:p-8">
            <p className="font-mono text-sm uppercase tracking-[0.14em] text-lamp">The line</p>
            <h2 className="wide mt-2 text-[clamp(1.5rem,2.8vw,2.2rem)]">Paris to Vienna, overnight</h2>
            <svg viewBox="0 0 1000 420" className="mt-4 w-full" role="img" aria-label="Route map: Paris, Strasbourg, Munich, Salzburg, Vienna">
              <title>Paris, Strasbourg, Munich, Salzburg, Vienna</title>
              <path d={MAP_D} fill="none" stroke="#273049" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              <path
                ref={line}
                d={MAP_D}
                fill="none"
                stroke="#FFB547"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
                pathLength={1}
                strokeDasharray="1"
                strokeDashoffset="1"
              />
              {STOPS.map((s, i) => (
                <g key={s.name} transform={`translate(${px(s.lon)} ${py(s.lat)})`}>
                  <circle r={i === 0 || i === STOPS.length - 1 ? 8 : 5} fill={i === 0 || i === STOPS.length - 1 ? "#FFB547" : "#ECEEF2"} />
                  <text
                    x={s.dx}
                    y={s.dy}
                    textAnchor={i === 0 ? "end" : "middle"}
                    className="fill-paper font-mono"
                    fontSize="22"
                  >
                    {s.name}
                  </text>
                </g>
              ))}
            </svg>
            <div className="mt-6 flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={() => scrollTo("#book")}
                tabIndex={mapOn ? 0 : -1}
                className="flex min-h-[50px] items-center gap-2 rounded bg-lamp px-6 font-semibold text-night active:scale-[0.98]"
              >
                Book this night <ArrowRight size={18} weight="bold" aria-hidden="true" />
              </button>
              <p className="font-mono text-sm text-fog">{duration(696)} door to door</p>
            </div>
          </div>
        </div>
      </div>

      {/* the ride is long; never trap someone who already wants to buy */}
      {ch && (
        <button
          type="button"
          onClick={() => scrollTo("#book")}
          className="absolute right-4 top-[76px] rounded border border-rail bg-night/80 px-3 py-2 font-mono text-xs text-paper/80 hover:text-paper md:right-8 md:top-[140px]"
        >
          Skip to booking
        </button>
      )}

      {loaded < 1 && !reduce && (
        <p className="absolute bottom-16 right-4 font-mono text-xs text-fog md:bottom-4 md:right-8" role="status">
          Loading the ride {Math.round(loaded * 100)}%
        </p>
      )}
    </section>
  );
}
