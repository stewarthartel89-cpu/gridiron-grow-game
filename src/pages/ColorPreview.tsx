import { TrendingUp, Trophy, Shield, ChevronRight } from "lucide-react";

const GREEN_OPTIONS = [
  { name: "Neon / Electric", hsl: "152 100% 45%", hex: "#00E676", desc: "Energetic, fintech" },
  { name: "Emerald / Rich", hsl: "160 84% 39%", hex: "#10B981", desc: "Premium, polished" },
  { name: "Lime / Fresh", hsl: "84 81% 44%", hex: "#84CC16", desc: "Playful, sporty" },
  { name: "Mint / Teal", hsl: "168 76% 50%", hex: "#2DD4BF", desc: "Modern, clean" },
];

const ColorPreview = () => {
  return (
    <div className="min-h-[100dvh] bg-[hsl(220,20%,7%)] p-4 space-y-6 safe-area-top safe-area-bottom">
      <h1 className="font-display text-xl font-bold text-[hsl(210,20%,95%)] text-center tracking-wider pt-2">
        PICK YOUR GREEN
      </h1>
      <p className="text-center text-xs text-[hsl(215,12%,55%)]">Tap to compare — see how each feels</p>

      {GREEN_OPTIONS.map((opt) => (
        <div key={opt.name} className="space-y-3">
          {/* Label */}
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded-full" style={{ background: `hsl(${opt.hsl})` }} />
            <span className="font-display text-sm font-bold text-[hsl(210,20%,95%)] tracking-wider">
              {opt.name}
            </span>
            <span className="text-[10px] text-[hsl(215,12%,55%)]">— {opt.desc}</span>
          </div>

          {/* Mock card */}
          <div className="rounded-xl border border-[hsl(220,14%,16%)] bg-[hsl(220,18%,10%)] p-4 space-y-3">
            {/* Header row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-lg"
                  style={{ background: `hsl(${opt.hsl})`, boxShadow: `0 0 16px hsl(${opt.hsl} / 0.3)` }}
                >
                  <Trophy className="h-4 w-4 text-[hsl(220,20%,7%)]" />
                </div>
                <span className="font-display text-sm font-bold text-[hsl(210,20%,95%)] tracking-wider">
                  STOCK LEAGUE
                </span>
              </div>
              <div className="rounded-md px-2 py-1" style={{ background: `hsl(${opt.hsl})` }}>
                <span className="font-display text-[11px] font-bold text-[hsl(220,20%,7%)]">WK 3/12</span>
              </div>
            </div>

            {/* Stats row */}
            <div className="flex gap-3">
              <div className="flex-1 rounded-lg bg-[hsl(220,16%,16%)] p-2.5">
                <p className="text-[10px] text-[hsl(215,12%,55%)]">Portfolio</p>
                <p className="font-display text-lg font-bold" style={{ color: `hsl(${opt.hsl})` }}>
                  +12.4%
                </p>
              </div>
              <div className="flex-1 rounded-lg bg-[hsl(220,16%,16%)] p-2.5">
                <p className="text-[10px] text-[hsl(215,12%,55%)]">Modifier</p>
                <p className="font-display text-lg font-bold" style={{ color: `hsl(${opt.hsl})` }}>
                  1.00x
                </p>
              </div>
              <div className="flex-1 rounded-lg bg-[hsl(220,16%,16%)] p-2.5">
                <p className="text-[10px] text-[hsl(215,12%,55%)]">Rank</p>
                <p className="font-display text-lg font-bold text-[hsl(210,20%,95%)]">#2</p>
              </div>
            </div>

            {/* Button */}
            <button
              className="flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold text-[hsl(220,20%,7%)]"
              style={{ background: `hsl(${opt.hsl})` }}
            >
              <Shield className="h-4 w-4" />
              View Matchup
              <ChevronRight className="h-4 w-4" />
            </button>

            {/* Progress bar */}
            <div className="h-2 rounded-full bg-[hsl(220,16%,16%)] overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{ width: "72%", background: `hsl(${opt.hsl})` }}
              />
            </div>
          </div>
        </div>
      ))}

      <p className="text-center text-xs text-[hsl(215,12%,55%)] pb-8">
        Tell me which one you like and I'll apply it!
      </p>
    </div>
  );
};

export default ColorPreview;
