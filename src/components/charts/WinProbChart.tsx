"use client";

import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export type WinProbPoint = { t: number; winProb: number };

export function WinProbChart({ data }: { data: WinProbPoint[] }) {
  return (
    <div className="h-28 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 6, right: 10, bottom: 0, left: -22 }}>
          <defs>
            <linearGradient id="winprob" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22c55e" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#22c55e" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="t"
            tick={false}
            axisLine={false}
            tickLine={false}
            type="number"
            domain={["dataMin", "dataMax"]}
          />
          <YAxis
            domain={[0, 100]}
            tick={false}
            axisLine={false}
            tickLine={false}
            width={0}
          />
          <Tooltip
            cursor={{ stroke: "rgba(255,255,255,0.15)", strokeWidth: 1 }}
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const v = payload[0]?.value;
              if (typeof v !== "number") return null;
              return (
                <div className="rounded-lg border border-white/10 bg-black/80 px-3 py-2 text-xs text-white/90 backdrop-blur">
                  Win probability: <span className="font-semibold text-white">{Math.round(v)}%</span>
                </div>
              );
            }}
          />
          <Area
            type="monotone"
            dataKey="winProb"
            stroke="#22c55e"
            strokeWidth={2}
            fill="url(#winprob)"
            dot={false}
            isAnimationActive={true}
            animationDuration={350}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

