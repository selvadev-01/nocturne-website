"use client";

import { useEffect, useState } from "react";
import { routes } from "@/content/data";
import { Flap } from "@/components/Flap";

export function Footer() {
  const [i, setI] = useState(0);
  const [joined, setJoined] = useState(false);
  const [err, setErr] = useState("");
  const r = routes[i % routes.length];

  // last call: cycle the next departures on one flap line
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => setI((v) => v + 1), 4500);
    return () => window.clearInterval(id);
  }, []);

  const join = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const v = String(new FormData(e.currentTarget).get("email") ?? "");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
      setErr("Please enter an email address like name@example.com.");
      return;
    }
    setErr("");
    setJoined(true);
  };

  const line = `${r.depart} ${r.to} PL ${r.platform}`;

  return (
    <footer className="border-t border-rail">
      <div className="mx-auto max-w-[1400px] px-4 py-20 md:px-8">
        <p className="text-sm text-fog">Last call</p>
        <div className="mt-3 text-[clamp(1.4rem,3.4vw,2.8rem)] text-lamp">
          <Flap text={line} play />
          <span className="sr-only">
            Next departure {r.depart} to {r.to}, platform {r.platform}
          </span>
        </div>

        <div className="mt-16 grid gap-12 md:grid-cols-12">
          <form onSubmit={join} noValidate className="md:col-span-5" aria-label="New routes email">
            <label htmlFor="f-email" className="text-lg">
              One email when new routes open.
            </label>
            {joined ? (
              <p role="status" className="mt-4 text-lamp">
                You are on the list. See you on the platform.
              </p>
            ) : (
              <>
                <div className="mt-4 flex gap-2">
                  <input
                    id="f-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    aria-invalid={!!err}
                    aria-describedby={err ? "f-email-err" : undefined}
                    className="w-full rounded border border-rail bg-night px-4 py-3 focus:border-lamp focus:outline-none"
                  />
                  <button type="submit" className="shrink-0 rounded border border-rail px-5 py-3 font-semibold hover:border-paper">
                    Notify me
                  </button>
                </div>
                {err && (
                  <p id="f-email-err" className="mt-2 text-sm text-lamp">
                    {err}
                  </p>
                )}
              </>
            )}
          </form>
          <nav aria-label="Footer" className="grid grid-cols-2 gap-3 text-fog md:col-span-4 md:col-start-9">
            <a href="#tonight" className="hover:text-paper">
              Tonight
            </a>
            <a href="#cabins" className="hover:text-paper">
              Cabins
            </a>
            <a href="#worth" className="hover:text-paper">
              Questions
            </a>
            <a href="#book" className="hover:text-paper">
              Book
            </a>
          </nav>
        </div>

        <div className="mt-16 flex flex-col gap-3 border-t border-rail pt-6 text-sm text-fog md:flex-row md:justify-between">
          <span className="wide text-paper">NOCTURNE</span>
          <span>Concept site. Timetables and prices are sample data.</span>
          <span>&copy; 2026 NOCTURNE</span>
        </div>
      </div>
    </footer>
  );
}
