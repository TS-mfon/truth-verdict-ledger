import { Link } from "react-router-dom";
import { useRecentVerdicts, useSearchClaims } from "@/hooks/useTruthCommission";
import { VerdictBadge } from "@/components/truth-commission/VerdictBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ArrowRight, Shield, Gavel, Globe } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Landing() {
  const { data: recentVerdicts = [] } = useRecentVerdicts(20);
  const { data: allClaims = [] } = useSearchClaims();
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) navigate(`/entity/${encodeURIComponent(searchQuery.trim().toLowerCase())}`);
  };

  return (
    <div className="min-h-screen pt-16">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-glow" />
        <div className="container mx-auto px-4 py-24 md:py-32 relative">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-mono mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              On-chain · Permanent · Permissionless
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-black text-foreground mb-6 leading-tight">
              The Permanent Record of <span className="text-gradient-gold">Truth</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed max-w-2xl mx-auto">
              Submit claims. AI evaluates evidence. Verdicts are permanent. No editorial board. No sponsor influence. Just evidence and AI-evaluated reasoning.
            </p>

            {/* Search */}
            <form onSubmit={handleSearch} className="max-w-lg mx-auto mb-8">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search entity or domain..."
                  className="pl-12 pr-4 h-14 text-base bg-card border-border rounded-xl focus:ring-2 focus:ring-primary/30"
                />
              </div>
            </form>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link to="/submit">
                <Button size="lg" className="bg-gradient-gold text-primary-foreground font-bold px-8 h-12 hover:opacity-90">
                  Submit a Claim <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link to="/claims">
                <Button variant="outline" size="lg" className="border-border text-foreground h-12 px-8 hover:bg-muted/50">
                  Browse Claims
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-border bg-card/50">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto text-center">
            <div>
              <p className="text-3xl font-serif font-black text-primary">{allClaims.length}</p>
              <p className="text-xs text-muted-foreground mt-1">Total Claims</p>
            </div>
            <div>
              <p className="text-3xl font-serif font-black text-foreground">{allClaims.filter(c => c.status === "FINALIZED").length}</p>
              <p className="text-xs text-muted-foreground mt-1">Finalized</p>
            </div>
            <div>
              <p className="text-3xl font-serif font-black text-foreground">{new Set(allClaims.map(c => c.entity_name)).size}</p>
              <p className="text-xs text-muted-foreground mt-1">Entities Checked</p>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Verdicts Ticker */}
      {recentVerdicts.length > 0 && (
        <section className="py-12">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-serif font-bold text-foreground mb-6 text-center">Recent Verdicts</h2>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
              {recentVerdicts.slice(0, 6).map(claim => (
                <Link key={claim.claim_id} to={`/claims/${claim.claim_id}`} className="block group">
                  <div className="rounded-lg border border-border bg-card p-4 hover:border-primary/30 transition-all">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <p className="text-xs font-mono text-primary/70">{claim.entity_name}</p>
                      {claim.verdict?.verdict && <VerdictBadge verdict={claim.verdict.verdict} size="sm" />}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">"{claim.statement}"</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Features */}
      <section className="py-16 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { icon: Shield, title: "Permanent Record", desc: "Verdicts stored on-chain forever. No one can delete or modify a finalized record." },
              { icon: Gavel, title: "AI-Evaluated", desc: "Intelligent contracts fetch evidence from both sides and issue veracity ratings." },
              { icon: Globe, title: "Permissionless", desc: "Any wallet can submit a claim. No editorial gatekeeping. Evidence speaks." },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="text-center">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-serif text-lg font-bold text-foreground mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-xs text-muted-foreground">Truth Commission · Powered by GenLayer Intelligent Contracts</p>
        </div>
      </footer>
    </div>
  );
}
