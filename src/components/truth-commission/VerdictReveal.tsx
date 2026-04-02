import { useState, useEffect } from "react";
import { VerdictBadge } from "./VerdictBadge";

interface VerdictRevealProps {
  verdict: string;
  reasoning: string;
  onComplete?: () => void;
}

export function VerdictReveal({ verdict, reasoning, onComplete }: VerdictRevealProps) {
  const [phase, setPhase] = useState<"blank" | "stamp" | "reasoning">("blank");
  const [visibleParagraphs, setVisibleParagraphs] = useState(0);

  const paragraphs = reasoning.split(". ").filter(Boolean).map(p => p.endsWith(".") ? p : p + ".");

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("stamp"), 500);
    const t2 = setTimeout(() => setPhase("reasoning"), 1800);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  useEffect(() => {
    if (phase !== "reasoning") return;
    if (visibleParagraphs >= paragraphs.length) {
      onComplete?.();
      return;
    }
    const t = setTimeout(() => setVisibleParagraphs(v => v + 1), 400);
    return () => clearTimeout(t);
  }, [phase, visibleParagraphs, paragraphs.length, onComplete]);

  return (
    <div className="flex flex-col items-center py-12 px-4">
      {phase === "blank" && (
        <div className="h-48 flex items-center justify-center">
          <div className="w-12 h-12 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      )}

      {(phase === "stamp" || phase === "reasoning") && (
        <div className="animate-gavel-stamp mb-8">
          <VerdictBadge verdict={verdict} size="xl" />
        </div>
      )}

      {phase === "reasoning" && (
        <div className="max-w-2xl w-full space-y-4 mt-4">
          <p className="text-center text-xs font-mono text-primary/70 tracking-widest uppercase mb-6">
            ⚖ This record is now permanent and searchable
          </p>
          {paragraphs.map((p, i) => (
            <p key={i} className={`text-sm text-muted-foreground leading-relaxed transition-all duration-500 ${i < visibleParagraphs ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
              {p}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
