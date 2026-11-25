"use client";

import { useState } from "react";
import { List, X } from "@phosphor-icons/react";
import { useNight } from "@/lib/providers";

const links = [
  { label: "Tonight", href: "#tonight" },
  { label: "The night", href: "#night" },
  { label: "Cabins", href: "#cabins" },
  { label: "Questions", href: "#worth" },
];

export function Nav() {
  const { scrollTo } = useNight();
  const [open, setOpen] = useState(false);
  const go = (href: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    setOpen(false);
    scrollTo(href);
  };

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-rail/60 bg-night/90">
      <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-4 md:px-8">
        <a href="#main" onClick={go("#main")} className="wide text-lg tracking-[0.04em]">
          NOCTURNE
        </a>
        <nav aria-label="Primary" className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <a key={l.href} href={l.href} onClick={go(l.href)} className="text-[15px] text-fog transition-colors hover:text-paper">
              {l.label}
            </a>
          ))}
          <a href="#book" onClick={go("#book")} className="rounded bg-lamp px-4 py-2 text-[15px] font-semibold text-night transition-transform active:scale-[0.98]">
            Book this night
          </a>
        </nav>
        <button type="button" className="p-2 md:hidden" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} onClick={() => setOpen((v) => !v)}>
          {open ? <X size={24} /> : <List size={24} />}
        </button>
      </div>
      {open && (
        <nav aria-label="Mobile" className="flex flex-col gap-1 border-t border-rail px-4 pb-6 pt-2 md:hidden">
          {links.map((l) => (
            <a key={l.href} href={l.href} onClick={go(l.href)} className="py-3 text-xl">
              {l.label}
            </a>
          ))}
          <a href="#book" onClick={go("#book")} className="mt-3 rounded bg-lamp px-4 py-3 text-center font-semibold text-night">
            Book this night
          </a>
        </nav>
      )}
    </header>
  );
}
