"use client";

import { useEffect, useState } from "react";

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

/**
 * Split-flap text. Visual only (aria-hidden): callers always render the real text for
 * assistive tech. When `play` turns true the cells shuffle and settle left to right.
 */
export function Flap({ text, play = true, delay = 0, className = "" }: { text: string; play?: boolean; delay?: number; className?: string }) {
  const target = text.toUpperCase();
  const [shown, setShown] = useState(target);

  useEffect(() => {
    if (!play || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShown(target);
      return;
    }
    let frame = 0;
    let id = 0;
    const start = window.setTimeout(() => {
      id = window.setInterval(() => {
        frame++;
        let done = true;
        const next = target
          .split("")
          .map((c, i) => {
            if (c === " " || frame >= 4 + i * 1.6) return c;
            done = false;
            return CHARS[(Math.random() * CHARS.length) | 0];
          })
          .join("");
        setShown(next);
        if (done) window.clearInterval(id);
      }, 42);
    }, delay);
    return () => {
      window.clearTimeout(start);
      window.clearInterval(id);
    };
  }, [target, play, delay]);

  return (
    <span className={`inline-flex gap-[2px] ${className}`} aria-hidden="true">
      {shown.split("").map((c, i) => (
        <span key={i} className="flap">
          {c === " " ? " " : c}
        </span>
      ))}
    </span>
  );
}
