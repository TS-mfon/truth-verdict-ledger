import { Link } from "react-router-dom";
import type { Claim } from "@/lib/contracts/types";
import { VerdictBadge } from "./VerdictBadge";

interface ClaimCardProps {
  claim: Claim;
}

export function ClaimCard({ claim }: ClaimCardProps) {
  return (
    <Link to={`/claims/${claim.claim_id}`} className="block group">
      <div className="rounded-lg border border-border bg-card p-5 transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-mono text-muted-foreground mb-1">{claim.entity_name}</p>
            <p className="text-sm font-medium text-foreground line-clamp-2 group-hover:text-primary transition-colors">
              "{claim.statement}"
            </p>
          </div>
          {claim.verdict?.verdict && (
            <VerdictBadge verdict={claim.verdict.verdict} size="sm" />
          )}
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="font-mono">{claim.claim_id}</span>
          <span className={`px-2 py-0.5 rounded text-xs font-medium ${claim.status === "FINALIZED" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
            {claim.status}
          </span>
        </div>
      </div>
    </Link>
  );
}
