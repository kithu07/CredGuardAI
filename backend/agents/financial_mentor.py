from .base_agent import BaseAgent
from ..models import DecisionSynthesisOutput, FinancialMentorOutput, FinancialMentorInput
from typing import Dict, Any

class FinancialMentorAgent(BaseAgent):
    def __init__(self):
        # Lazy load LLM client to avoid circular imports or init issues
        from ..utils.llm_client import LLMClient
        self.llm = LLMClient()

    def run(self, input_data: FinancialMentorInput) -> FinancialMentorOutput:
        decision = input_data.decision_synthesis
        profile = input_data.financial_profile
        
        # Prepare Context for Explanation
        context = {
            "verdict": decision.verdict,
            "verdict_explanation": decision.explanation,
            "financial_profile_summary": profile,
            "credit_score_band": decision.credit_score_band if hasattr(decision, 'credit_score_band') else "Good" 
        }
        
        # specific deterministic advice as fallback or base
        advice_list = []
        if decision.verdict == "Dangerous":
            advice_list.append("Immediate freeze on new debt recommended.")
        
        # Generate Human-Readable Explanation/Advice
        llm_explanation = self.llm.generate_explanation(context)
        
        # Prepare Context for Negotiation Script (Needs more specific details)
        # We try to extract lender/loan details from 'profile' if they were passed in a loose dict, 
        # but ideally we should have passed them explicitly. 
        # In loanService.ts, we passed `mentorBody` which had `financial_profile: profileBody`. 
        # PROFILY BODY in loanService does NOT have loan details (lender, rate...).
        # We need to rely on what we have or genericize.
        
        # ACTUALLY: The user's prompt implies we should be specific. 
        # See loanService.ts: mentorBody only sends `profileBody` (income/expenses) and `finalRes` (verdict).
        # It does NOT send the Loan Request details (Amount, Lender, Rate) to this agent!
        # I need to update loanService.ts to send that data too.
        # But for now, I will use placeholders if missing, and we will update loanService next.
        
        script_context = {
            "credit_band": context["credit_score_band"],
            "lender_name": profile.get("lender_name", "the Bank"), # Will be generic until updated
            "loan_amount": profile.get("loan_amount", "my loan"),
            "offered_rate": profile.get("interest_rate", "the offered rate"),
            "verdict": decision.verdict
        }
        
        negotiation_script = self.llm.generate_negotiation_script(script_context)
        
        return FinancialMentorOutput(
            advice=advice_list,
            recovery_plan=llm_explanation,
            negotiation_script=negotiation_script 
        )
