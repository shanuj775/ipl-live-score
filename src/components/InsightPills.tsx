"use client";

import { cn } from "@/lib/utils";

export function InsightPills({
  items,
  tone,
}: {
  items: string[];
  tone?: "good" | "bad" | "neutral";
}) {
  const toneCls =
    tone === "good"
      ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-100"
      : tone === "bad"
        ? "border-rose-500/20 bg-rose-500/10 text-rose-100"
        : "border-white/10 bg-white/5 text-white/80";

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((t) => (
        <div
          key={t}
          className={cn(
            "rounded-full border px-3 py-1 text-xs leading-5 backdrop-blur-sm",
            toneCls
          )}
        >
          {t}
        </div>
      ))}
    </div>
  );
}

