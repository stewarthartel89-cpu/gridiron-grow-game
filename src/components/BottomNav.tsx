import { useLocation, useNavigate } from "react-router-dom";
import { Home } from "lucide-react";

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Only show on league-related pages (not home, auth, league-hub, or team detail)
  const showOn = ["/league"];
  const shouldShow = showOn.some((p) => location.pathname === p);
  if (!shouldShow) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-lg" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
      <div className="mx-auto flex max-w-2xl items-center justify-center px-2 py-1">
        <button
          onClick={() => navigate("/")}
          className="flex flex-col items-center gap-0.5 rounded-lg px-6 py-1.5 transition-all text-muted-foreground active:text-foreground"
        >
          <Home className="h-5 w-5" />
          <span className="text-[10px] font-semibold">Home</span>
        </button>
      </div>
    </nav>
  );
};

export default BottomNav;
