"use client";

import { useMemo } from "react";
import { Activity, AlertTriangle, Clock, RefreshCcw } from "lucide-react";
import type { NormalizedScorecard } from "@/lib/cricbuzz";
import { computeInsights } from "@/lib/insights";
import { cn } from "@/lib/utils";
import { useLiveScore } from "@/hooks/useLiveScore";
import { Card, CardBody, CardHeader } from "./ui/Card";
import { InsightPills } from "./InsightPills";
import { WinProbChart } from "./charts/WinProbChart";
import { PlayersTables } from "./PlayersTables";
import { CommentaryFeed } from "./CommentaryFeed";

export function LiveScoreApp() {
  const { data, error, loading, lastUpdatedAt, history } = useLiveScore<NormalizedScorecard>({
    refreshMs: 15_000,
  });

  const insights = useMemo(() => (data ? computeInsights(data) : null), [data]);

  const winProbSeries = useMemo(() => {
    return history
      .map((h) => {
        try {
          const ins = computeInsights(h.data);
          if (ins.winProbBatting == null) return null;
          return { t: h.t, winProb: ins.winProbBatting };
        } catch {
          return null;
        }
      })
      .filter(Boolean) as Array<{ t: number; winProb: number }>;
  }, [history]);

  const updatedLabel = lastUpdatedAt
    ? new Date(lastUpdatedAt).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })
    : "—";

  return (
    <div className="min-h-screen bg-[#05060a] text-white">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(1200px_circle_at_20%_-10%,rgba(99,102,241,0.35),transparent_55%),radial-gradient(900px_circle_at_80%_0%,rgba(34,197,94,0.25),transparent_50%),radial-gradient(1000px_circle_at_50%_110%,rgba(236,72,153,0.22),transparent_55%)]" />

      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-8">
        <div>
          <div className="flex items-center gap-2 text-sm text-white/60">
            <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_18px_rgba(16,185,129,0.9)]" />
            Live IPL scorecard
          </div>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">Living Scorecard</h1>
          <p className="mt-1 text-sm text-white/55">
            Real-time insights + visualizations, refreshing every 15 seconds.
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs text-white/55">
          <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 backdrop-blur-sm sm:flex">
            <Clock className="h-4 w-4" />
            Updated {updatedLabel}
          </div>
          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 backdrop-blur-sm">
            <RefreshCcw className={cn("h-4 w-4", loading ? "animate-spin" : "")} />
            Auto
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl space-y-4 px-6 pb-12">
        {error ? (
          <Card className="border-rose-500/20 bg-rose-500/10">
            <CardHeader title="Couldn’t load live score" right={<AlertTriangle className="h-5 w-5 text-rose-200" />} />
            <CardBody>
              <div className="text-sm text-rose-100/90">{error}</div>
              <div className="mt-3 text-xs text-rose-100/70">
                Tip: ensure <code className="rounded bg-black/30 px-1">RAPIDAPI_KEY</code> is set in{" "}
                <code className="rounded bg-black/30 px-1">.env.local</code>.
              </div>
            </CardBody>
          </Card>
        ) : null}

        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader
              title={
                data
                  ? `${data.match.team1?.shortName ?? data.match.team1?.name ?? "Team 1"} vs ${
                      data.match.team2?.shortName ?? data.match.team2?.name ?? "Team 2"
                    }`
                  : "Loading match…"
              }
              subtitle={data ? data.match.matchDesc ?? data.match.venue : "Finding the current IPL live match"}
              right={
                <div className="flex items-center gap-2 text-xs text-white/60">
                  <Activity className="h-4 w-4 text-emerald-300" />
                  LIVE
                </div>
              }
            />
            <CardBody>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="text-xs text-white/55">
                    {data?.match.team1?.shortName ?? data?.match.team1?.name ?? "Team 1"}
                  </div>
                  <div className="mt-1 text-2xl font-semibold tabular-nums">
                    {data?.match.team1?.score ?? "—"}
                  </div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="text-xs text-white/55">
                    {data?.match.team2?.shortName ?? data?.match.team2?.name ?? "Team 2"}
                  </div>
                  <div className="mt-1 text-2xl font-semibold tabular-nums">
                    {data?.match.team2?.score ?? "—"}
                  </div>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <div className="text-sm text-white/75">{insights?.headline ?? "…"}</div>
                <div className="flex items-center gap-2 text-xs">
                  {insights?.currentRunRate != null ? (
                    <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-white/70">
                      CRR{" "}
                      <span className="font-semibold text-white">{insights.currentRunRate}</span>
                    </div>
                  ) : null}
                  {insights?.requiredRunRate != null ? (
                    <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-white/70">
                      RRR{" "}
                      <span className="font-semibold text-white">{insights.requiredRunRate}</span>
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="mt-4">
                <InsightPills
                  items={insights?.keyMoments ?? ["Waiting for live data…"]}
                  tone={
                    insights?.momentum === "batting"
                      ? "good"
                      : insights?.momentum === "bowling"
                        ? "bad"
                        : "neutral"
                  }
                />
              </div>

              {winProbSeries.length ? (
                <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-medium text-white/70">Win probability trend</div>
                    <div className="text-xs text-white/50">updates every 15s</div>
                  </div>
                  <WinProbChart data={winProbSeries} />
                </div>
              ) : (
                <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/60">
                  Win probability trend appears when the match is a chase (target inferred).
                </div>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="AI-style insights" subtitle="Heuristic analysis from live context" />
            <CardBody>
              {!data ? (
                <div className="text-sm text-white/60">Loading…</div>
              ) : (
                <div className="space-y-3 text-sm text-white/75">
                  <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                    <div className="text-xs text-white/50">Pressure meter</div>
                    <div className="mt-1 text-sm">
                      {insights?.momentum === "batting"
                        ? "Batting side are ahead of the required pace."
                        : insights?.momentum === "bowling"
                          ? "Bowling side are applying pressure with the run-rate gap."
                          : "Momentum is balanced right now."}
                    </div>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                    <div className="text-xs text-white/50">What to watch next</div>
                    <ul className="mt-2 list-disc space-y-1 pl-4">
                      <li>Next 12 balls can swing momentum — watch boundaries vs wickets.</li>
                      <li>Compare CRR vs RRR; a +1.0 swing is usually decisive late in T20s.</li>
                      <li>Rotate strike if the pitch slows (dot-ball spikes show up fast).</li>
                    </ul>
                  </div>
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        <PlayersTables batsmen={data?.batsmen} bowlers={data?.bowlers} />
        <CommentaryFeed items={data?.commentary} />
      </main>
    </div>
  );
}

