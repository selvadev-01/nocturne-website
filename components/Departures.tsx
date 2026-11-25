"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight } from "@phosphor-icons/react";
import { routes, ORIGIN, ORIGIN_STATION, duration } from "@/content/data";
import { useNight } from "@/lib/providers";
import { Flap } from "@/components/Flap";

/** Tonight's departures: a split-flap board. Choosing a row loads it into the booking. */
export function Departures() {
  const { routeId, setRouteId, scrollTo } = useNight();
  const board = useRef<HTMLTableElement>(null);
  const [play, setPlay] = useState(false);
  const [picked, setPicked] = useState<string | null>(null);
  const r = routes.find((x) => x.id === routeId)!;

  // flip the whole board once, when it first comes into view
  useEffect(() => {
    const el = board.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setPlay(true);
          io.disconnect();
        }
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const choose = (id: string) => {
    setRouteId(id);
    setPicked(id);
  };

  return (
    <section id="tonight" aria-labelledby="tonight-h" className="mx-auto max-w-[1400px] px-4 py-24 md:px-8 md:py-32">
      <h2 id="tonight-h" className="wide max-w-[18ch] text-[clamp(2rem,4.4vw,3.4rem)]">
        Tonight from {ORIGIN}.
      </h2>
      <p className="mt-4 max-w-[52ch] text-fog">Choose a departure. Every train leaves after dinner and arrives in time for breakfast.</p>

      <div className="mt-12 overflow-x-auto rounded border border-rail bg-[#080c18] p-3 md:p-5">
        <table ref={board} className="w-full min-w-[640px] border-separate border-spacing-y-1.5 text-left">
          <caption className="sr-only">
            Departures from {ORIGIN_STATION}. Sample timetable. Choose a row to book it.
          </caption>
          <thead>
            <tr className="font-mono text-xs uppercase tracking-wider text-fog">
              <th scope="col" className="px-3 py-2 font-normal">
                Time
              </th>
              <th scope="col" className="px-3 py-2 font-normal">
                Destination
              </th>
              <th scope="col" className="hidden px-3 py-2 font-normal md:table-cell">
                Via
              </th>
              <th scope="col" className="px-3 py-2 font-normal">
                Platform
              </th>
              <th scope="col" className="px-3 py-2 font-normal">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {routes.map((x, i) => {
              const sel = x.id === routeId;
              return (
                <tr
                  key={x.id}
                  onClick={() => choose(x.id)}
                  className={`cursor-pointer text-[clamp(0.9rem,1.5vw,1.25rem)] transition-colors ${sel ? "text-lamp" : "text-paper hover:text-lamp/80"}`}
                >
                  <td className={`rounded-l px-3 py-2 ${sel ? "bg-lamp/10 shadow-[inset_3px_0_0_#FFB547]" : ""}`}>
                    <Flap text={x.depart} play={play || picked === x.id} delay={i * 90} />
                    <span className="sr-only">{x.depart}</span>
                  </td>
                  <td className={`px-3 py-2 ${sel ? "bg-lamp/10" : ""}`}>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        choose(x.id);
                      }}
                      aria-pressed={sel}
                      className="text-left"
                    >
                      <Flap text={x.to} play={play || picked === x.id} delay={i * 90 + 60} />
                      <span className="sr-only">
                        {x.to}, via {x.via}, departs {x.depart}, arrives {x.arrive}
                      </span>
                    </button>
                  </td>
                  <td className={`hidden px-3 py-2 text-base text-fog md:table-cell ${sel ? "bg-lamp/10" : ""}`}>{x.via}</td>
                  <td className={`px-3 py-2 font-mono ${sel ? "bg-lamp/10" : ""}`}>{x.platform}</td>
                  <td className={`rounded-r px-3 py-2 text-base ${sel ? "bg-lamp/10" : ""} ${x.status === "Boarding" ? "text-lamp" : "text-fog"}`}>{x.status}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex flex-col gap-4 rounded border border-rail bg-carriage p-5 md:flex-row md:items-center md:justify-between" aria-live="polite">
        <p className="text-lg">
          <span className="font-mono text-lamp">{r.depart}</span> {ORIGIN} to {r.to} <span className="font-mono text-lamp">{r.arrive}</span>
          <span className="block text-sm text-fog md:ml-3 md:inline">
            {duration(r.durationMin)}, {r.distanceKm.toLocaleString("en-GB")} km, platform {r.platform}
          </span>
        </p>
        <a
          href="#book"
          onClick={(e) => {
            e.preventDefault();
            scrollTo("#book");
          }}
          className="inline-flex items-center justify-center gap-2 rounded bg-lamp px-5 py-3 font-semibold text-night transition-transform active:scale-[0.98]"
        >
          Book this night <ArrowRight size={18} weight="bold" aria-hidden="true" />
        </a>
      </div>
      <p className="mt-3 text-sm text-fog">Sample timetable for this demo. Times and platforms are illustrative.</p>
    </section>
  );
}
