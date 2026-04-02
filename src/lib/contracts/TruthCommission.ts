import { createGenLayerClient, CONTRACT_ADDRESS } from "../genlayer/client";
import type { Claim, TransactionReceipt } from "./types";

class TruthCommission {
  private client: ReturnType<typeof createGenLayerClient>;

  constructor(address?: string | null) {
    this.client = createGenLayerClient(address || undefined);
  }

  private parseClaim(data: any): Claim {
    if (data instanceof Map) {
      const obj: any = {};
      data.forEach((v: any, k: any) => { obj[k] = v instanceof Map ? this.parseMap(v) : v; });
      return this.normalizeClaimObj(obj);
    }
    return this.normalizeClaimObj(data);
  }

  private parseMap(m: Map<any, any>): any {
    const obj: any = {};
    m.forEach((v, k) => { obj[k] = v instanceof Map ? this.parseMap(v) : v; });
    return obj;
  }

  private normalizeClaimObj(obj: any): Claim {
    const verdict = typeof obj.verdict === 'string' ? JSON.parse(obj.verdict || '{}') : (obj.verdict || {});
    const rebuttal = typeof obj.rebuttal === 'string' ? JSON.parse(obj.rebuttal || '{}') : (obj.rebuttal || {});
    const urls = typeof obj.counter_evidence_urls === 'string' ? JSON.parse(obj.counter_evidence_urls || '[]') : (obj.counter_evidence_urls || []);
    return {
      claim_id: obj.claim_id || '',
      submitter: obj.submitter || '',
      entity_name: obj.entity_name || '',
      statement: obj.statement || '',
      statement_source: obj.statement_source || '',
      counter_evidence_urls: Array.isArray(urls) ? urls : [],
      submitter_analysis: obj.submitter_analysis || '',
      status: obj.status || '',
      verdict,
      rebuttal,
    };
  }

  private parseClaimList(data: any): Claim[] {
    if (Array.isArray(data)) return data.map(d => this.parseClaim(d));
    if (data instanceof Map) return Array.from(data.values()).map(d => this.parseClaim(d));
    return [];
  }

  async getClaim(claimId: string): Promise<Claim | null> {
    try {
      const result = await this.client.readContract({
        address: CONTRACT_ADDRESS,
        functionName: "get_claim",
        args: [claimId],
      });
      if (!result || (typeof result === 'object' && Object.keys(result).length === 0)) return null;
      return this.parseClaim(result);
    } catch (e) {
      console.error("Error fetching claim:", e);
      return null;
    }
  }

  async searchClaims(entity = "", verdict = "", fromTs = 0, toTs = 0): Promise<Claim[]> {
    try {
      const result = await this.client.readContract({
        address: CONTRACT_ADDRESS,
        functionName: "search_claims",
        args: [entity, verdict, fromTs, toTs],
      });
      return this.parseClaimList(result);
    } catch (e) {
      console.error("Error searching claims:", e);
      return [];
    }
  }

  async getEntityClaims(entityName: string): Promise<Claim[]> {
    try {
      const result = await this.client.readContract({
        address: CONTRACT_ADDRESS,
        functionName: "get_entity_claims",
        args: [entityName],
      });
      return this.parseClaimList(result);
    } catch (e) {
      console.error("Error:", e);
      return [];
    }
  }

  async getEntityRatingDistribution(entityName: string): Promise<Record<string, number>> {
    try {
      const result: any = await this.client.readContract({
        address: CONTRACT_ADDRESS,
        functionName: "get_entity_rating_distribution",
        args: [entityName],
      });
      if (result instanceof Map) {
        const obj: Record<string, number> = {};
        result.forEach((v: any, k: any) => { obj[k] = Number(v); });
        return obj;
      }
      return result || {};
    } catch (e) {
      console.error("Error:", e);
      return {};
    }
  }

