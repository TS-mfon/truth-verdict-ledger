import { useState } from "react";
import { useSearchClaims } from "@/hooks/useTruthCommission";
import { ClaimCard } from "@/components/truth-commission/ClaimCard";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import type { VerdictType } from "@/lib/contracts/types";

const VERDICTS: (VerdictType | "")[] = ["", "TRUE", "MOSTLY_TRUE", "MIXED", "MOSTLY_FALSE", "FALSE"];

export default function ClaimsDatabase() {
  const [entityFilter, setEntityFilter] = useState("");
  const [verdictFilter, setVerdictFilter] = useState("");
  const { data: claims = [], isLoading } = useSearchClaims(entityFilter, verdictFilter);

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-serif font-bold text-foreground mb-2">Claims Database</h1>
        <p className="text-muted-foreground mb-8">Search and filter all fact-check records</p>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={entityFilter}
              onChange={e => setEntityFilter(e.target.value)}
              placeholder="Filter by entity..."
              className="pl-10 bg-card border-border"
            />
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {VERDICTS.map(v => (
              <button
                key={v}
                onClick={() => setVerdictFilter(v)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${verdictFilter === v ? "bg-primary/20 text-primary border border-primary/30" : "bg-muted text-muted-foreground hover:text-foreground border border-transparent"}`}
              >
                {v || "All"}
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : claims.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground">No claims found</p>
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {claims.map(claim => (
              <ClaimCard key={claim.claim_id} claim={claim} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
