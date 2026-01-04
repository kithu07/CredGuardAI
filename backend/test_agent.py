import sys
import os

# Add the project root to the python path
sys.path.append("/home/afnash/works/HFT/CredGuardAI")

from backend.agents.financial_profile import FinancialProfileAgent
from backend.models import FinancialProfileInput

try:
    # Test Data
    input_data = FinancialProfileInput(
        income=5000,
        expenses=3000,
        savings=1000,
        assets=10000,
        existing_emis=500,
        dependents=2
    )

    # Run Agent
    agent = FinancialProfileAgent()
    output = agent.run(input_data)
    print(f"Financial Profile Output: {output}")
    print("Test Passed!")
except Exception as e:
    print(f"Test Failed: {e}")
    sys.exit(1)
