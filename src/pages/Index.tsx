import LeagueHeader from "@/components/LeagueHeader";
import WeeklyMatchups from "@/components/WeeklyMatchups";
import Standings from "@/components/Standings";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <LeagueHeader />
      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <WeeklyMatchups />
          </div>
          <div className="lg:col-span-2">
            <Standings />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
