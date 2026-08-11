"use client";

import { useEffect, useState } from "react";

type Status = "checking" | "up" | "down";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export function ApiStatus() {
  const [status, setStatus] = useState<Status>("checking");

  useEffect(() => {
    let cancelled = false;

    fetch(`${API_URL}/health`)
      .then((res) => (res.ok ? setStatus("up") : setStatus("down")))
      .catch(() => {
        if (!cancelled) setStatus("down");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const dotClass =
    status === "up" ? "bg-green-500" : status === "down" ? "bg-red-400" : "bg-muted animate-pulse";

  const label =
    status === "up"
      ? `API connected — ${API_URL}`
      : status === "down"
        ? `API unreachable — ${API_URL}`
        : "Checking API connection…";

  return (
    <div className="flex items-center gap-2 rounded-full border border-line bg-white px-4 py-2 text-sm text-muted">
      <span className={`h-2 w-2 shrink-0 rounded-full ${dotClass}`} />
      {label}
    </div>
  );
}
