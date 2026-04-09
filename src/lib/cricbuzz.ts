import { CricbuzzRapidApiConfig } from "./env";

type AnyObj = Record<string, any>;

function safeLower(s: unknown): string {
  return typeof s === "string" ? s.toLowerCase() : "";
}

function includesIPL(seriesName: unknown): boolean {
  const s = safeLower(seriesName);
  return s.includes("indian premier league") || s === "ipl" || s.includes("ipl ");
}

export type LiveMatchSummary = {
  matchId: number;
  seriesName?: string;
  matchDesc?: string;
  status?: string;
  state?: string;
  team1?: { name?: string; shortName?: string; score?: string };
  team2?: { name?: string; shortName?: string; score?: string };
  startDate?: string;
  venue?: string;
};

export type NormalizedScorecard = {
  match: LiveMatchSummary;
  raw: any;
  innings?: Array<{
    battingTeam?: string;
    runs?: number;
    wickets?: number;
    overs?: string;
    runRate?: string;
    isComplete?: boolean;
  }>;
  batsmen?: Array<{
    name: string;
    runs?: number;
    balls?: number;
    fours?: number;
    sixes?: number;
    strikeRate?: number;
    outDesc?: string;
  }>;
  bowlers?: Array<{
    name: string;
    overs?: string;
    maidens?: number;
    runs?: number;
    wickets?: number;
    econ?: number;
  }>;
  commentary?: Array<{
    over?: string;
    text: string;
    isWicket?: boolean;
    isFour?: boolean;
    isSix?: boolean;
  }>;
};

async function rapidFetch<T>(
  cfg: CricbuzzRapidApiConfig,
  path: string
): Promise<T> {
  const url = `${cfg.baseUrl}${path}`;
  const res = await fetch(url, {
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      "x-rapidapi-key": cfg.apiKey,
      "x-rapidapi-host": cfg.hostHeader,
    },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`RapidAPI error (${res.status}) for ${path}: ${text}`);
  }
  return (await res.json()) as T;
}

function pickFirstIPLLiveMatch(data: any): AnyObj | null {
  // Cricbuzz structure tends to be:
  // { typeMatches: [{ seriesMatches: [{ seriesAdWrapper: { seriesName, matches: [...] } }]}]}
  const typeMatches: any[] = data?.typeMatches ?? [];
  for (const tm of typeMatches) {
    const seriesMatches: any[] = tm?.seriesMatches ?? [];
    for (const sm of seriesMatches) {
      const wrapper = sm?.seriesAdWrapper;
      if (!includesIPL(wrapper?.seriesName)) continue;
      const matches: any[] = wrapper?.matches ?? [];

      // Prefer "In Progress" if present
      const inProgress =
        matches.find((m) => safeLower(m?.matchInfo?.state) === "in progress") ??
        matches.find((m) => safeLower(m?.matchInfo?.status) === "in progress");

      return inProgress ?? matches[0] ?? null;
    }
  }
  return null;
}

function fmtScore(scoreObj: any): string | undefined {
  // Usually { runs, wickets, overs }
  const r = scoreObj?.runs;
  const w = scoreObj?.wickets;
  const o = scoreObj?.overs;
  if (r == null) return undefined;
  const rw = w != null ? `${r}/${w}` : `${r}`;
  return o != null ? `${rw} (${o})` : rw;
}

function normalizeLiveMatchSummary(matchNode: AnyObj): LiveMatchSummary {
  const matchInfo = matchNode?.matchInfo ?? {};
  const matchScore = matchNode?.matchScore ?? {};

  const t1 = matchInfo?.team1 ?? {};
  const t2 = matchInfo?.team2 ?? {};

  // team score shapes vary; support a few known ones
  const t1Score = fmtScore(matchScore?.team1Score?.inngs1) ?? fmtScore(matchScore?.team1Score);
  const t2Score = fmtScore(matchScore?.team2Score?.inngs1) ?? fmtScore(matchScore?.team2Score);

  const matchId = Number(matchInfo?.matchId ?? matchNode?.matchId);
  if (!Number.isFinite(matchId)) throw new Error("Unable to determine matchId from live matches response.");

  return {
    matchId,
    seriesName: matchNode?.seriesName ?? matchInfo?.seriesName,
    matchDesc: matchInfo?.matchDesc,
    status: matchInfo?.status,
    state: matchInfo?.state,
    team1: {
      name: t1?.teamName,
      shortName: t1?.teamSName,
      score: t1Score,
    },
    team2: {
      name: t2?.teamName,
      shortName: t2?.teamSName,
      score: t2Score,
    },
    startDate: matchInfo?.startDate,
    venue: matchInfo?.venueInfo?.ground,
  };
}

