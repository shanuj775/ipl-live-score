"use client";

import { useEffect, useMemo, useRef, useState } from "react";

export type ApiOk<T> = { ok: true; data: T };
export type ApiErr = { ok: false; error: string };

export function useLiveScore<T>(opts: { refreshMs: number }) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<number | null>(null);
  const historyRef = useRef<Array<{ t: number; data: T }>>([]);

  const history = useMemo(() => historyRef.current, [lastUpdatedAt]);

  useEffect(() => {
    let alive = true;
    let timer: any;

    const tick = async () => {
      try {
        setLoading((v) => v && data == null);
        const res = await fetch("/api/ipl/live-match", { cache: "no-store" });
        const json = (await res.json()) as ApiOk<T> | ApiErr;
        if (!alive) return;
        if (!json.ok) throw new Error(json.error);
        setData(json.data);
        setError(null);
        const now = Date.now();
        setLastUpdatedAt(now);
        historyRef.current = [...historyRef.current, { t: now, data: json.data }].slice(-60);
      } catch (e: any) {
        if (!alive) return;
        setError(e?.message ?? "Failed to load live score.");
      } finally {
        if (!alive) return;
        setLoading(false);
        timer = setTimeout(tick, opts.refreshMs);
      }
    };

    tick();
    return () => {
      alive = false;
      if (timer) clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opts.refreshMs]);

  return { data, error, loading, lastUpdatedAt, history };
}

