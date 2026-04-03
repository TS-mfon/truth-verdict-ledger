

A public record of disputed facts. Anyone submits a claim: "Company X stated their product has zero fees, but evidence shows otherwise." The AI fetches evidence from both sides, evaluates the factual accuracy of the original statement, and issues a public veracity rating. The record is permanent and searchable. Onchain fact-checking with no editorial board.

### Description

Truth Commission is a permanent, public, on-chain fact-checking record. Anyone can submit a claim — a verifiable statement that a company, public figure, protocol, or entity made, accompanied by evidence that the statement is false or misleading. The Intelligent Contract fetches evidence from both sides (the original statement source and the counter-evidence provided), evaluates the factual accuracy of the original statement, and issues a public **Veracity Rating**: TRUE, MOSTLY TRUE, MIXED, MOSTLY FALSE, or FALSE. The rating, evidence sources, and AI reasoning are stored permanently on-chain. The record is searchable and cannot be deleted. No editorial board. No sponsor influence. Just evidence and AI-evaluated reasoning.

**Core Problem Solved:** Fact-checking today is centralised, slow, susceptible to editorial bias, and not permanent. Subjects of fact-checks can pressure publications to remove findings. Truth Commission makes the record permanent, permissionless, and AI-evaluated — any wallet can submit, no organisation can suppress.

---

### How It Works

1. **Claim Submission** — Any wallet calls `submit_claim()` with: the original statement (verbatim), the source of the statement (URL/entity), counter-evidence URL(s) and description, and the submitter's analysis of the discrepancy. A staking fee is required to prevent spam.
2. **Evidence Fetching** — The Intelligent Contract's non-deterministic layer fetches the original source and the counter-evidence URLs. It reads and synthesises the content from both.
3. **AI Evaluation** — The AI evaluates: Is the original statement factually accurate given available evidence? What is the most honest characterisation? It issues a Veracity Rating with a written rationale citing specific evidence from both sides.
4. **Response Window** — The subject of the claim (if registered) or any wallet can call `submit_rebuttal()` within 7 days with counter-evidence. The AI re-evaluates with the new evidence and may update the rating.
5. **Final Record** — After the response window, the rating is marked FINAL and stored permanently. The submitter's stake is returned if the claim was valid (rating below MOSTLY TRUE). Bad-faith submissions (rated TRUE) forfeit stake.
6. **Search & Discovery** — The public can search by entity name, domain, date range, or rating type.

---

### Frontend Architecture

| Route | Page Name | Purpose |
|---|---|---|
| `/` | Landing | Recent verdicts ticker, total claims, entity search bar |
| `/claims` | Claims Database | Searchable, filterable list of all claims with rating badges |
| `/claims/[id]` | Claim Detail | Full record: statement, evidence, AI reasoning, veracity rating, rebuttal if any |
| `/submit` | Submit Claim | Form: original statement + source + counter-evidence + analysis |
| `/submit/[id]/status` | Evaluation Status | Live evaluation progress, evidence fetch status, rating reveal |
| `/entity/[name]` | Entity Profile | All claims about a specific entity, aggregate rating distribution |
| `/leaderboard` | Most Checked | Entities with most claims, most FALSE ratings |
| `/my-submissions` | My Claims | Submitter's own claim history + stake status |

---

### Key UI Moment

**The Veracity Rating Reveal on `/submit/[id]/status`**

After the AI completes evaluation, the screen clears and a large badge — styled like a court stamp — drops into view: TRUE / MOSTLY TRUE / MIXED / MOSTLY FALSE / FALSE in bold color (green → red spectrum). Below it, the AI's reasoning appears paragraph by paragraph. Each paragraph cites a specific piece of evidence. The original statement is shown with strikethroughs on the parts the AI identified as inaccurate. The image of a literal gavel stamp hitting the screen is the defining moment. "This record is now permanent and searchable."

---



---

### Write Methods Table

