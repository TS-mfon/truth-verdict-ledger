# {"Depends": "py-genlayer:test"}

from dataclasses import dataclass
import json
import re

from genlayer import *


ERROR_EXPECTED = "[EXPECTED]"
ERROR_EXTERNAL = "[EXTERNAL]"
ERROR_TRANSIENT = "[TRANSIENT]"
ERROR_LLM = "[LLM_ERROR]"


def _parse_json_dict(raw: str) -> dict:
    if not raw:
        return {}
    try:
        first = raw.find("{")
        last = raw.rfind("}")
        if first == -1 or last == -1:
            return {}
        cleaned = re.sub(r",\s*([}\]])", r"\1", raw[first:last + 1])
        data = json.loads(cleaned)
        return data if isinstance(data, dict) else {}
    except Exception:
        return {}


def _parse_json_list(raw: str) -> list:
    if not raw:
        return []
    try:
        data = json.loads(raw)
        return data if isinstance(data, list) else []
    except Exception:
        return []


def _normalize_entity_name(url: str) -> str:
    lowered = url.strip().lower()
    if "://" in lowered:
        lowered = lowered.split("://", 1)[1]
    return lowered.split("/", 1)[0]


def _handle_leader_error(leaders_res, leader_fn) -> bool:
    leader_msg = getattr(leaders_res, "message", "")
    try:
        leader_fn()
        return False
    except gl.vm.UserError as exc:
        validator_msg = str(exc)
        if validator_msg.startswith(ERROR_EXPECTED) or validator_msg.startswith(ERROR_EXTERNAL):
            return validator_msg == leader_msg
        if validator_msg.startswith(ERROR_TRANSIENT) and leader_msg.startswith(ERROR_TRANSIENT):
            return True
        return False
    except Exception:
        return False


@allow_storage
@dataclass
class Claim:
    submitter: Address
    entity_name: str
    statement: str
    statement_source: str
    counter_evidence_urls_json: str
    submitter_analysis: str
    status: str
    verdict_json: str
    rebuttal_json: str


