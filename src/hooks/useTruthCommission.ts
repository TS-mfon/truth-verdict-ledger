import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import TruthCommission from "@/lib/contracts/TruthCommission";
import { useWallet } from "@/lib/genlayer/WalletProvider";
import type { Claim } from "@/lib/contracts/types";

export function useContract() {
  const { address } = useWallet();
  return useMemo(() => new TruthCommission(address), [address]);
}

export function useRecentVerdicts(limit = 10) {
  const contract = useContract();
  return useQuery<Claim[]>({
    queryKey: ["recentVerdicts", limit],
    queryFn: () => contract.getRecentVerdicts(limit),
    refetchOnWindowFocus: true,
    staleTime: 5000,
  });
}

export function useSearchClaims(entity = "", verdict = "") {
  const contract = useContract();
  return useQuery<Claim[]>({
    queryKey: ["searchClaims", entity, verdict],
    queryFn: () => contract.searchClaims(entity, verdict),
    refetchOnWindowFocus: true,
    staleTime: 5000,
  });
}

export function useClaim(claimId: string) {
  const contract = useContract();
  return useQuery<Claim | null>({
    queryKey: ["claim", claimId],
    queryFn: () => contract.getClaim(claimId),
    enabled: !!claimId,
    refetchOnWindowFocus: true,
    staleTime: 3000,
  });
}

export function useClaimStatus(claimId: string) {
  const contract = useContract();
  return useQuery<string>({
    queryKey: ["claimStatus", claimId],
    queryFn: () => contract.getClaimStatus(claimId),
    enabled: !!claimId,
    refetchInterval: (query) => {
      const data = query.state.data;
      if (data === "FINALIZED") return false;
      return 5000;
    },
  });
}

export function useEntityClaims(entityName: string) {
  const contract = useContract();
  return useQuery<Claim[]>({
    queryKey: ["entityClaims", entityName],
    queryFn: () => contract.getEntityClaims(entityName),
    enabled: !!entityName,
  });
}

export function useEntityRatingDistribution(entityName: string) {
  const contract = useContract();
  return useQuery<Record<string, number>>({
    queryKey: ["entityRating", entityName],
    queryFn: () => contract.getEntityRatingDistribution(entityName),
    enabled: !!entityName,
  });
}

export function useMySubmissions() {
  const { address } = useWallet();
  const contract = useContract();
  return useQuery<Claim[]>({
    queryKey: ["mySubmissions", address],
    queryFn: () => contract.getMySubmissions(address!),
    enabled: !!address,
  });
}

export function useSubmitClaim() {
  const contract = useContract();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const mutation = useMutation({
    mutationFn: async (params: {
      statement: string;
      statementSource: string;
      counterEvidenceUrls: string[];
      submitterAnalysis: string;
    }) => {
      setIsSubmitting(true);
      return contract.submitClaim(
        params.statement,
        params.statementSource,
        params.counterEvidenceUrls,
        params.submitterAnalysis,
      );
    },
    onSettled: () => {
      setIsSubmitting(false);
      queryClient.invalidateQueries({ queryKey: ["searchClaims"] });
      queryClient.invalidateQueries({ queryKey: ["recentVerdicts"] });
      queryClient.invalidateQueries({ queryKey: ["mySubmissions"] });
    },
  });

  return { ...mutation, isSubmitting };
}

export function useSubmitRebuttal() {
  const contract = useContract();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { claimId: string; rebuttalText: string; rebuttalEvidenceUrls: string[] }) => {
      return contract.submitRebuttal(params.claimId, params.rebuttalText, params.rebuttalEvidenceUrls);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["claim"] });
      queryClient.invalidateQueries({ queryKey: ["searchClaims"] });
    },
  });
}

export function useFlagClaim() {
  const contract = useContract();
  return useMutation({
    mutationFn: async (params: { claimId: string; reason: string }) => {
      return contract.flagClaim(params.claimId, params.reason);
    },
  });
}