| Method | Inputs | Character Limits | Returns | When to Call |
|---|---|---|---|---|
| `submit_claim` | `statement: str`, `statement_source: str`, `counter_evidence_urls: list[str]`, `submitter_analysis: str` | statement: 2000, source: 500, analysis: 1500 | `claim_id: str` | Final step of submit form |
| `submit_rebuttal` | `claim_id: str`, `rebuttal_text: str`, `rebuttal_evidence_urls: list[str]` | rebuttal_text: 2000 | `rebuttal_id: str` | Subject submits counter-argument in response window |
| `register_entity` | `entity_name: str`, `entity_url: str`, `wallet_address: str` | name: 200 | `entity_id: str` | Entity registers to receive claim notifications |
| `flag_claim` | `claim_id: str`, `reason: str` | reason: 500 | `flag_id: str` | Community flags potentially bad-faith submission |

---

### View Methods Table

| Method | Inputs | Output | When to Use |
|---|---|---|---|
| `get_claim` | `claim_id: str` | Full claim object with verdict | Claim detail page |
| `search_claims` | `entity: str`, `verdict: str`, `from_ts: int`, `to_ts: int` | List of matching claims | Claims database page |
| `get_entity_claims` | `entity_name: str` | All claims about entity | Entity profile page |
| `get_entity_rating_distribution` | `entity_name: str` | Dict of verdict → count | Entity profile chart |
| `get_recent_verdicts` | `limit: int` | Most recent N finalized verdicts | Landing page ticker |
| `get_claim_status` | `claim_id: str` | Current evaluation status | Status polling |
| `get_my_submissions` | `wallet_address: str` | Submitter's claims + stake status | My Submissions page |
| `get_rebuttal` | `claim_id: str` | Rebuttal object if exists | Claim detail page |

---

### Complete Frontend Flow Diagram

```
User visits /
      |
[Landing: Recent verdicts ticker + Search bar]
      |
Search "Company X" --> /entity/company-x
      |                     |
      |          [All claims + rating distribution chart]
      |
[CTA: Submit a Claim] --> /submit
      |
[Step 1: Paste original statement + source URL]
      |
[Step 2: Counter-evidence URLs + analysis]
      |
[Step 3: Stake + Review]
      |
[Sign submit_claim Tx] --> claim_id
      |
/submit/[id]/status
      |
[Evidence fetch status: source URL ✓ / counter-evidence URLs ✓]
      |
AI Evaluation (polling until complete)
      |
Rating reveals with gavel animation
      |
[/claims/[id]] -- permanent record
      |
Response window opens (7 days)
      |
Subject submits rebuttal?
   /        \
  No         Yes
  |              |
Rating       [Re-evaluation]
Final        [Rating may update]
                  |
              Rating Final
      |
Stake returned (if claim valid) or forfeited
```

---

### How Users Use the Contract — Realistic User Journey

**Alex is a DeFi researcher. He notices a protocol advertised "zero fees" in their marketing but charges a 0.5% withdrawal fee.**

1. He copies the exact statement from their website: "TradeProtocol charges absolutely zero fees on all transactions."
2. He opens `/submit`. Pastes the statement. Source URL: TradeProtocol's landing page.
3. Counter-evidence: URL to their own documentation page showing 0.5% withdrawal fee. His analysis: "Protocol's own documentation on page /fees contradicts the landing page claim."
4. He stakes 5 GEN (anti-spam). Signs. Redirected to status page.
5. He watches: "Fetching statement source… ✓", "Fetching counter-evidence… ✓", "AI evaluating…"
6. 90 seconds later. A red "FALSE" badge stamps the screen. AI rationale: "The original statement claims zero fees. The protocol's own fee schedule documentation [fetched from evidence URL] lists a 0.5% withdrawal fee. The claim is directly contradicted by the issuer's own published documentation."
7. TradeProtocol has 7 days to submit a rebuttal. They don't.
8. Rating is FINAL. The record is permanent. Alex's 5 GEN stake is returned.
9. Next week, a journalist finds the record by searching "/entity/tradeprotocol" and uses it in their investigative piece.



this is the contract address deployed on studionet: 0xE63752d24184E389FF3a09da53807C0Cc62fD41b
