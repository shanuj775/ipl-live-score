import type { NormalizedScorecard } from "./cricbuzz";
import { parseScoreString } from "./parse";

export type MatchInsights = {
  headline: string;
  winProbBatting?: number; // 0-100
  momentum?: "batting" | "bowling" | "neutral";
  requiredRunRate?: number;
  currentRunRate?: number;
  keyMoments: string[];
};

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

function logistic(x: number): number {
  return 1 / (1 + Math.exp(-x));
}

export function computeInsights(data: NormalizedScorecard): MatchInsights {
  const team1 = data.match.team1?.shortName ?? data.match.team1?.name ?? "Team 1";
  const team2 = data.match.team2?.shortName ?? data.match.team2?.name ?? "Team 2";

  const t1 = parseScoreString(data.match.team1?.score);
  const t2 = parseScoreString(data.match.team2?.score);

  // Attempt to infer innings/order (best-effort).
  // If both teams have scores, assume chasing scenario; otherwise only one batting.
  const bothHaveRuns = t1.runs != null && t2.runs != null;
  const battingTeam = bothHaveRuns ? team2 : t1.runs != null ? team1 : team2;
  const bowlingTeam = battingTeam === team1 ? team2 : team1;

  const batting = battingTeam === team1 ? t1 : t2;
  const bowling = battingTeam === team1 ? t2 : t1;

  const keyMoments: string[] = [];
  const status = data.match.status ?? data.match.state ?? "Live";

  let currentRunRate: number | undefined;
  if (batting.runs != null && batting.overs != null && batting.overs > 0) {
    currentRunRate = Number((batting.runs / batting.overs).toFixed(2));
  }

  // Very rough chase model (T20 assumed at 120 balls). If target unknown, omit RRR.
  const MAX_BALLS = 120;
  let requiredRunRate: number | undefined;
  if (bothHaveRuns && bowling.runs != null && batting.runs != null && batting.balls != null) {
    const target = bowling.runs + 1;
    const ballsLeft = clamp(MAX_BALLS - batting.balls, 0, MAX_BALLS);
    const runsLeft = target - batting.runs;
    if (ballsLeft > 0) {
      requiredRunRate = Number(((runsLeft / ballsLeft) * 6).toFixed(2));
    }
    keyMoments.push(`${battingTeam} need ${Math.max(runsLeft, 0)} off ${ballsLeft} balls.`);
  } else if (batting.runs != null) {
    keyMoments.push(`${battingTeam} are ${batting.runs}${batting.wickets != null ? `/${batting.wickets}` : ""}.`);
  }

  // Momentum via last events in commentary (if available)
  if (data.commentary?.length) {
    const last = data.commentary[0];
    if (last.isWicket) keyMoments.unshift(`Wicket just fell (${last.over ?? "recent"} ov).`);
    if (last.isSix) keyMoments.unshift(`Big hit! SIX (${last.over ?? "recent"} ov).`);
    if (last.isFour) keyMoments.unshift(`Boundary! FOUR (${last.over ?? "recent"} ov).`);
  }

  // Simple "win probability" proxy based on RRR-CRR gap and wickets left.
  // Not a real predictive model; just an engaging real-time indicator.
  let winProbBatting: number | undefined;
  if (requiredRunRate != null && currentRunRate != null) {
    const rrGap = currentRunRate - requiredRunRate; // positive is good for batting
    const wktsLeft = batting.wickets != null ? 10 - batting.wickets : 6;
    const x = rrGap * 0.9 + (wktsLeft - 5) * 0.18;
    winProbBatting = Math.round(clamp(logistic(x) * 100, 1, 99));
  }

  let momentum: MatchInsights["momentum"] = "neutral";
  if (requiredRunRate != null && currentRunRate != null) {
    if (currentRunRate >= requiredRunRate + 1) momentum = "batting";
    else if (currentRunRate <= requiredRunRate - 1) momentum = "bowling";
  }

  const headlineParts: string[] = [];
  headlineParts.push(status);
  if (winProbBatting != null) headlineParts.push(`${battingTeam} win ${winProbBatting}%`);

  return {
    headline: headlineParts.join(" • "),
    winProbBatting,
    momentum,
    requiredRunRate,
    currentRunRate,
    keyMoments: Array.from(new Set(keyMoments)).slice(0, 4),
  };
}

