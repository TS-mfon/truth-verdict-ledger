import { Link, useLocation } from "react-router-dom";
import { useWallet } from "@/lib/genlayer/WalletProvider";
import { Button } from "@/components/ui/button";
import { Search, FileText, PlusCircle, Trophy, User, Menu, X } from "lucide-react";
import { useState } from "react";

export function Navbar() {
  const { address, isConnected, isLoading, connectWallet, disconnectWallet } = useWallet();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = [
    { to: "/claims", label: "Claims", icon: Search },
    { to: "/submit", label: "Submit", icon: PlusCircle },
    { to: "/leaderboard", label: "Leaderboard", icon: Trophy },
  ];

  const isActive = (path: string) => location.pathname === path;

  const handleConnect = async () => {
    try { await connectWallet(); } catch (e: any) { console.error(e); }
  };

  const formatAddr = (a: string) => `${a.slice(0, 6)}…${a.slice(-4)}`;

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="backdrop-blur-xl border-b border-border/50 bg-background/80">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-gold flex items-center justify-center text-primary-foreground font-black text-sm font-serif">TC</div>
              <span className="font-serif text-lg font-bold text-foreground hidden sm:inline">Truth Commission</span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              {links.map(({ to, label, icon: Icon }) => (
                <Link key={to} to={to} className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5 ${isActive(to) ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"}`}>
                  <Icon className="w-4 h-4" />
                  {label}
                </Link>
              ))}
              {isConnected && (
                <Link to="/my-submissions" className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5 ${isActive("/my-submissions") ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"}`}>
                  <FileText className="w-4 h-4" />
                  My Claims
                </Link>
              )}
            </nav>

            {/* Wallet */}
            <div className="flex items-center gap-2">
              {isConnected ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-muted-foreground hidden sm:inline bg-muted/50 px-2 py-1 rounded">{formatAddr(address!)}</span>
                  <Button variant="ghost" size="sm" onClick={disconnectWallet} className="text-muted-foreground hover:text-foreground">
                    <User className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <Button onClick={handleConnect} disabled={isLoading} size="sm" className="bg-gradient-gold text-primary-foreground font-semibold hover:opacity-90">
                  Connect Wallet
                </Button>
              )}
              <button className="md:hidden p-2 text-muted-foreground" onClick={() => setMobileOpen(!mobileOpen)}>
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-card/95 backdrop-blur-xl border-b border-border">
          <nav className="container mx-auto px-4 py-3 flex flex-col gap-1">
            {links.map(({ to, label, icon: Icon }) => (
              <Link key={to} to={to} onClick={() => setMobileOpen(false)} className={`px-3 py-2.5 rounded-md text-sm font-medium flex items-center gap-2 ${isActive(to) ? "text-primary bg-primary/10" : "text-muted-foreground"}`}>
                <Icon className="w-4 h-4" /> {label}
              </Link>
            ))}
            {isConnected && (
              <Link to="/my-submissions" onClick={() => setMobileOpen(false)} className="px-3 py-2.5 rounded-md text-sm font-medium flex items-center gap-2 text-muted-foreground">
                <FileText className="w-4 h-4" /> My Claims
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
