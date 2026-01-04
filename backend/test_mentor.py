import sys
import os

sys.path.append("/home/afnash/works/HFT/CredGuardAI")

from backend.agents.financial_mentor import FinancialMentorAgent
from backend.models import FinancialMentorInput, DecisionSynthesisOutput

def test_mentor():
    # Mock Previous Agent Outputs
    decision = DecisionSynthesisOutput(
        verdict="Risky",
        confidence=0.75,
        explanation="Loan burden is moderate but credit score is fair."
    )
    
    profile = {
        "income": 5000,
        "expenses": 3500,
        "savings": 2000
    }
    
    input_data = FinancialMentorInput(
        financial_profile=profile,
        decision_synthesis=decision
    )
    
    agent = FinancialMentorAgent()
    output = agent.run(input_data)
    
    print("--- Mentor Advice ---")
    print(f"Advice List: {output.advice}")
    print(f"Recovery Plan (LLM): {output.recovery_plan}")

if __name__ == "__main__":
    test_mentor()
