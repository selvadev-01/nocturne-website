"use client";

import { Plus } from "@phosphor-icons/react";
import { routes, faq, CO2, ORIGIN } from "@/content/data";
import { useNight } from "@/lib/providers";

export function Worth() {
  const { routeId } = useNight();
  const r = routes.find((x) => x.id === routeId)!;
  const train = Math.round((r.distanceKm * CO2.train) / 1000);
  const plane = Math.round((r.distanceKm * CO2.plane) / 1000);

  return (
    <section id="worth" aria-labelledby="worth-h" className="border-y border-rail bg-carriage/50">
      <div className="mx-auto grid max-w-[1400px] gap-16 px-4 py-24 md:grid-cols-12 md:px-8 md:py-32">
        <div className="md:col-span-5">
          <h2 id="worth-h" className="wide text-[clamp(2rem,4.4vw,3.4rem)]">
            Worth the night.
          </h2>
          <p className="mt-4 text-fog">
            {ORIGIN} to {r.to}, per traveller, one way.
          </p>
          <dl className="mt-10 grid grid-cols-2 gap-6">
            <div>
              <dt className="text-sm text-fog">By night train</dt>
              <dd className="mt-1 font-mono text-5xl text-lamp">
                {train}
                <span className="ml-1 text-xl">kg</span>
              </dd>
            </div>
            <div>
              <dt className="text-sm text-fog">By plane</dt>
              <dd className="mt-1 font-mono text-5xl text-paper/80">
                {plane}
                <span className="ml-1 text-xl">kg</span>
              </dd>
            </div>
          </dl>
          <p className="mt-6 text-sm text-fog">
            CO2 estimates from rounded averages of {CO2.train} g (train) and {CO2.plane} g (plane) per passenger-km, over {r.distanceKm.toLocaleString("en-GB")} km.
          </p>
        </div>

        <div className="md:col-span-6 md:col-start-7">
          <h3 className="text-xl font-semibold">Questions before you book</h3>
          <div className="mt-6 divide-y divide-rail border-y border-rail">
            {faq.map((f) => (
              <details key={f.q} className="group">
                <summary className="flex cursor-pointer items-center justify-between gap-6 py-5 text-lg">
                  {f.q}
                  <Plus size={18} className="shrink-0 text-lamp transition-transform duration-300 group-open:rotate-45" aria-hidden="true" />
                </summary>
                <p className="max-w-[56ch] pb-6 text-fog">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
