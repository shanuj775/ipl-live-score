"use client";

import { Card, CardBody, CardHeader } from "./ui/Card";

export function PlayersTables({
  batsmen,
  bowlers,
}: {
  batsmen:
    | Array<{
        name: string;
        runs?: number;
        balls?: number;
        fours?: number;
        sixes?: number;
        strikeRate?: number;
        outDesc?: string;
      }>
    | undefined;
  bowlers:
    | Array<{
        name: string;
        overs?: string;
        maidens?: number;
        runs?: number;
        wickets?: number;
        econ?: number;
      }>
    | undefined;
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader title="Batters" subtitle="Current innings snapshot" />
        <CardBody className="pt-3">
          {!batsmen?.length ? (
            <div className="text-sm text-white/60">Batting card not available from API.</div>
          ) : (
            <div className="overflow-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-xs text-white/50">
                  <tr>
                    <th className="pb-2 font-medium">Batter</th>
                    <th className="pb-2 text-right font-medium">R</th>
                    <th className="pb-2 text-right font-medium">B</th>
                    <th className="pb-2 text-right font-medium">4s</th>
                    <th className="pb-2 text-right font-medium">6s</th>
                    <th className="pb-2 text-right font-medium">SR</th>
                  </tr>
                </thead>
                <tbody className="text-white/85">
                  {batsmen.slice(0, 11).map((b) => (
                    <tr key={b.name} className="border-t border-white/10">
                      <td className="py-2 pr-3">
                        <div className="font-medium">{b.name}</div>
                        {b.outDesc ? (
                          <div className="text-xs text-white/50">{b.outDesc}</div>
                        ) : null}
                      </td>
                      <td className="py-2 text-right tabular-nums">{b.runs ?? "—"}</td>
                      <td className="py-2 text-right tabular-nums">{b.balls ?? "—"}</td>
                      <td className="py-2 text-right tabular-nums">{b.fours ?? "—"}</td>
                      <td className="py-2 text-right tabular-nums">{b.sixes ?? "—"}</td>
                      <td className="py-2 text-right tabular-nums">
                        {b.strikeRate != null ? b.strikeRate.toFixed(1) : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Bowlers" subtitle="Current spell snapshot" />
        <CardBody className="pt-3">
          {!bowlers?.length ? (
            <div className="text-sm text-white/60">Bowling figures not available from API.</div>
          ) : (
            <div className="overflow-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-xs text-white/50">
                  <tr>
                    <th className="pb-2 font-medium">Bowler</th>
                    <th className="pb-2 text-right font-medium">O</th>
                    <th className="pb-2 text-right font-medium">R</th>
                    <th className="pb-2 text-right font-medium">W</th>
                    <th className="pb-2 text-right font-medium">Econ</th>
                  </tr>
                </thead>
                <tbody className="text-white/85">
                  {bowlers.slice(0, 11).map((b) => (
                    <tr key={b.name} className="border-t border-white/10">
                      <td className="py-2 pr-3 font-medium">{b.name}</td>
                      <td className="py-2 text-right tabular-nums">{b.overs ?? "—"}</td>
                      <td className="py-2 text-right tabular-nums">{b.runs ?? "—"}</td>
                      <td className="py-2 text-right tabular-nums">{b.wickets ?? "—"}</td>
                      <td className="py-2 text-right tabular-nums">
                        {b.econ != null ? b.econ.toFixed(1) : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}

