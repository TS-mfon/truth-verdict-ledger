export interface Verdict {
  verdict: "TRUE" | "MOSTLY_TRUE" | "MIXED" | "MOSTLY_FALSE" | "FALSE";
  reasoning: string;
  factors_weighed: string[];
}

export interface Rebuttal {
  rebuttal_id?: string;
  text?: string;
  urls?: string[];
}

export interface Claim {
  claim_id: string;
  submitter: string;
  entity_name: string;
  statement: string;
  statement_source: string;
  counter_evidence_urls: string[];
  submitter_analysis: string;
  status: string;
  verdict: Partial<Verdict>;
  rebuttal: Partial<Rebuttal>;
}

export interface TransactionReceipt {
  status: string;
  hash: string;
  [key: string]: any;
}

export type VerdictType = "TRUE" | "MOSTLY_TRUE" | "MIXED" | "MOSTLY_FALSE" | "FALSE";
