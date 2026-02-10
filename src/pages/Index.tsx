import LeagueHeader from "@/components/LeagueHeader";
import WeeklyMatchups from "@/components/WeeklyMatchups";
import Standings from "@/components/Standings";

const Index = () => {
  return (
    <div className="min-h-screen bg-background pb-24">
      <LeagueHeader />
      <main className="px-4 py-5 space-y-6 max-w-2xl mx-auto">
        <WeeklyMatchups />
        <Standings />
      </main>
    </div>
  );
};

export default Index;
