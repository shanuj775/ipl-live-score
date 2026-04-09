import { NextResponse } from "next/server";
import { getCricbuzzRapidApiConfig } from "@/lib/env";
import { fetchIPLLiveMatch, fetchScorecard, fetchCommentaryBestEffort } from "@/lib/cricbuzz";

export const runtime = "nodejs";

export async function GET() {
  try {
    const cfg = getCricbuzzRapidApiConfig();
    const match = await fetchIPLLiveMatch(cfg);
    const scorecard = await fetchScorecard(cfg, match);

    // Optional: if user configures a commentary endpoint template, merge it in.
    const commentaryRaw = await fetchCommentaryBestEffort(cfg, match.matchId);
    if (commentaryRaw && !scorecard.commentary?.length) {
      // Try to normalize if it uses common names
      const lines: any[] =
        commentaryRaw?.commentaryList ??
        commentaryRaw?.commentaryLines ??
        commentaryRaw?.commLines ??
        [];
      scorecard.commentary = lines
        .slice(0, 30)
        .map((c) => ({
          over: c?.overNumber ? String(c.overNumber) : c?.over ? String(c.over) : undefined,
          text: String(c?.commText ?? c?.commentary ?? c?.text ?? "").trim(),
          isWicket: Boolean(c?.wicketInfo),
          isFour: String(c?.event ?? "").toLowerCase().includes("four"),
          isSix: String(c?.event ?? "").toLowerCase().includes("six"),
        }))
        .filter((c) => c.text.length > 0);
    }

    return NextResponse.json(
      { ok: true, data: scorecard },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (e: any) {
    return NextResponse.json(
      {
        ok: false,
        error: e?.message ?? "Unknown error",
      },
      { status: 500 }
    );
  }
}