  async getRecentVerdicts(limit = 10): Promise<Claim[]> {
    try {
      const result = await this.client.readContract({
        address: CONTRACT_ADDRESS,
        functionName: "get_recent_verdicts",
        args: [limit],
      });
      return this.parseClaimList(result);
    } catch (e) {
      console.error("Error:", e);
      return [];
    }
  }

  async getClaimStatus(claimId: string): Promise<string> {
    try {
      const result = await this.client.readContract({
        address: CONTRACT_ADDRESS,
        functionName: "get_claim_status",
        args: [claimId],
      });
      return String(result || "");
    } catch (e) {
      console.error("Error:", e);
      return "";
    }
  }

  async getMySubmissions(walletAddress: string): Promise<Claim[]> {
    try {
      const result = await this.client.readContract({
        address: CONTRACT_ADDRESS,
        functionName: "get_my_submissions",
        args: [walletAddress],
      });
      return this.parseClaimList(result);
    } catch (e) {
      console.error("Error:", e);
      return [];
    }
  }

  async getRebuttal(claimId: string): Promise<any> {
    try {
      const result = await this.client.readContract({
        address: CONTRACT_ADDRESS,
        functionName: "get_rebuttal",
        args: [claimId],
      });
      if (result instanceof Map) return this.parseMap(result);
      return result || {};
    } catch (e) {
      console.error("Error:", e);
      return {};
    }
  }

  async submitClaim(statement: string, statementSource: string, counterEvidenceUrls: string[], submitterAnalysis: string): Promise<TransactionReceipt> {
    try {
      const txHash = await this.client.writeContract({
        address: CONTRACT_ADDRESS,
        functionName: "submit_claim",
        args: [statement, statementSource, counterEvidenceUrls, submitterAnalysis],
        value: BigInt(0),
      });
      const receipt = await this.client.waitForTransactionReceipt({
        hash: txHash,
        status: "ACCEPTED" as any,
        retries: 60,
        interval: 5000,
      });
      return receipt as TransactionReceipt;
    } catch (e) {
      console.error("Error submitting claim:", e);
      throw e;
    }
  }

  async submitRebuttal(claimId: string, rebuttalText: string, rebuttalEvidenceUrls: string[]): Promise<TransactionReceipt> {
    try {
      const txHash = await this.client.writeContract({
        address: CONTRACT_ADDRESS,
        functionName: "submit_rebuttal",
        args: [claimId, rebuttalText, rebuttalEvidenceUrls],
        value: BigInt(0),
      });
      const receipt = await this.client.waitForTransactionReceipt({
        hash: txHash,
        status: "ACCEPTED" as any,
        retries: 60,
        interval: 5000,
      });
      return receipt as TransactionReceipt;
    } catch (e) {
      console.error("Error submitting rebuttal:", e);
      throw e;
    }
  }

  async registerEntity(entityName: string, entityUrl: string, walletAddress: string): Promise<TransactionReceipt> {
    try {
      const txHash = await this.client.writeContract({
        address: CONTRACT_ADDRESS,
        functionName: "register_entity",
        args: [entityName, entityUrl, walletAddress],
        value: BigInt(0),
      });
      const receipt = await this.client.waitForTransactionReceipt({
        hash: txHash,
        status: "ACCEPTED" as any,
        retries: 30,
        interval: 5000,
      });
      return receipt as TransactionReceipt;
    } catch (e) {
      console.error("Error registering entity:", e);
      throw e;
    }
  }

  async flagClaim(claimId: string, reason: string): Promise<TransactionReceipt> {
    try {
      const txHash = await this.client.writeContract({
        address: CONTRACT_ADDRESS,
        functionName: "flag_claim",
        args: [claimId, reason],
        value: BigInt(0),
      });
      const receipt = await this.client.waitForTransactionReceipt({
        hash: txHash,
        status: "ACCEPTED" as any,
        retries: 30,
        interval: 5000,
      });
      return receipt as TransactionReceipt;
    } catch (e) {
      console.error("Error flagging claim:", e);
      throw e;
    }
  }
}

export default TruthCommission;
