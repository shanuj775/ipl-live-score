"use client";

import { Card, CardBody, CardHeader } from "./ui/Card";

export function CommentaryFeed({
  items,
}: {
  items:
    | Array<{
        over?: string;
        text: string;
        isWicket?: boolean;
        isFour?: boolean;
        isSix?: boolean;
      }>
    | undefined;
}) {
  return (
    <Card>
      <CardHeader title="Ball-by-ball" subtitle="Auto-updating feed (best-effort from API)" />
      <CardBody className="pt-3">
        {!items?.length ? (
          <div className="text-sm text-white/60">
            Commentary is not available from your current API endpoint configuration.
          </div>
        ) : (
          <div className="max-h-[360px] space-y-2 overflow-auto pr-2">
            {items.map((c, idx) => (
              <div
                key={`${c.over ?? "x"}-${idx}`}
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-2"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="text-xs text-white/50">Over {c.over ?? "—"}</div>
                  <div className="flex items-center gap-2 text-[11px]">
                    {c.isWicket ? (
                      <span className="rounded-md bg-rose-500/15 px-2 py-0.5 text-rose-100">
                        W
                      </span>
                    ) : null}
                    {c.isFour ? (
                      <span className="rounded-md bg-sky-500/15 px-2 py-0.5 text-sky-100">
                        4
                      </span>
                    ) : null}
                    {c.isSix ? (
                      <span className="rounded-md bg-emerald-500/15 px-2 py-0.5 text-emerald-100">
                        6
                      </span>
                    ) : null}
                  </div>
                </div>
                <div className="mt-1 text-sm leading-6 text-white/85">{c.text}</div>
              </div>
            ))}
          </div>
        )}
      </CardBody>
    </Card>
  );
}

