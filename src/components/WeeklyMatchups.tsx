import { weeklyMatchups, currentWeek } from "@/data/mockData";
import MatchupCard from "./MatchupCard";

const WeeklyMatchups = () => {
  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">
          Week {currentWeek} Matchups
        </h2>
        <span className="rounded bg-primary/10 px-2 py-1 text-xs font-semibold text-primary">
          LIVE
        </span>
      </div>
      <div className="grid gap-3">
        {weeklyMatchups.map((matchup) => (
          <MatchupCard key={matchup.id} matchup={matchup} />
        ))}
      </div>
    </section>
  );
};

export default WeeklyMatchups;
