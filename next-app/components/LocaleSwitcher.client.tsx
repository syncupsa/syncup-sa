"use client";
import React, { useState, useTransition } from "react";

interface Props {
  locales: string[];
  current: string;
}

export default function LocaleSwitcher({ locales, current }: Props) {
  const [isPending, startTransition] = useTransition();
  const [active, setActive] = useState(current);

  function changeLocale(l: string) {
    startTransition(() => {
      setActive(l);
      // Use native URL update for edge-friendly routing.
      const url = new URL(window.location.href);
      url.searchParams.set("lang", l);
      window.history.replaceState({}, "", url.toString());
    });
  }

  return (
    <div style={{ display: "flex", gap: 8 }}>
      {locales.map((l) => (
        <button
          key={l}
          disabled={isPending}
          onClick={() => changeLocale(l)}
          aria-pressed={active === l}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
