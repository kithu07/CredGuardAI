from .base_agent import BaseAgent
from ..models import LoanNecessityInput, LoanNecessityOutput

class LoanNecessityAgent(BaseAgent):
    def run(self, input_data: LoanNecessityInput) -> LoanNecessityOutput:
        purpose = input_data.loan_purpose.lower()
        amount = input_data.loan_amount
        savings = input_data.savings
        emergency_fund = input_data.emergency_fund
        stability_score = input_data.financial_stability_score

        necessity_level = "Low"
        confidence = 0.8
        reasoning = []
        risk_flags = []

        # 1. Base Logic based on Purpose
        if any(kw in purpose for kw in ["education", "medical", "health", "tuition", "school", "hospital"]):
            necessity_level = "High"
            reasoning.append(f"Loan for '{purpose}' is considered a critical need.")
        elif any(kw in purpose for kw in ["business", "startups", "equipment", "capital"]):
            necessity_level = "Medium"
            reasoning.append(f"Loan for '{purpose}' can be productive but carries risk.")
            if stability_score > 70:
                necessity_level = "High"
                reasoning.append("High financial stability supports this business investment.")
        elif any(kw in purpose for kw in ["home", "renovation", "house"]):
            necessity_level = "Medium"
            reasoning.append("Home improvement is a valid asset appreciation strategy.")
        else:
            # Personal, Vacation, Gadgets, etc.
            necessity_level = "Low"
            reasoning.append(f"Loan for '{purpose}' is considered discretionary spending.")

        # 2. Financial Buffer Check
        total_liquid_cash = savings + emergency_fund
        if total_liquid_cash > amount * 1.5:
            # If they have enough cash to cover loan 1.5x over, why borrow?
            reasoning.append(f"You have sufficient liquid assets ({total_liquid_cash}) to cover this loan ({amount}).")
            if necessity_level == "Low":
                risk_flags.append("Unnecessary borrowing: Self-funding is recommended.")
                confidence = 0.95
            elif necessity_level == "Medium":
                reasoning.append("Consider self-funding a portion to reduce debt burden.")
        
        # 3. Emergency Fund Warning
        if emergency_fund < amount * 0.2:
            if necessity_level == "Low":
                 risk_flags.append("Taking a discretionary loan without a solid emergency fund is risky.")

        # Determine boolean is_necessary
        is_necessary = necessity_level in ["High", "Medium"]

        return LoanNecessityOutput(
            necessity_level=necessity_level,
            is_necessary=is_necessary,
            confidence=confidence,
            reasoning=" ".join(reasoning),
            risk_flags=risk_flags
        )
