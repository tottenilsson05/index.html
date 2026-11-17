"use client";
import { useEffect, useState } from "react";
import { nextChristmas } from "@/lib/site";

const pad = (n: number) => String(n).padStart(2, "0");

/** Counts down to 25 Dec 00:00 UTC — the same moment for every visitor worldwide. */
export default function Countdown() {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  let body: React.ReactNode = "--";
  if (now !== null) {
    const { target, isChristmas } = nextChristmas(now);
    if (isChristmas) body = "Merry Christmas";
    else {
      const d = target - now;
      body = (
        <>
          {Math.floor(d / 864e5)}<i>d</i>
          {pad(Math.floor(d / 36e5) % 24)}<i>h</i>
          {pad(Math.floor(d / 6e4) % 60)}<i>m</i>
          {pad(Math.floor(d / 1e3) % 60)}<i>s</i>
        </>
      );
    }
  }

  return (
    <div className="count" title="25 December, 00:00 UTC" aria-label="Countdown to 25 December 00:00 UTC">
      <b>Until Christmas Together</b>
      <span className="t" suppressHydrationWarning>{body}</span>
    </div>
  );
}
