export type ParsedScore = {
  runs?: number;
  wickets?: number;
  overs?: number; // decimal overs (e.g. 15.2 -> 15 + 2/6)
  balls?: number;
};

export function parseScoreString(score?: string): ParsedScore {
  // Formats often look like:
  // "123/4 (15.2)" or "123/4 (15)" or "123 (15.2)"
  if (!score) return {};
  const s = score.trim();

  const rwMatch = s.match(/^(\d+)(?:\/(\d+))?/);
  const runs = rwMatch ? Number(rwMatch[1]) : undefined;
  const wickets = rwMatch && rwMatch[2] != null ? Number(rwMatch[2]) : undefined;

  const overMatch = s.match(/\(([\d.]+)\)/);
  let overs: number | undefined = undefined;
  let balls: number | undefined = undefined;
  if (overMatch) {
    const raw = overMatch[1];
    const parts = raw.split(".");
    const o = Number(parts[0] ?? 0);
    const b = parts[1] ? Number(parts[1]) : 0;
    if (Number.isFinite(o) && Number.isFinite(b)) {
      overs = o + b / 6;
      balls = o * 6 + b;
    }
  }

  return { runs, wickets, overs, balls };
}

