import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSubmitClaim } from "@/hooks/useTruthCommission";
import { useWallet } from "@/lib/genlayer/WalletProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ArrowRight, ArrowLeft, AlertCircle } from "lucide-react";

export default function SubmitClaim() {
  const { isConnected, connectWallet } = useWallet();
  const navigate = useNavigate();
  const { mutateAsync, isSubmitting } = useSubmitClaim();

  const [step, setStep] = useState(1);
  const [statement, setStatement] = useState("");
  const [statementSource, setStatementSource] = useState("");
  const [counterUrls, setCounterUrls] = useState("");
  const [analysis, setAnalysis] = useState("");

  const handleSubmit = async () => {
    if (!isConnected) {
      try { await connectWallet(); } catch { return; }
    }

    const urls = counterUrls.split("\n").map(u => u.trim()).filter(Boolean);
    if (!statement.trim() || !statementSource.trim() || urls.length === 0 || !analysis.trim()) {
      toast.error("Please fill all fields");
      return;
    }

    try {
      toast.info("Submitting claim to GenLayer... This may take a few minutes.");
      const receipt = await mutateAsync({
        statement: statement.slice(0, 2000),
        statementSource: statementSource.slice(0, 500),
        counterEvidenceUrls: urls,
        submitterAnalysis: analysis.slice(0, 1500),
      });
      toast.success("Claim submitted successfully!");
      // Try to extract claim_id from receipt
      const result = (receipt as any)?.result;
      if (result) {
        navigate(`/submit/${result}/status`);
      } else {
        navigate("/claims");
      }
    } catch (e: any) {
      toast.error("Failed to submit claim: " + (e.message || "Unknown error"));
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-2xl">
        <h1 className="text-3xl font-serif font-bold text-foreground mb-2">Submit a Claim</h1>
        <p className="text-muted-foreground mb-8">Submit a verifiable statement for AI fact-checking</p>

        {/* Progress */}
        <div className="flex gap-2 mb-8">
          {[1, 2, 3].map(s => (
            <div key={s} className={`h-1 flex-1 rounded-full ${s <= step ? "bg-primary" : "bg-border"}`} />
          ))}
        </div>

        {step === 1 && (
          <div className="space-y-6 animate-fade-up">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Original Statement</label>
              <p className="text-xs text-muted-foreground mb-2">Paste the exact statement you want to fact-check</p>
              <Textarea value={statement} onChange={e => setStatement(e.target.value)} placeholder='e.g. "Our platform charges absolutely zero fees on all transactions."' maxLength={2000} rows={4} className="bg-card border-border" />
              <p className="text-xs text-muted-foreground mt-1">{statement.length}/2000</p>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Statement Source</label>
              <p className="text-xs text-muted-foreground mb-2">URL or source where this statement was made</p>
              <Input value={statementSource} onChange={e => setStatementSource(e.target.value)} placeholder="https://example.com/about" maxLength={500} className="bg-card border-border" />
            </div>
            <Button onClick={() => { if (statement.trim() && statementSource.trim()) setStep(2); else toast.error("Fill all fields"); }} className="bg-gradient-gold text-primary-foreground">
              Next <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-fade-up">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Counter-Evidence URLs</label>
              <p className="text-xs text-muted-foreground mb-2">One URL per line — evidence that contradicts the statement</p>
              <Textarea value={counterUrls} onChange={e => setCounterUrls(e.target.value)} placeholder={"https://example.com/fees\nhttps://example.com/terms"} rows={4} className="bg-card border-border" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Your Analysis</label>
              <p className="text-xs text-muted-foreground mb-2">Explain the discrepancy between the statement and your evidence</p>
              <Textarea value={analysis} onChange={e => setAnalysis(e.target.value)} placeholder="The protocol's own documentation contradicts their marketing claim by listing a 0.5% withdrawal fee..." maxLength={1500} rows={4} className="bg-card border-border" />
              <p className="text-xs text-muted-foreground mt-1">{analysis.length}/1500</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(1)} className="border-border text-foreground">
                <ArrowLeft className="w-4 h-4 mr-1" /> Back
              </Button>
              <Button onClick={() => { const urls = counterUrls.split("\n").filter(u => u.trim()); if (urls.length > 0 && analysis.trim()) setStep(3); else toast.error("Fill all fields"); }} className="bg-gradient-gold text-primary-foreground">
                Review <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-fade-up">
            <div className="rounded-lg border border-border bg-card p-6 space-y-4">
              <h2 className="font-serif font-bold text-foreground">Review Your Claim</h2>

              <div>
                <p className="text-xs font-mono text-muted-foreground uppercase mb-1">Statement</p>
                <p className="text-sm text-foreground">"{statement}"</p>
              </div>
              <div>
                <p className="text-xs font-mono text-muted-foreground uppercase mb-1">Source</p>
                <p className="text-sm text-primary">{statementSource}</p>
              </div>
              <div>
                <p className="text-xs font-mono text-muted-foreground uppercase mb-1">Counter Evidence</p>
                {counterUrls.split("\n").filter(u => u.trim()).map((u, i) => (
                  <p key={i} className="text-sm text-primary">{u.trim()}</p>
                ))}
              </div>
              <div>
                <p className="text-xs font-mono text-muted-foreground uppercase mb-1">Analysis</p>
                <p className="text-sm text-muted-foreground">{analysis}</p>
              </div>
            </div>

            {!isConnected && (
              <div className="flex items-center gap-2 text-sm text-primary bg-primary/10 rounded-lg p-3">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                You'll need to connect your wallet to submit
              </div>
            )}

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(2)} className="border-border text-foreground">
                <ArrowLeft className="w-4 h-4 mr-1" /> Back
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitting} className="bg-gradient-gold text-primary-foreground font-bold px-8">
                {isSubmitting ? "Submitting to GenLayer..." : "Submit Claim ⚖"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
