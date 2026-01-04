from .base_agent import BaseAgent
from ..models import DecisionSynthesisInput, DecisionSynthesisOutput
from typing import Dict, Any

class DecisionSynthesisAgent(BaseAgent):
    def __init__(self):
        from ..utils.llm_client import LLMClient
        self.llm = LLMClient()
        
    def run(self, input_data: DecisionSynthesisInput) -> DecisionSynthesisOutput:
        # Context Construction
        context = input_data.dict() # Pydantic helper
        
        # Call LLM
        llm_result = self.llm.generate_verdict_json(context)
        
        # Check if LLM return valid data (it returns a fallback dict if it fails/no key)
        # If explanation is "AI Analysis Failed...", we use our robust manual logic.
        if "AI Analysis Failed" in llm_result.get("explanation", "") or "Mock decision" in llm_result.get("explanation", ""):
             return self._fallback_logic(input_data)
             
        # Map to Output
        return DecisionSynthesisOutput(
            verdict=llm_result.get("verdict", "Risky"),
            confidence=llm_result.get("confidence", 0.0),
            explanation=llm_result.get("explanation", "No explanation provided."),
            score=llm_result.get("score", 50),
            suggestions=llm_result.get("suggestions", []),
            financial_tips=llm_result.get("financial_tips", [])
        )

    def _fallback_logic(self, input_data: DecisionSynthesisInput) -> DecisionSynthesisOutput:
        print("Fallback logic triggered.")
        stability = input_data.financial_stability_score
        burden = input_data.loan_burden_score
        necessity_level = input_data.loan_necessity_level 
        credit_band = input_data.credit_score_band
        market_fair = input_data.market_is_fair
        
        # 1. Continuous Scoring Formula (Resurrected for Fallback)
        # Tuning: Make Burden and Stability dominant.
        
        stability_impact = (stability - 50) * 1.0 # Increased from 0.8
        
        # Burden Impact: 
        # If Burden is 80 (High), (50-80)*0.8 = -24. 
        # If Burden is 20 (Low), (50-20)*0.8 = +24.
        burden_impact = (50 - burden) * 0.8 
        
        credit_map = {"Excellent": 20, "Good": 10, "Fair": -15, "Poor": -40}
        credit_impact = credit_map.get(credit_band, 0)
        
        necessity_map = {"High": 10, "Medium": 0, "Low": -10}
        necessity_impact = necessity_map.get(necessity_level, 0)
        
        market_impact = 0 if market_fair else -20
        
        raw_score = 50 + stability_impact + burden_impact + credit_impact + necessity_impact + market_impact
        final_score = max(0, min(100, raw_score)) 
        
        # Critical Override: If Burden is > 80 (Meaning loan is basically unaffordable), cap score at 40 (Dangerous/Risky)
        if burden > 80:
             final_score = min(final_score, 35)

        # Critical Override: If Stability is 'Broken' (<20), cap score.
        if stability < 20:
             final_score = min(final_score, 30)
        
        # Verdict Thresholds (More Conservative)
        if final_score >= 85:
            verdict = "Safe"
            confidence = 0.95
        elif final_score >= 65:
            verdict = "Safe" 
            confidence = 0.85
        elif final_score >= 45:
            verdict = "Risky"
            confidence = 0.80
        else:
            verdict = "Dangerous"
            confidence = 0.90

        # Manual Explanation Gen
        s, b = stability, burden
        reasons = []
        if s > 75: reasons.append("strong financial health")
        elif s < 40: reasons.append("weak financial stability")
        if b > 60: reasons.append("heavy loan repayment burden")
        elif b < 20: reasons.append("minimal impact on monthly cashflow")
        
        joiner = "combined with" if len(reasons) > 1 else "due to"
        reason_str = f" {joiner} ".join(reasons)
        
        if verdict == "Safe":
            expl = f"This loan appears safe due to your {reason_str}. You have sufficient buffer."
        elif verdict == "Risky":
            expl = f"Proceed with caution. While manageable, this loan creates {reason_str}."
        else:
            expl = f"Not Recommended. The {reason_str} suggests a high risk of default or stress."

        return DecisionSynthesisOutput(
            verdict=verdict,
            confidence=confidence,
            explanation=expl,
            score=round(final_score, 1),
            suggestions=[],
            financial_tips=["(Fallback) Secure API connection for personalized tips."]
        )
