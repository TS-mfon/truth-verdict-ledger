import { useParams } from "react-router-dom";
import { useEntityClaims, useEntityRatingDistribution } from "@/hooks/useTruthCommission";
import { ClaimCard } from "@/components/truth-commission/ClaimCard";
import { VerdictBadge } from "@/components/truth-commission/VerdictBadge";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import type { VerdictType } from "@/lib/contracts/types";

const VERDICT_ORDER: VerdictType[] = ["FALSE", "MOSTLY_FALSE", "MIXED", "MOSTLY_TRUE", "TRUE"];

export default function EntityProfile() {
  const { name } = useParams<{ name: string }>();
  const entityName = decodeURIComponent(name || "");
  const { data: claims = [], isLoading } = useEntityClaims(entityName);
  const { data: distribution = {} } = useEntityRatingDistribution(entityName);

  const totalRatings = Object.values(distribution).reduce((a, b) => a + b, 0);

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <Link to="/claims" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>

        <h1 className="text-3xl font-serif font-bold text-foreground mb-1">{entityName}</h1>
        <p className="text-muted-foreground text-sm mb-8">{claims.length} claim(s) on record</p>

        {/* Rating Distribution */}
        {totalRatings > 0 && (
          <div className="rounded-lg border border-border bg-card p-6 mb-8">
            <h2 className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-4">Rating Distribution</h2>
            <div className="space-y-3">
              {VERDICT_ORDER.map(v => {
                const count = distribution[v] || 0;
                const pct = totalRatings > 0 ? (count / totalRatings) * 100 : 0;
                return (
                  <div key={v} className="flex items-center gap-3">
                    <VerdictBadge verdict={v} size="sm" className="w-32 justify-center" />
                    <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                      <div className="h-full bg-primary/60 rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-xs font-mono text-muted-foreground w-8 text-right">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Claims */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : claims.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">No claims found for this entity</p>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {claims.map(claim => (
              <ClaimCard key={claim.claim_id} claim={claim} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
