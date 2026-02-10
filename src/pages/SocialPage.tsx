import { useState } from "react";
import LeagueHeader from "@/components/LeagueHeader";
import { activityFeed, ActivityItem } from "@/data/mockData";
import { MessageCircle, Send, TrendingUp, Award, DollarSign, AlertTriangle, Repeat } from "lucide-react";

const ACTIVITY_ICONS: Record<ActivityItem["type"], React.ReactNode> = {
  trade: <Repeat className="h-3.5 w-3.5 text-bonus" />,
  matchup_result: <TrendingUp className="h-3.5 w-3.5 text-gain" />,
  deposit: <DollarSign className="h-3.5 w-3.5 text-primary" />,
  badge: <Award className="h-3.5 w-3.5 text-xp" />,
  trash_talk: <MessageCircle className="h-3.5 w-3.5 text-foreground" />,
  lineup_alert: <AlertTriangle className="h-3.5 w-3.5 text-warning" />,
};

const ACTIVITY_BG: Record<ActivityItem["type"], string> = {
  trade: "bg-bonus/10",
  matchup_result: "bg-gain/10",
  deposit: "bg-primary/10",
  badge: "bg-xp/10",
  trash_talk: "bg-secondary",
  lineup_alert: "bg-warning/10",
};

const SocialPage = () => {
  const [message, setMessage] = useState("");
  const [filter, setFilter] = useState<"all" | "chat" | "activity">("all");

  const filtered = filter === "all" ? activityFeed
    : filter === "chat" ? activityFeed.filter(a => a.type === "trash_talk")
    : activityFeed.filter(a => a.type !== "trash_talk");

  return (
    <div className="min-h-screen bg-background pb-24">
      <LeagueHeader />
      <main className="mx-auto max-w-2xl px-4 py-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-primary" />
            League Feed
          </h2>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2">
          {(["all", "chat", "activity"] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full px-3 py-1 text-xs font-bold capitalize transition-colors ${
                filter === f ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Activity Feed */}
        <div className="space-y-2">
          {filtered.map(item => (
            <div key={item.id} className={`rounded-xl border border-border ${ACTIVITY_BG[item.type]} p-3`}>
              <div className="flex items-start gap-2.5">
                <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-secondary">
                  {ACTIVITY_ICONS[item.type]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-bold text-foreground">{item.teamName}</p>
                    <span className="text-[10px] text-muted-foreground">· {item.timestamp}</span>
                  </div>
                  <p className="mt-0.5 text-[12px] text-foreground/80 leading-relaxed">{item.message}</p>
                </div>
                {item.emoji && <span className="text-lg">{item.emoji}</span>}
              </div>
            </div>
          ))}
        </div>

        {/* Chat Input */}
        <div className="fixed bottom-16 left-0 right-0 border-t border-border bg-card/95 backdrop-blur-lg px-4 py-3">
          <div className="mx-auto max-w-2xl flex items-center gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Talk trash..."
              className="flex-1 rounded-full bg-secondary px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/50"
            />
            <button className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground active:bg-primary/80">
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SocialPage;
