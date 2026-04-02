import { useParams, Link } from "react-router-dom";
import { useClaim } from "@/hooks/useTruthCommission";
import { VerdictBadge } from "@/components/truth-commission/VerdictBadge";
import { ArrowLeft, ExternalLink, Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useSubmitRebuttal, useFlagClaim } from "@/hooks/useTruthCommission";
import { useWallet } from "@/lib/genlayer/WalletProvider";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export default function ClaimDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: claim, isLoading } = useClaim(id || "");
  const { isConnected } = useWallet();
  const [showRebuttal, setShowRebuttal] = useState(false);
  const [rebuttalText, setRebuttalText] = useState("");
  const [rebuttalUrls, setRebuttalUrls] = useState("");
  const submitRebuttal = useSubmitRebuttal();
  const flagClaim = useFlagClaim();
  const [flagReason, setFlagReason] = useState("");
  const [showFlag, setShowFlag] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 flex justify-center">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!claim) {
    return (
      <div className="min-h-screen pt-24 text-center">
        <p className="text-muted-foreground">Claim not found</p>
        <Link to="/claims" className="text-primary text-sm mt-4 inline-block">← Back to Claims</Link>
      </div>
    );
  }

  const handleRebuttal = async () => {
    if (!rebuttalText.trim()) return;
    try {
      const urls = rebuttalUrls.split("\n").map(u => u.trim()).filter(Boolean);
      await submitRebuttal.mutateAsync({ claimId: claim.claim_id, rebuttalText, rebuttalEvidenceUrls: urls });
      toast.success("Rebuttal submitted! Claim is being re-evaluated.");
      setShowRebuttal(false);
    } catch (e: any) {
      toast.error("Failed to submit rebuttal");
    }
  };

  const handleFlag = async () => {
    if (!flagReason.trim()) return;
    try {
      await flagClaim.mutateAsync({ claimId: claim.claim_id, reason: flagReason });
      toast.success("Claim flagged");
      setShowFlag(false);
    } catch {
      toast.error("Failed to flag claim");
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-3xl">
        <Link to="/claims" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Claims
        </Link>

        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <p className="text-xs font-mono text-primary/70 mb-1">{claim.claim_id}</p>
            <Link to={`/entity/${encodeURIComponent(claim.entity_name)}`} className="text-sm font-mono text-primary hover:underline">{claim.entity_name}</Link>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-2 py-1 rounded text-xs font-medium ${claim.status === "FINALIZED" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
              {claim.status}
            </span>
          </div>
        </div>

        {/* Verdict */}
        {claim.verdict?.verdict && (
          <div className="flex justify-center mb-8">
            <VerdictBadge verdict={claim.verdict.verdict} size="lg" />
          </div>
        )}

        {/* Statement */}
        <div className="rounded-lg border border-border bg-card p-6 mb-6">
          <h2 className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-3">Original Statement</h2>
          <blockquote className="text-lg text-foreground font-medium border-l-2 border-primary/30 pl-4 italic">
            "{claim.statement}"
          </blockquote>
          <a href={claim.statement_source} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-primary mt-3 hover:underline">
            <ExternalLink className="w-3 h-3" /> {claim.statement_source}
          </a>
        </div>

        {/* Counter Evidence */}
        <div className="rounded-lg border border-border bg-card p-6 mb-6">
          <h2 className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-3">Counter Evidence</h2>
          <div className="space-y-2 mb-4">
            {claim.counter_evidence_urls.map((url, i) => (
              <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm text-primary hover:underline">
                <ExternalLink className="w-3 h-3 flex-shrink-0" /> {url}
              </a>
            ))}
          </div>
          <h3 className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-2">Submitter's Analysis</h3>
          <p className="text-sm text-muted-foreground">{claim.submitter_analysis}</p>
        </div>

        {/* AI Reasoning */}
        {claim.verdict?.reasoning && (
          <div className="rounded-lg border border-border bg-card p-6 mb-6">
            <h2 className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-3">AI Reasoning</h2>
            <p className="text-sm text-foreground leading-relaxed">{claim.verdict.reasoning}</p>
            {claim.verdict.factors_weighed && claim.verdict.factors_weighed.length > 0 && (
              <div className="mt-4">
                <h3 className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-2">Factors Weighed</h3>
                <div className="flex flex-wrap gap-2">
                  {claim.verdict.factors_weighed.map((f, i) => (
                    <span key={i} className="px-2 py-1 bg-muted rounded text-xs text-muted-foreground">{f}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Rebuttal */}
        {claim.rebuttal?.text && (
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-6 mb-6">
            <h2 className="text-xs font-mono text-primary uppercase tracking-wider mb-3">Rebuttal</h2>
            <p className="text-sm text-foreground">{claim.rebuttal.text}</p>
            {claim.rebuttal.urls && claim.rebuttal.urls.length > 0 && (
              <div className="mt-3 space-y-1">
                {claim.rebuttal.urls.map((u, i) => (
                  <a key={i} href={u} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-primary hover:underline">
                    <ExternalLink className="w-3 h-3" /> {u}
                  </a>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Submitter */}
        <div className="text-xs text-muted-foreground font-mono mb-8">
          Submitted by: {claim.submitter}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          {isConnected && claim.status === "FINALIZED" && !claim.rebuttal?.text && (
            <Button variant="outline" onClick={() => setShowRebuttal(!showRebuttal)} className="border-border text-foreground">
              Submit Rebuttal
            </Button>
          )}
          {isConnected && (
            <Button variant="ghost" size="sm" onClick={() => setShowFlag(!showFlag)} className="text-muted-foreground">
              <Flag className="w-4 h-4 mr-1" /> Flag
            </Button>
          )}
        </div>

        {/* Rebuttal Form */}
        {showRebuttal && (
          <div className="mt-6 rounded-lg border border-border bg-card p-6 space-y-4">
            <h3 className="font-serif font-bold text-foreground">Submit Rebuttal</h3>
            <Textarea value={rebuttalText} onChange={e => setRebuttalText(e.target.value)} placeholder="Your counter-argument..." maxLength={2000} className="bg-muted/50 border-border" />
            <Input value={rebuttalUrls} onChange={e => setRebuttalUrls(e.target.value)} placeholder="Evidence URLs (one per line)" className="bg-muted/50 border-border" />
            <Button onClick={handleRebuttal} disabled={submitRebuttal.isPending} className="bg-gradient-gold text-primary-foreground">
              {submitRebuttal.isPending ? "Submitting..." : "Submit Rebuttal"}
            </Button>
          </div>
        )}

        {/* Flag Form */}
        {showFlag && (
          <div className="mt-6 rounded-lg border border-border bg-card p-6 space-y-4">
            <h3 className="font-serif font-bold text-foreground">Flag Claim</h3>
            <Input value={flagReason} onChange={e => setFlagReason(e.target.value)} placeholder="Reason for flagging..." maxLength={500} className="bg-muted/50 border-border" />
            <Button onClick={handleFlag} disabled={flagClaim.isPending} variant="destructive">
              {flagClaim.isPending ? "Flagging..." : "Submit Flag"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
