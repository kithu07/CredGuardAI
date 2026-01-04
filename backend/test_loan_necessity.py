import sys
import os

sys.path.append("/home/afnash/works/HFT/CredGuardAI")

from backend.agents.loan_necessity import LoanNecessityAgent
from backend.models import LoanNecessityInput

def test_necessity(purpose, amount, savings, emergency_fund, stability):
    input_data = LoanNecessityInput(
        loan_purpose=purpose,
        loan_amount=amount,
        financial_stability_score=stability,
        savings=savings,
        emergency_fund=emergency_fund
    )
    agent = LoanNecessityAgent()
    output = agent.run(input_data)
    print(f"--- Testing: {purpose} ---")
    print(f"Necessity: {output.necessity_level} (Is Necessary: {output.is_necessary})")
    print(f"Reasoning: {output.reasoning}")
    print(f"Risk Flags: {output.risk_flags}")
    print("\n")

# Case 1: Education (High Necessity)
test_necessity("college tuition", 20000, 5000, 2000, 80)

# Case 2: Vacation (Low Necessity)
test_necessity("summer vacation", 5000, 1000, 500, 60)

# Case 3: Vacation but Rich (Low Necessity, Self-Fund Advice)
test_necessity("luxury trip", 5000, 20000, 10000, 90)

# Case 4: Business (Conditional)
test_necessity("small business capital", 50000, 10000, 5000, 75)
