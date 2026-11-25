"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { CalendarPlus, CircleNotch, Printer } from "@phosphor-icons/react";
import { routes, cabins, ORIGIN, ORIGIN_STATION, duration, eur, type CabinId } from "@/content/data";
import { useNight } from "@/lib/providers";

const STEPS = ["Departure", "Cabin", "Travellers", "Summary"] as const;
type Berth = "lower" | "upper" | "any";

export function Book() {
  const { routeId, setRouteId, cabin, setCabin, travellers, setTravellers, date, setDate } = useNight();
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [berth, setBerth] = useState<Berth>("any");
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle");
  const [code, setCode] = useState("");
  const heading = useRef<HTMLHeadingElement>(null);
  const ticket = useRef<HTMLDivElement>(null);

  const r = routes.find((x) => x.id === routeId)!;
  const c = cabins.find((x) => x.id === cabin)!;
  const total = useMemo(() => c.priceFrom * travellers, [c, travellers]);
  const prettyDate = date ? new Date(`${date}T12:00:00`).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" }) : "";

  // move focus to the step heading so keyboard and screen-reader users land in the new step
  useEffect(() => {
    heading.current?.focus();
  }, [step]);

  useEffect(() => {
    if (status !== "done" || !ticket.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.fromTo(ticket.current, { clipPath: "inset(0 0 100% 0)" }, { clipPath: "inset(0 0 0% 0)", duration: 1.6, ease: "steps(16)" });
  }, [status]);

  const next = () => {
    if (step === 2) {
      const e: typeof errors = {};
      if (name.trim().length < 2) e.name = "Please enter the lead traveller's full name.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Please enter an email address like name@example.com.";
      setErrors(e);
      if (Object.keys(e).length) {
        document.getElementById(e.name ? "b-name" : "b-email")?.focus();
        return;
      }
    }
    setStep((s) => Math.min(3, s + 1));
  };

  const confirm = () => {
    setStatus("sending");
    // No backend yet: simulate the request so the full state cycle is visible.
    window.setTimeout(() => {
      setCode(`NCT-${r.id.toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`);
      setStatus("done");
    }, 1200);
  };

  const ics = () => {
    const d = date.replace(/-/g, "");
    const [dh, dm] = r.depart.split(":");
    const body = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "BEGIN:VEVENT",
      `DTSTART:${d}T${dh}${dm}00`,
      `SUMMARY:Night train ${ORIGIN} to ${r.to} (${code})`,
      `LOCATION:${ORIGIN_STATION}, platform ${r.platform}`,
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([body], { type: "text/calendar" }));
    a.download = `nocturne-${code}.ics`;
    a.click();
  };

  const field = "w-full rounded border border-rail bg-night px-4 py-3 text-paper placeholder:text-fog/70 focus:border-lamp focus:outline-none";
  const option = (sel: boolean) =>
    `flex cursor-pointer items-center justify-between gap-4 rounded border px-4 py-4 transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-lamp ${
      sel ? "border-lamp bg-lamp/10" : "border-rail hover:border-fog"
    }`;

  return (
    <section id="book" aria-labelledby="book-h" className="mx-auto max-w-[1400px] px-4 py-24 md:px-8 md:py-32">
      <h2 id="book-h" className="wide max-w-[18ch] text-[clamp(2rem,4.4vw,3.4rem)]">
        Book this night.
      </h2>

      {status === "done" ? (
        <div className="mt-12 max-w-[720px]">
          <div ref={ticket} className="perforated rounded bg-paper p-8 pt-10 text-night" role="status" aria-label="Your ticket">
            <div className="flex items-start justify-between gap-6">
              <p className="wide text-xl tracking-[0.04em]">NOCTURNE</p>
              <p className="font-mono text-sm">{code}</p>
            </div>
            <div className="mt-8 grid grid-cols-[1fr_auto_1fr] items-end gap-4">
              <div>
                <p className="font-mono text-4xl">{r.depart}</p>
                <p className="mt-1 text-lg font-semibold">{ORIGIN}</p>
              </div>
              <p className="pb-2 text-sm text-night/60">{duration(r.durationMin)}</p>
              <div className="text-right">
                <p className="font-mono text-4xl">{r.arrive}</p>
                <p className="mt-1 text-lg font-semibold">{r.to}</p>
              </div>
            </div>
            <dl className="mt-8 grid grid-cols-2 gap-4 border-t border-dashed border-night/30 pt-6 text-sm md:grid-cols-4">
              <div>
                <dt className="text-night/60">Date</dt>
                <dd className="font-semibold">{prettyDate}</dd>
              </div>
              <div>
                <dt className="text-night/60">Platform</dt>
                <dd className="font-semibold">{r.platform}</dd>
              </div>
              <div>
                <dt className="text-night/60">Cabin</dt>
                <dd className="font-semibold">{c.name}</dd>
              </div>
              <div>
                <dt className="text-night/60">Travellers</dt>
                <dd className="font-semibold">{travellers}</dd>
              </div>
            </dl>
            <div className="mt-8 flex items-end justify-between gap-6">
              <div className="grid h-24 w-24 place-items-center rounded border-2 border-dashed border-night/40 text-center text-[11px] text-night/60">
                QR code
                <br />
                at check-in
              </div>
              <p className="font-mono text-2xl">{eur(total)}</p>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <button type="button" onClick={ics} className="inline-flex items-center gap-2 rounded border border-rail px-5 py-3 font-semibold hover:border-paper">
              <CalendarPlus size={18} aria-hidden="true" /> Add to calendar
            </button>
            <button type="button" onClick={() => window.print()} className="inline-flex items-center gap-2 rounded border border-rail px-5 py-3 font-semibold hover:border-paper">
              <Printer size={18} aria-hidden="true" /> Print ticket
            </button>
          </div>
          <p className="mt-4 text-sm text-fog">Demo booking: nothing was charged and no ticket was issued.</p>
        </div>
      ) : (
        <div className="mt-12 grid gap-10 lg:grid-cols-12">
          {/* stepper */}
          <ol className="flex gap-2 lg:col-span-3 lg:flex-col" aria-label="Booking steps">
            {STEPS.map((s, i) => (
              <li key={s} className="flex-1">
                <button
                  type="button"
                  disabled={i > step}
                  onClick={() => setStep(i)}
                  aria-current={i === step ? "step" : undefined}
                  className={`flex w-full items-center gap-3 rounded border px-3 py-3 text-left text-sm transition-colors disabled:cursor-default ${
                    i === step ? "border-lamp text-paper" : i < step ? "border-rail text-paper hover:border-fog" : "border-rail/60 text-fog/60"
                  }`}
                >
                  <span className={`font-mono ${i <= step ? "text-lamp" : ""}`}>{i + 1}</span>
                  <span className="hidden sm:inline">{s}</span>
                </button>
              </li>
            ))}
          </ol>

          <div className="rounded border border-rail bg-carriage p-6 md:p-8 lg:col-span-6">
            <h3 ref={heading} tabIndex={-1} className="text-2xl font-semibold focus:outline-none">
              {STEPS[step]}
            </h3>

            {step === 0 && (
              <fieldset className="mt-6 grid gap-3">
                <legend className="sr-only">Choose a departure from {ORIGIN}</legend>
                {routes.map((x) => (
                  <label key={x.id} className={option(x.id === routeId)}>
                    <span className="flex items-center gap-4">
                      <input type="radio" name="route" value={x.id} checked={x.id === routeId} onChange={() => setRouteId(x.id)} className="sr-only" />
                      <span className="font-mono text-lamp">{x.depart}</span>
                      <span className="font-semibold">{x.to}</span>
                    </span>
                    <span className="text-sm text-fog">
                      arrives {x.arrive}, {duration(x.durationMin)}
                    </span>
                  </label>
                ))}
                <div className="mt-3 grid gap-1.5">
                  <label htmlFor="b-date" className="text-sm text-fog">
                    Date of travel
                  </label>
                  <input id="b-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} className={field} />
                </div>
              </fieldset>
            )}

            {step === 1 && (
              <fieldset className="mt-6 grid gap-3">
                <legend className="sr-only">Choose a cabin</legend>
                {cabins.map((x) => (
                  <label key={x.id} className={option(x.id === cabin)}>
                    <span className="flex items-center gap-4">
                      <input type="radio" name="cabin" value={x.id} checked={x.id === cabin} onChange={() => setCabin(x.id as CabinId)} className="sr-only" />
                      <span>
                        <span className="block font-semibold">{x.name}</span>
                        <span className="block text-sm text-fog">{x.berths}</span>
                      </span>
                    </span>
                    <span className="font-mono">{eur(x.priceFrom)}</span>
                  </label>
                ))}
              </fieldset>
            )}

            {step === 2 && (
              <div className="mt-6 grid gap-5">
                <div className="grid gap-1.5">
                  <label htmlFor="b-pax" className="text-sm text-fog">
                    Number of travellers
                  </label>
                  <select id="b-pax" value={travellers} onChange={(e) => setTravellers(Number(e.target.value))} className={field}>
                    {[1, 2, 3, 4, 5, 6].map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid gap-1.5">
                  <label htmlFor="b-name" className="text-sm text-fog">
                    Lead traveller&rsquo;s full name
                  </label>
                  <input
                    id="b-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoComplete="name"
                    aria-invalid={!!errors.name}
                    aria-describedby={errors.name ? "b-name-err" : undefined}
                    className={field}
                  />
                  {errors.name && (
                    <p id="b-name-err" className="text-sm text-lamp">
                      {errors.name}
                    </p>
                  )}
                </div>
                <div className="grid gap-1.5">
                  <label htmlFor="b-email" className="text-sm text-fog">
                    Email for your ticket
                  </label>
                  <input
                    id="b-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? "b-email-err" : undefined}
                    className={field}
                  />
                  {errors.email && (
                    <p id="b-email-err" className="text-sm text-lamp">
                      {errors.email}
                    </p>
                  )}
                </div>
                <fieldset className="grid gap-2">
                  <legend className="mb-1 text-sm text-fog">Berth preference</legend>
                  <div className="grid grid-cols-3 gap-2">
                    {(["lower", "upper", "any"] as Berth[]).map((b) => (
                      <label key={b} className={`${option(berth === b)} justify-center capitalize`}>
                        <input type="radio" name="berth" value={b} checked={berth === b} onChange={() => setBerth(b)} className="sr-only" />
                        {b === "any" ? "No preference" : b}
                      </label>
                    ))}
                  </div>
                </fieldset>
              </div>
            )}

            {step === 3 && (
              <dl className="mt-6 grid gap-4">
                {[
                  ["Train", `${r.depart} ${ORIGIN} to ${r.to}, arrives ${r.arrive}`],
                  ["Date", prettyDate],
                  ["Cabin", `${c.name}, berth ${berth === "any" ? "no preference" : berth}`],
                  ["Travellers", `${travellers}, lead ${name}`],
                  ["Ticket sent to", email],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-6 border-b border-rail pb-3">
                    <dt className="text-fog">{k}</dt>
                    <dd className="text-right">{v}</dd>
                  </div>
                ))}
              </dl>
            )}

            <div className="mt-8 flex items-center justify-between gap-4">
              {step > 0 ? (
                <button type="button" onClick={() => setStep((s) => s - 1)} className="rounded border border-rail px-5 py-3 font-semibold hover:border-paper">
                  Back
                </button>
              ) : (
                <span />
              )}
              {step < 3 ? (
                <button type="button" onClick={next} className="rounded bg-paper px-6 py-3 font-semibold text-night transition-transform active:scale-[0.98]">
                  Continue
                </button>
              ) : (
                <button
                  type="button"
                  onClick={confirm}
                  disabled={status === "sending"}
                  className="inline-flex min-h-[50px] items-center gap-2 rounded bg-lamp px-6 py-3 font-semibold text-night transition-transform active:scale-[0.98] disabled:opacity-70"
                >
                  {status === "sending" && <CircleNotch size={18} className="animate-spin" aria-hidden="true" />}
                  {status === "sending" ? "Booking" : "Book this night"}
                </button>
              )}
            </div>
          </div>

          {/* running total */}
          <aside className="lg:col-span-3" aria-live="polite">
            <div className="rounded border border-rail p-6">
              <p className="text-sm text-fog">Your night</p>
              <p className="mt-3 text-lg">
                {ORIGIN} to {r.to}
              </p>
              <p className="font-mono text-sm text-fog">
                {r.depart} to {r.arrive}
              </p>
              <p className="mt-4 text-sm text-fog">
                {c.name}, {travellers} {travellers === 1 ? "traveller" : "travellers"}
              </p>
              <p className="mt-6 font-mono text-3xl text-lamp">{eur(total)}</p>
              <p className="mt-1 text-xs text-fog">Sample prices for this demo</p>
            </div>
          </aside>
        </div>
      )}
    </section>
  );
}
