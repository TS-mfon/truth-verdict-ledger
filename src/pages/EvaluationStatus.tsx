import { useParams } from "react-router-dom";
import { useClaim, useClaimStatus } from "@/hooks/useTruthCommission";
import { StatusTracker } from "@/components/truth-commission/StatusTracker";
import { VerdictReveal } from "@/components/truth-commission/VerdictReveal";
import { Link } from "react-router-dom";

export default function EvaluationStatus() {
  const { id } = useParams<{ id: string }>();
  const { data: status } = useClaimStatus(id || "");
  const { data: claim } = useClaim(id || "");

  const isFinalized = status === "FINALIZED" && claim?.verdict?.verdict;

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-2xl">
        <h1 className="text-2xl font-serif font-bold text-foreground mb-2">Evaluation Status</h1>
        <p className="text-xs font-mono text-muted-foreground mb-8">{id}</p>

        <div className="rounded-lg border border-border bg-card p-6 mb-8">
          <StatusTracker status={status || "PENDING_EVALUATION"} />
        </div>

        {isFinalized && claim?.verdict ? (
          <VerdictReveal
            verdict={claim.verdict.verdict!}
            reasoning={claim.verdict.reasoning || "No reasoning provided."}
          />
        ) : (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Waiting for AI evaluation...</p>
            <p className="text-xs text-muted-foreground mt-1">This may take a few minutes</p>
          </div>
        )}

        {isFinalized && (
          <div className="text-center mt-8">
            <Link to={`/claims/${id}`} className="text-primary text-sm hover:underline">
              View Full Record →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
