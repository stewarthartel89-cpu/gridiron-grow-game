import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: { label: string; onClick: () => void };
}

const EmptyState = ({ icon: Icon, title, description, action }: EmptyStateProps) => (
  <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary mb-4">
      <Icon className="h-7 w-7 text-muted-foreground" />
    </div>
    <h3 className="font-display text-base font-bold text-foreground mb-1">{title}</h3>
    <p className="text-xs text-muted-foreground max-w-[260px] leading-relaxed">{description}</p>
    {action && (
      <button
        onClick={action.onClick}
        className="mt-4 rounded-xl bg-primary px-5 py-2.5 font-display text-xs font-bold text-primary-foreground active:bg-primary/80"
      >
        {action.label}
      </button>
    )}
  </div>
);

export default EmptyState;