function tpl(template: string, params: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => String(params[key]));
}

function normalizeScorecard(raw: any, match: LiveMatchSummary): NormalizedScorecard {
  const scoreCard = raw?.scoreCard ?? raw?.scorecard ?? raw;
  const inningsRaw: any[] =
    scoreCard?.inningsScoreList ?? scoreCard?.inningsScorecards ?? scoreCard?.innings ?? [];

  const innings = inningsRaw
    .map((inn) => ({
      battingTeam:
        inn?.batTeamDetails?.batTeamName ??
        inn?.batTeamName ??
        inn?.battingTeamName,
      runs: inn?.score ?? inn?.runs,
      wickets: inn?.wickets,
      overs: String(inn?.overs ?? inn?.ovr ?? ""),
      runRate: inn?.runRate ? String(inn?.runRate) : undefined,
      isComplete: Boolean(inn?.isDeclared) || Boolean(inn?.isComplete),
    }))
    .filter((i) => i.battingTeam || i.runs != null);

  // Current innings batsmen/bowlers are often under:
  // raw.scoreCard[0].batTeamDetails?.batsmenData and bowlTeamDetails?.bowlersData
  const firstCard = Array.isArray(scoreCard?.scoreCard)
    ? scoreCard.scoreCard[0]
    : scoreCard?.scoreCard?.[0];

  const batsmenData = firstCard?.batTeamDetails?.batsmenData ?? {};
  const bowlersData = firstCard?.bowlTeamDetails?.bowlersData ?? {};

  const batsmen = Object.values(batsmenData)
    .map((b: any) => ({
      name: b?.batName ?? b?.name,
      runs: b?.runs,
      balls: b?.balls,
      fours: b?.fours,
      sixes: b?.sixes,
      strikeRate: b?.strikeRate,
      outDesc: b?.outDesc,
    }))
    .filter((b) => typeof b.name === "string" && b.name.length > 0);

  const bowlers = Object.values(bowlersData)
    .map((b: any) => ({
      name: b?.bowlName ?? b?.name,
      overs: b?.overs ? String(b?.overs) : undefined,
      maidens: b?.maidens,
      runs: b?.runs,
      wickets: b?.wickets,
      econ: b?.economy,
    }))
    .filter((b) => typeof b.name === "string" && b.name.length > 0);

  const commentaryLines: any[] =
    raw?.commentaryList ?? raw?.commentaryLines ?? raw?.commLines ?? [];
  const commentary = commentaryLines
    .slice(0, 30)
    .map((c) => ({
      over: c?.overNumber ? String(c.overNumber) : c?.over ? String(c.over) : undefined,
      text: String(c?.commText ?? c?.commentary ?? c?.text ?? "").trim(),
      isWicket: Boolean(c?.wicketInfo),
      isFour: safeLower(c?.event)?.includes("four"),
      isSix: safeLower(c?.event)?.includes("six"),
    }))
    .filter((c) => c.text.length > 0);

  return { match, raw, innings, batsmen, bowlers, commentary };
}

export async function fetchIPLLiveMatch(
  cfg: CricbuzzRapidApiConfig
): Promise<LiveMatchSummary> {
  const data = await rapidFetch<any>(cfg, cfg.liveMatchesPath);
  const matchNode = pickFirstIPLLiveMatch(data);
  if (!matchNode) throw new Error("No IPL match found in the live matches feed.");
  return normalizeLiveMatchSummary(matchNode);
}

export async function fetchScorecard(
  cfg: CricbuzzRapidApiConfig,
  match: LiveMatchSummary
): Promise<NormalizedScorecard> {
  const scorePath = tpl(cfg.scorecardPathTemplate, { matchId: match.matchId });
  const raw = await rapidFetch<any>(cfg, scorePath);
  return normalizeScorecard(raw, match);
}

export async function fetchCommentaryBestEffort(
  cfg: CricbuzzRapidApiConfig,
  matchId: number
): Promise<any | null> {
  if (!cfg.commentaryPathTemplate) return null;
  try {
    const path = tpl(cfg.commentaryPathTemplate, { matchId });
    return await rapidFetch<any>(cfg, path);
  } catch {
    return null;
  }
}

