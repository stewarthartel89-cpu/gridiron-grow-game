import { useLocation, useNavigate } from "react-router-dom";
import { Home, Trophy } from "lucide-react";

const tabs = [
  { path: "/", icon: Home, label: "Home" },
  { path: "/league", icon: Trophy, label: "League" },
];

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Hide on certain pages
  if (location.pathname.startsWith("/team/") || location.pathname === "/auth" || location.pathname === "/league-hub") return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-lg" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
      <div className="mx-auto flex max-w-2xl items-center justify-around px-2 py-1">
        {tabs.map(({ path, icon: Icon, label }) => {
          const isActive = location.pathname === path;
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`flex flex-col items-center gap-0.5 rounded-lg px-6 py-1.5 transition-all ${
                isActive
                  ? "text-primary"
                  : "text-muted-foreground active:text-foreground"
              }`}
            >
              <Icon className={`h-5 w-5 ${isActive ? "drop-shadow-[0_0_6px_hsl(var(--primary)/0.5)]" : ""}`} />
              <span className={`text-[10px] font-semibold ${isActive ? "text-primary" : ""}`}>{label}</span>
              {isActive && <div className="h-0.5 w-4 rounded-full bg-primary" />}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
