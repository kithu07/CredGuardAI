from .base_agent import BaseAgent
from ..models import DecisionSynthesisInput, DecisionSynthesisOutput
from typing import Dict, Any

class DecisionSynthesisAgent(BaseAgent):
    def run(self, input_data: DecisionSynthesisInput) -> DecisionSynthesisOutput:
        stability = input_data.financial_stability_score
        burden = input_data.loan_burden_score
        necessity = input_data.loan_necessity_level
        credit_band = input_data.credit_score_band
        market_fair = input_data.market_is_fair

        score = 0
        explanation_parts = []
        
        # 1. Financial Stability (Max 40 points)
        if stability >= 80:
            score += 40
            explanation_parts.append("Financial profile is very strong.")
        elif stability >= 50:
            score += 25
            explanation_parts.append("Financial profile is stable.")
        else:
            score += 0
            explanation_parts.append("Financial profile is weak (stability < 50).")

        # 2. Loan Burden (Max 30 points) - Inverse
        if burden <= 30:
            score += 30
            explanation_parts.append("Loan burden is low.")
        elif burden <= 60:
            score += 15
            explanation_parts.append("Loan burden is moderate.")
        else:
            score -= 10 # Penalty
            explanation_parts.append("Loan burden is high (>60%).")

        # 3. Credit Score (Max 20 points)
        if credit_band in ["Excellent", "Good"]:
            score += 20
        elif credit_band == "Fair":
            score += 10
        else: # Poor
            score -= 20 # Major Penalty
            explanation_parts.append("Credit score is poor.")

        # 4. Necessity (Max 10 points)
        if necessity == "High":
            score += 10
        elif necessity == "Low":
            score -= 5
            explanation_parts.append("Loan purpose is not critical.")

        # 5. Market Fairness (Critical Check)
        if not market_fair:
            score -= 30
            explanation_parts.append("Loan terms appear unfair compared to market.")

        # Determine Verdict
        contrast_score = score # Range can be roughly -65 to 100
        
        if contrast_score >= 70:
            verdict = "Safe"
            confidence = 0.9
        elif contrast_score >= 40:
            verdict = "Risky"
            confidence = 0.75
            explanation_parts.insert(0, "Proceed with caution.")
        else:
            verdict = "Dangerous"
            confidence = 0.85
            explanation_parts.insert(0, "High likelihood of financial distress.")

        return DecisionSynthesisOutput(
            verdict=verdict,
            confidence=confidence,
            explanation=" ".join(explanation_parts)
        )
