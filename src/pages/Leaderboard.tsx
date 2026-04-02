import { useSearchClaims } from "@/hooks/useTruthCommission";
import { Link } from "react-router-dom";
import { VerdictBadge } from "@/components/truth-commission/VerdictBadge";
import { useMemo } from "react";

export default function Leaderboard() {
  const { data: allClaims = [], isLoading } = useSearchClaims();

  const entities = useMemo(() => {
    const map = new Map<string, { total: number; falseCount: number; verdicts: Record<string, number> }>();
    for (const claim of allClaims) {
      if (!claim.entity_name) continue;
      if (!map.has(claim.entity_name)) map.set(claim.entity_name, { total: 0, falseCount: 0, verdicts: {} });
      const e = map.get(claim.entity_name)!;
      e.total++;
      const v = claim.verdict?.verdict || "";
      e.verdicts[v] = (e.verdicts[v] || 0) + 1;
      if (v === "FALSE" || v === "MOSTLY_FALSE") e.falseCount++;
    }
    return Array.from(map.entries())
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.total - a.total);
  }, [allClaims]);

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-3xl">
        <h1 className="text-3xl font-serif font-bold text-foreground mb-2">Most Checked Entities</h1>
        <p className="text-muted-foreground mb-8">Ranked by number of claims submitted</p>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : entities.length === 0 ? (
          <p className="text-center text-muted-foreground py-20">No entities found yet</p>
        ) : (
          <div className="space-y-3">
            {entities.map((entity, i) => (
              <Link key={entity.name} to={`/entity/${encodeURIComponent(entity.name)}`} className="block">
                <div className="rounded-lg border border-border bg-card p-5 hover:border-primary/30 transition-all flex items-center gap-4">
                  <span className="text-2xl font-serif font-black text-muted-foreground w-10 text-center">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground">{entity.name}</p>
                    <p className="text-xs text-muted-foreground">{entity.total} claims · {entity.falseCount} false/mostly-false</p>
                  </div>
                  <div className="flex gap-1 flex-wrap justify-end">
                    {Object.entries(entity.verdicts).filter(([k]) => k).map(([v, count]) => (
                      <div key={v} className="flex items-center gap-1">
                        <VerdictBadge verdict={v} size="sm" />
                        <span className="text-xs font-mono text-muted-foreground">×{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
