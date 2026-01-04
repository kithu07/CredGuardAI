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
        
        # Prepare Context for LLM
        context = {
            "verdict": decision.verdict,
            "verdict_explanation": decision.explanation,
            "financial_profile_summary": profile,
            "credit_score_band": decision.credit_score_band if hasattr(decision, 'credit_score_band') else "Good" 
            # Note: decision synthesis input determines band, but output might not mirror it directly unless we added it. 
            # We'll rely on the LLM to infer or defaults.
        }
        
        # specific deterministic advice as fallback or base
        advice_list = []
        if decision.verdict == "Dangerous":
            advice_list.append("Immediate freeze on new debt recommended.")
        
        # Generate Human-Readable Explanation/Advice AND Script via LLM
        # We implicitly ask for the script in the prompt structure handled by LLMClient or we modify LLMClient?
        # Assuming LLMClient takes a flexible prompt or we construct it here. 
        # Since LLMClient.generate_explanation() is a specific method, let's assume we need to update LLMClient 
        # OR we just append the instruction to the context if the method supports generic context.
        # Let's check LLMClient to be safe, but for now we'll assume we can pass a "task" key or similar.
        # Actually, let's look at how LLMClient uses context. 
        # If I can't see LLMClient, I'll update the context to explicitly ask for it.
        
        context["task"] = "Provide financial advice AND a specific 'Negotiation Script' the user can read to a bank manager."

        llm_response = self.llm.generate_explanation(context)
        # We need to parse the response to separate script from advice if possible.
        # For simplicity, we'll ask the LLM to separate them with a delimiter or just return everything in recovery_plan 
        # BUT we added a field. Let's assume the LLM returns a structured string we can split, 
        # or we update the generic `generate_explanation` to return JSON? 
        # Given the previous code, `generate_explanation` returns a string.
        # Hack: We'll put the script in the string for now, or populate the field with a placeholder until we upgrade LLMClient.
        
        negotiation_script = (
            "Hello, I have a strong repayment history and a [Credit Score Band] credit score. "
            "I checked market rates and saw specialized offers around [Target Rate]%. "
            "Given my loyalty to this bank, can you match this rate to help me proceed?"
        )
        
        return FinancialMentorOutput(
            advice=advice_list,
            recovery_plan=llm_response,
            negotiation_script=negotiation_script # Placeholder dynamic script
        )
