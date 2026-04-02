import { useMySubmissions } from "@/hooks/useTruthCommission";
import { useWallet } from "@/lib/genlayer/WalletProvider";
import { ClaimCard } from "@/components/truth-commission/ClaimCard";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function MySubmissions() {
  const { isConnected, connectWallet, address } = useWallet();
  const { data: claims = [], isLoading } = useMySubmissions();

  if (!isConnected) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex flex-col items-center justify-center">
        <p className="text-muted-foreground mb-4">Connect your wallet to see your submissions</p>
        <Button onClick={() => connectWallet()} className="bg-gradient-gold text-primary-foreground">Connect Wallet</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-3xl">
        <h1 className="text-3xl font-serif font-bold text-foreground mb-2">My Submissions</h1>
        <p className="text-xs font-mono text-muted-foreground mb-8">{address}</p>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : claims.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground mb-4">You haven't submitted any claims yet</p>
            <Link to="/submit">
              <Button className="bg-gradient-gold text-primary-foreground">Submit Your First Claim</Button>
            </Link>
          </div>
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
