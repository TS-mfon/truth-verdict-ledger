interface StatusTrackerProps {
  status: string;
}

const STEPS = [
  { key: "PENDING_EVALUATION", label: "Claim Submitted", desc: "Awaiting evaluation" },
  { key: "EVALUATING", label: "Fetching Evidence", desc: "AI reading sources" },
  { key: "AI_EVALUATING", label: "AI Evaluating", desc: "Assessing veracity" },
  { key: "FINALIZED", label: "Verdict Issued", desc: "Record is permanent" },
];

export function StatusTracker({ status }: StatusTrackerProps) {
  const isReEval = status === "RE-EVALUATING";
  const currentIdx = isReEval ? 2 : STEPS.findIndex(s => s.key === status);
  const activeIdx = currentIdx === -1 ? (status === "FINALIZED" ? 3 : 0) : currentIdx;

  return (
    <div className="space-y-3">
      {isReEval && (
        <p className="text-xs font-mono text-primary px-3 py-1.5 bg-primary/10 rounded-md inline-block mb-2">RE-EVALUATING (rebuttal received)</p>
      )}
      <div className="flex items-center gap-2">
        {STEPS.map((step, i) => {
          const done = i <= activeIdx;
          const active = i === activeIdx && status !== "FINALIZED";
          return (
            <div key={step.key} className="flex items-center gap-2 flex-1">
              <div className="flex flex-col items-center flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${done ? "bg-primary/20 border-primary text-primary" : "border-border text-muted-foreground"} ${active ? "animate-pulse-glow" : ""}`}>
                  {done && i < activeIdx ? "✓" : i + 1}
                </div>
                <p className={`text-xs mt-1.5 font-medium text-center ${done ? "text-foreground" : "text-muted-foreground"}`}>{step.label}</p>
                <p className="text-[10px] text-muted-foreground text-center">{step.desc}</p>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`h-0.5 flex-1 rounded ${i < activeIdx ? "bg-primary" : "bg-border"}`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
