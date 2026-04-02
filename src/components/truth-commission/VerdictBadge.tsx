import type { VerdictType } from "@/lib/contracts/types";

const VERDICT_CONFIG: Record<VerdictType, { bg: string; text: string; border: string; icon: string }> = {
  TRUE: { bg: "bg-verdict-true-bg", text: "text-verdict-true", border: "border-verdict-true/40", icon: "✓" },
  MOSTLY_TRUE: { bg: "bg-verdict-mostly-true-bg", text: "text-verdict-mostly-true", border: "border-verdict-mostly-true/40", icon: "~✓" },
  MIXED: { bg: "bg-verdict-mixed-bg", text: "text-verdict-mixed", border: "border-verdict-mixed/40", icon: "≈" },
  MOSTLY_FALSE: { bg: "bg-verdict-mostly-false-bg", text: "text-verdict-mostly-false", border: "border-verdict-mostly-false/40", icon: "~✗" },
  FALSE: { bg: "bg-verdict-false-bg", text: "text-verdict-false", border: "border-verdict-false/40", icon: "✗" },
};

interface VerdictBadgeProps {
  verdict?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export function VerdictBadge({ verdict, size = "md", className = "" }: VerdictBadgeProps) {
  const key = (verdict?.toUpperCase() || "MIXED") as VerdictType;
  const style = VERDICT_CONFIG[key] || VERDICT_CONFIG.MIXED;

  const sizeClasses = {
    sm: "text-xs px-2 py-0.5 gap-1",
    md: "text-sm px-3 py-1.5 gap-1.5",
    lg: "text-lg px-5 py-2.5 gap-2 font-extrabold",
    xl: "text-3xl px-8 py-4 gap-3 font-black tracking-wide",
  };

  return (
    <span className={`inline-flex items-center font-bold rounded-full border-2 font-mono uppercase ${style.bg} ${style.text} ${style.border} ${sizeClasses[size]} ${className}`}>
      <span>{style.icon}</span>
      {(verdict || "MIXED").replace(/_/g, " ")}
    </span>
  );
}
