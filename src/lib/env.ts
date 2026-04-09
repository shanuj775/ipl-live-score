export function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required environment variable: ${name}`);
  return v;
}

export function optionalEnv(name: string, fallback: string): string {
  return process.env[name] ?? fallback;
}

export type CricbuzzRapidApiConfig = {
  baseUrl: string;
  hostHeader: string;
  apiKey: string;
  liveMatchesPath: string;
  scorecardPathTemplate: string;
  commentaryPathTemplate?: string;
};

export function getCricbuzzRapidApiConfig(): CricbuzzRapidApiConfig {
  const baseUrl = optionalEnv(
    "CRICBUZZ_BASE_URL",
    "https://cricbuzz-cricket.p.rapidapi.com"
  );

  return {
    baseUrl,
    hostHeader: optionalEnv("RAPIDAPI_HOST", "cricbuzz-cricket.p.rapidapi.com"),
    apiKey: requireEnv("RAPIDAPI_KEY"),
    liveMatchesPath: optionalEnv("CRICBUZZ_LIVE_MATCHES_PATH", "/matches/v1/live"),
    scorecardPathTemplate: optionalEnv(
      "CRICBUZZ_SCORECARD_PATH_TEMPLATE",
      "/mcenter/v1/{matchId}/hscard"
    ),
    commentaryPathTemplate: process.env.CRICBUZZ_COMMENTARY_PATH_TEMPLATE,
  };
}