class TruthCommission(gl.Contract):
    claims: TreeMap[str, Claim]
    claim_order: DynArray[str]
    entities: TreeMap[str, str]
    flags: TreeMap[str, str]
    claim_nonce: u256
    rebuttal_nonce: u256
    flag_nonce: u256

    def __init__(self):
        self.claim_nonce = 0
        self.rebuttal_nonce = 0
        self.flag_nonce = 0

    @gl.public.write
    def submit_claim(self, statement: str, statement_source: str, counter_evidence_urls: list[str], submitter_analysis: str) -> str:
        claim_id = "claim-" + str(int(self.claim_nonce))
        self.claim_nonce += 1
        entity_name = _normalize_entity_name(statement_source)
        self.claims[claim_id] = Claim(
            submitter=gl.message.sender_address,
            entity_name=entity_name,
            statement=statement[:2000],
            statement_source=statement_source[:500],
            counter_evidence_urls_json=json.dumps(counter_evidence_urls),
            submitter_analysis=submitter_analysis[:1500],
            status="PENDING_EVALUATION",
            verdict_json="{}",
            rebuttal_json="{}",
        )
        self.claim_order.append(claim_id)
        self._evaluate_claim(claim_id)
        return claim_id

    def _evaluate_claim(self, claim_id: str) -> None:
        claim = self.claims[claim_id]

        def leader_fn():
            prompt = f"""
Statement: {claim.statement}
Statement source: {claim.statement_source}
Counter evidence URLs: {_parse_json_list(claim.counter_evidence_urls_json)}
Submitter analysis: {claim.submitter_analysis}
Existing rebuttal: {_parse_json_dict(claim.rebuttal_json)}

Return JSON only with:
{{
  "verdict": "TRUE" | "MOSTLY_TRUE" | "MIXED" | "MOSTLY_FALSE" | "FALSE",
  "reasoning": "short explanation",
  "factors_weighed": ["factor"]
}}
"""
            result = _parse_json_dict(gl.nondet.exec_prompt(prompt))
            verdict = str(result.get("verdict", "")).strip().upper()
            if verdict not in ["TRUE", "MOSTLY_TRUE", "MIXED", "MOSTLY_FALSE", "FALSE"]:
                raise gl.vm.UserError(f"{ERROR_LLM} invalid verdict")
            reasoning = str(result.get("reasoning", "")).strip()[:1500]
            factors = result.get("factors_weighed", [])
            if not isinstance(factors, list):
                factors = []
            return {"verdict": verdict, "reasoning": reasoning, "factors_weighed": factors[:10]}

        def validator_fn(leaders_res: gl.vm.Result) -> bool:
            if not isinstance(leaders_res, gl.vm.Return):
                return _handle_leader_error(leaders_res, leader_fn)
            leader = leaders_res.calldata
            validator = leader_fn()
            return leader.get("verdict") == validator.get("verdict")

        result = gl.vm.run_nondet_unsafe(leader_fn, validator_fn)
        claim.verdict_json = json.dumps(result, sort_keys=True)
        claim.status = "FINALIZED"
        self.claims[claim_id] = claim

    @gl.public.write
    def submit_rebuttal(self, claim_id: str, rebuttal_text: str, rebuttal_evidence_urls: list[str]) -> str:
        if claim_id not in self.claims:
            raise gl.vm.UserError(f"{ERROR_EXPECTED} Unknown claim")
        claim = self.claims[claim_id]
        rebuttal_id = "rebuttal-" + str(int(self.rebuttal_nonce))
        self.rebuttal_nonce += 1
        claim.rebuttal_json = json.dumps(
            {"rebuttal_id": rebuttal_id, "text": rebuttal_text[:2000], "urls": rebuttal_evidence_urls},
            sort_keys=True,
        )
        claim.status = "RE-EVALUATING"
        self.claims[claim_id] = claim
        self._evaluate_claim(claim_id)
        return rebuttal_id

    @gl.public.write
    def register_entity(self, entity_name: str, entity_url: str, wallet_address: str) -> str:
        entity_id = "entity-" + entity_name[:50]
        self.entities[entity_name] = json.dumps(
            {"entity_id": entity_id, "entity_url": entity_url[:500], "wallet_address": wallet_address},
            sort_keys=True,
        )
        return entity_id

    @gl.public.write
    def flag_claim(self, claim_id: str, reason: str) -> str:
        if claim_id not in self.claims:
            raise gl.vm.UserError(f"{ERROR_EXPECTED} Unknown claim")
        flag_id = "flag-" + str(int(self.flag_nonce))
        self.flag_nonce += 1
        self.flags[flag_id] = json.dumps({"claim_id": claim_id, "reason": reason[:500]}, sort_keys=True)
        return flag_id

    @gl.public.view
    def get_claim(self, claim_id: str) -> dict:
        if claim_id not in self.claims:
            return {}
        claim = self.claims[claim_id]
        return {
            "claim_id": claim_id,
            "submitter": claim.submitter.as_hex,
            "entity_name": claim.entity_name,
            "statement": claim.statement,
            "statement_source": claim.statement_source,
            "counter_evidence_urls": _parse_json_list(claim.counter_evidence_urls_json),
            "submitter_analysis": claim.submitter_analysis,
            "status": claim.status,
            "verdict": _parse_json_dict(claim.verdict_json),
            "rebuttal": _parse_json_dict(claim.rebuttal_json),
        }

    @gl.public.view
    def search_claims(self, entity: str, verdict: str, from_ts: u256, to_ts: u256) -> list[dict]:
        del from_ts
        del to_ts
        items: list[dict] = []
        for claim_id in self.claim_order:
            claim = self.claims[claim_id]
            verdict_data = _parse_json_dict(claim.verdict_json)
            if entity and claim.entity_name != entity:
                continue
            if verdict and verdict_data.get("verdict", "") != verdict:
                continue
            items.append(self.get_claim(claim_id))
        return items

    @gl.public.view
    def get_entity_claims(self, entity_name: str) -> list[dict]:
        return self.search_claims(entity_name, "", 0, 0)

    @gl.public.view
    def get_entity_rating_distribution(self, entity_name: str) -> dict:
        distribution = {"TRUE": 0, "MOSTLY_TRUE": 0, "MIXED": 0, "MOSTLY_FALSE": 0, "FALSE": 0}
        for claim in self.get_entity_claims(entity_name):
            verdict = claim.get("verdict", {}).get("verdict", "")
            if verdict in distribution:
                distribution[verdict] += 1
        return distribution

    @gl.public.view
    def get_recent_verdicts(self, limit: u256) -> list[dict]:
        items: list[dict] = []
        count = len(self.claim_order)
        start = 0
        if count > int(limit):
            start = count - int(limit)
        for index in range(start, count):
            items.append(self.get_claim(self.claim_order[index]))
        return items

    @gl.public.view
    def get_claim_status(self, claim_id: str) -> str:
        if claim_id not in self.claims:
            return ""
        return self.claims[claim_id].status

    @gl.public.view
    def get_my_submissions(self, wallet_address: str) -> list[dict]:
        items: list[dict] = []
        for claim_id in self.claim_order:
            if self.claims[claim_id].submitter.as_hex == wallet_address:
                items.append(self.get_claim(claim_id))
        return items

    @gl.public.view
    def get_rebuttal(self, claim_id: str) -> dict:
        if claim_id not in self.claims:
            return {}
        return _parse_json_dict(self.claims[claim_id].rebuttal_json)
