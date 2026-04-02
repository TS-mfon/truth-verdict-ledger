import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { WalletProvider } from "@/lib/genlayer/WalletProvider";
import { Navbar } from "@/components/truth-commission/Navbar";
import Landing from "./pages/Landing";
import ClaimsDatabase from "./pages/ClaimsDatabase";
import ClaimDetail from "./pages/ClaimDetail";
import SubmitClaim from "./pages/SubmitClaim";
import EvaluationStatus from "./pages/EvaluationStatus";
import EntityProfile from "./pages/EntityProfile";
import Leaderboard from "./pages/Leaderboard";
import MySubmissions from "./pages/MySubmissions";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <WalletProvider>
          <Navbar />
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/claims" element={<ClaimsDatabase />} />
            <Route path="/claims/:id" element={<ClaimDetail />} />
            <Route path="/submit" element={<SubmitClaim />} />
            <Route path="/submit/:id/status" element={<EvaluationStatus />} />
            <Route path="/entity/:name" element={<EntityProfile />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/my-submissions" element={<MySubmissions />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </WalletProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
