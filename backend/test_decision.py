import sys
import os

sys.path.append("/home/afnash/works/HFT/CredGuardAI")

from backend.agents.decision_synthesis import DecisionSynthesisAgent
from backend.models import DecisionSynthesisInput

def test_decision(stability, burden, credit, necessity, market_fair):
    input_data = DecisionSynthesisInput(
        financial_stability_score=stability,
        loan_burden_score=burden,
        credit_score_band=credit,
        loan_necessity_level=necessity,
        market_is_fair=market_fair
    )
    agent = DecisionSynthesisAgent()
    output = agent.run(input_data)
    print(f"--- Input: Stability={stability}, Burden={burden}, Credit={credit}, Necessity={necessity}, Fair={market_fair} ---")
    print(f"Verdict: {output.verdict} (Confidence: {output.confidence})")
    print(f"Explanation: {output.explanation}")
    print("\n")

# Case 1: Perfect Scenario
test_decision(85, 20, "Excellent", "High", True)

# Case 2: Borderline Risky (Good stability but high burden)
test_decision(60, 70, "Good", "Medium", True)

# Case 3: Dangerous (Poor credit, high burden, unfair market)
test_decision(30, 80, "Poor", "Low", False)

# Case 4: Risky (Fair credit, low burden, but unfair market)
test_decision(55, 20, "Fair", "Medium", False)
