import { TrendingUp, DollarSign, Users } from "lucide-react";
import { currentWeek } from "@/data/mockData";

const LeagueHeader = () => {
  return (
    <header className="border-b border-border bg-card">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <TrendingUp className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-wider text-foreground">
                Capital League
              </h1>
              <p className="text-xs text-muted-foreground">Fantasy Investing</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden items-center gap-2 sm:flex">
              <DollarSign className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Weekly Buy-In</p>
                <p className="text-sm font-semibold text-foreground">$50</p>
              </div>
            </div>
            <div className="hidden items-center gap-2 sm:flex">
              <Users className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Members</p>
                <p className="text-sm font-semibold text-foreground">8</p>
              </div>
            </div>
            <div className="rounded-md bg-primary px-3 py-1.5">
              <p className="font-display text-sm font-bold text-primary-foreground">
                WEEK {currentWeek}
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default LeagueHeader;
