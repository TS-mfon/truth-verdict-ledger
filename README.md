A shared grant pool where anyone can submit a funding request for a project. The AI evaluates each application against the pool's stated mission (stored onchain), scores it on impact/feasibility/alignment, and recommends a funding amount. Human DAO members vote with the AI recommendation visible. Applications that score below a threshold are filtered out before humans even see them. Reduces governance fatigue dramatically — only quality proposals reach the vote.

current values but it can be updated

dao_mission: To empower decentralised innovation by providing a transparent, community-driven platform for rating and funding high-impact projects through merit-based grant allocation. score_threshold: 70/100 quorum: 20% voting_period: (10,000 minutes) initial_treasury: 1000000000

Description
Grant Allocator DAO is a shared funding pool governed by AI-assisted human voting. Any wallet can submit a funding request for a project. An Intelligent Contract evaluates each application against the pool's stated mission (stored permanently on-chain), scoring it on three axes: Impact (does it move the mission forward?), Feasibility (can this team execute?), and Alignment (does it fit the funding criteria?). Applications below a minimum composite score are automatically filtered — they never surface to human voters. Qualified proposals are queued for DAO member voting, with the AI's recommendation and scoring rationale displayed alongside the vote buttons. This eliminates governance fatigue: DAO members only engage with quality proposals. The contract manages fund disbursement when a proposal passes the human vote.

Core Problem Solved: Most DAOs suffer from governance fatigue — token holders stop voting because the signal-to-noise ratio of proposals is too low. This contract inserts an AI pre-filter layer that acts as an always-on grants committee, dramatically improving proposal quality reaching human voters.

How It Works
DAO Setup — A deployer initialises the contract with: pool mission statement, minimum AI score threshold (e.g. 65/100), quorum percentage, voting period duration, and initial treasury funding.
Applicant Submits — Any wallet calls submit_application() with project title, description, requested amount, team background, and milestone plan. Submission requires a small anti-spam stake (refunded if approved).
AI Evaluation Triggers — The Intelligent Contract's non-deterministic layer fetches the stored mission statement and evaluates the submission against it. It scores Impact (0–40), Feasibility (0–35), and Alignment (0–25), returning a composite score with written rationale.
Threshold Gate — If composite score < threshold, the application is marked REJECTED_BY_AI and the stake is forfeited. The rejection reason is stored on-chain and visible to the applicant.
Qualified Queue — Applications scoring above the threshold enter PENDING_VOTE status. DAO members are notified (via on-chain events).
Human Vote — DAO members (token holders) call cast_vote() with FOR/AGAINST/ABSTAIN. The AI score and rationale are displayed in the UI. Voting closes after the defined period.
Execution — If quorum is met and FOR > AGAINST, the contract automatically transfers the requested amount to the applicant's wallet. If quorum is not met, the proposal lapses.
Treasury Management — Token holders can fund_treasury() at any time. DAO members can adjust the AI score threshold via update_threshold() (requires vote).
Frontend Architecture
Route	Page Name	Purpose
/	Landing / DAO Overview	Mission statement, treasury balance, stats (proposals submitted / approved / total disbursed)
/proposals	Proposals Board	Filterable list: All / Pending Vote / Approved / Rejected. AI score badge on each card
/proposals/[id]	Proposal Detail	Full application text, AI scorecard (Impact / Feasibility / Alignment breakdown), vote tally, vote buttons, timeline
/submit	Submit Application	Multi-step form: Project Info → Team Background → Milestones → Budget → Review & Submit
/submit/[id]/status	Submission Status	Real-time AI evaluation progress, score reveal animation, outcome (pass/fail)
/vote	Active Votes	All proposals currently in voting window, sorted by time remaining
/treasury	Treasury Dashboard	Balance chart over time, disbursement history, fund pool button
/admin	DAO Admin	Update threshold, update mission, manage member allowlist (if permissioned)
/my-proposals	My Submissions	Applicant's own proposal history with statuses
