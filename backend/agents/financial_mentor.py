from .base_agent import BaseAgent
from ..models import DecisionSynthesisOutput, FinancialMentorOutput
from typing import Dict, Any

class FinancialMentorAgent(BaseAgent):
    def __init__(self):
        # Lazy load LLM client to avoid circular imports or init issues
        from ..utils.llm_client import LLMClient
        self.llm = LLMClient()

    def run(self, input_data: FinancialMentorInput) -> FinancialMentorOutput:
        decision = input_data.decision_synthesis
        profile = input_data.financial_profile
        
        # Prepare Context for LLM
        context = {
            "verdict": decision.verdict,
            "verdict_explanation": decision.explanation,
            "financial_profile_summary": profile
        }
        
        # specific deterministic advice as fallback or base
        advice_list = []
        if decision.verdict == "Dangerous":
            advice_list.append("Immediate freeze on new debt recommended.")
        
        # Generate Human-Readable Explanation/Advice via LLM
        llm_explanation = self.llm.generate_explanation(context)
        
        return FinancialMentorOutput(
            advice=advice_list,
            recovery_plan=llm_explanation # Using recovery_plan field for the main LLM output
        )
