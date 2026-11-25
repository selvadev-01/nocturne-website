"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import type { CabinId, LookId } from "@/content/data";

gsap.registerPlugin(ScrollTrigger);

type Ctx = {
  scrollTo: (target: string | number) => void;
  routeId: string;
  setRouteId: (id: string) => void;
  cabin: CabinId;
  setCabin: (c: CabinId) => void;
  travellers: number;
  setTravellers: (n: number) => void;
  date: string;
  setDate: (d: string) => void;
  look: LookId;
  setLook: (l: LookId) => void;
};

const NightContext = createContext<Ctx | null>(null);

export const useNight = () => {
  const c = useContext(NightContext);
  if (!c) throw new Error("useNight must be used inside <Providers>");
  return c;
};

/** the station clock listens to this; the pinned night section drives it */
export const setClock = (minuteOfNight: number) =>
  window.dispatchEvent(new CustomEvent("nocturne:clock", { detail: minuteOfNight }));

const tonight = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

export function Providers({ children }: { children: ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);
  const [routeId, setRouteId] = useState("vie");
  const [cabin, setCabin] = useState<CabinId>("couchette");
  const [travellers, setTravellers] = useState(2);
  const [date, setDate] = useState("");
  const [look, setLook] = useState<LookId>("spring");

  useEffect(() => setDate(tonight()), []);

  // always open at the hero: stop the browser restoring an old scroll position
  // (it lands mid-page once the pinned night section re-measures)
  useEffect(() => {
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    if (!window.location.hash) window.scrollTo(0, 0);
  }, []);

  // Lenis <-> ScrollTrigger (skipped for reduced motion)
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
    lenisRef.current = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (t: number) => lenis.raf(t * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  // re-measure triggers in page order whenever the document height changes (fonts, images)
  useEffect(() => {
    let last = document.documentElement.scrollHeight;
    let t = 0;
    const ro = new ResizeObserver(() => {
      const h = document.documentElement.scrollHeight;
      if (Math.abs(h - last) < 2) return;
      last = h;
      window.clearTimeout(t);
      t = window.setTimeout(() => {
        ScrollTrigger.sort();
        ScrollTrigger.refresh();
      }, 200);
    });
    ro.observe(document.body);
    document.fonts?.ready.then(() => ScrollTrigger.refresh());
    return () => {
      ro.disconnect();
      window.clearTimeout(t);
    };
  }, []);

  const scrollTo = useCallback((target: string | number) => {
    const l = lenisRef.current;
    if (typeof target === "number") {
      if (l) l.scrollTo(target, { duration: 1.4 });
      else window.scrollTo({ top: target, behavior: "smooth" });
      return;
    }
    const el = document.querySelector(target) as HTMLElement | null;
    if (!el) return;
    if (l) l.scrollTo(el, { duration: 1.4, offset: -64 });
    else el.scrollIntoView({ behavior: "smooth" });
  }, []);

  return (
    <NightContext.Provider value={{ scrollTo, routeId, setRouteId, cabin, setCabin, travellers, setTravellers, date, setDate, look, setLook }}>
      {children}
    </NightContext.Provider>
  );
}
