import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, Target, Trophy, Users, Zap, ChevronRight, Check } from "lucide-react";

const steps = [
  {
    icon: TrendingUp,
    title: "WELCOME TO POGRO",
    subtitle: "Fantasy Investing",
    description: "Compete with friends in weekly head-to-head matchups based on real portfolio growth. Keep every dollar you invest.",
    accent: "primary" as const,
  },
  {
    icon: Target,
    title: "SET YOUR LINEUP",
    subtitle: "Diversity Wins",
    description: "Build a diversified portfolio across sectors. Better diversification earns scoring bonuses — poor diversity means penalties.",
    accent: "bonus" as const,
  },
  {
    icon: Trophy,
    title: "WIN YOUR MATCHUP",
    subtitle: "Weekly Battles",
    description: "Each week you're matched 1v1. The player with the higher adjusted portfolio growth wins. Climb the standings and make playoffs.",
    accent: "xp" as const,
  },
  {
    icon: Users,
    title: "PLAY WITH FRIENDS",
    subtitle: "Social Investing",
    description: "Talk trash, share trades, and compete in private leagues. All trades happen on Robinhood — this app is your game layer.",
    accent: "gain" as const,
  },
];

const accentMap = {
  primary: { bg: "bg-primary", text: "text-primary", glow: "glow-primary" },
  bonus: { bg: "bg-bonus", text: "text-bonus", glow: "" },
  xp: { bg: "bg-xp", text: "text-xp", glow: "glow-xp" },
  gain: { bg: "bg-gain", text: "text-gain", glow: "glow-gain" },
};

interface OnboardingProps {
  onComplete: () => void;
}

const Onboarding = ({ onComplete }: OnboardingProps) => {
  const [step, setStep] = useState(0);
  const current = steps[step];
  const colors = accentMap[current.accent];
  const isLast = step === steps.length - 1;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-between bg-background px-6 py-12 safe-area-bottom">
      {/* Progress dots */}
      <div className="flex items-center gap-2">
        {steps.map((_, i) => (
          <div
            key={i}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === step ? `w-6 ${colors.bg}` : i < step ? "w-1.5 bg-primary/50" : "w-1.5 bg-secondary"
            }`}
          />
        ))}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="flex flex-col items-center text-center"
        >
          <div className={`flex h-20 w-20 items-center justify-center rounded-2xl ${colors.bg}/15 mb-6 ${colors.glow}`}>
            <current.icon className={`h-10 w-10 ${colors.text}`} />
          </div>
          <p className={`text-[10px] font-bold tracking-widest ${colors.text} mb-2`}>
            {current.subtitle}
          </p>
          <h2 className="font-display text-2xl font-bold text-foreground mb-3 tracking-wide">
            {current.title}
          </h2>
          <p className="text-sm text-muted-foreground max-w-[300px] leading-relaxed">
            {current.description}
          </p>
        </motion.div>
      </AnimatePresence>

      {/* Actions */}
      <div className="w-full max-w-sm space-y-3">
        <button
          onClick={() => (isLast ? onComplete() : setStep(s => s + 1))}
          className={`flex w-full items-center justify-center gap-2 rounded-2xl ${colors.bg} py-4 font-display text-sm font-bold text-primary-foreground active:opacity-80`}
        >
          {isLast ? (
            <>
              <Check className="h-4 w-4" />
              LET'S GO
            </>
          ) : (
            <>
              NEXT
              <ChevronRight className="h-4 w-4" />
            </>
          )}
        </button>
        {!isLast && (
          <button
            onClick={onComplete}
            className="w-full py-2 text-xs text-muted-foreground font-medium active:text-foreground"
          >
            Skip intro
          </button>
        )}
      </div>
    </div>
  );
};

export default Onboarding;
