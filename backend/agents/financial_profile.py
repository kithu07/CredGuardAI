from .base_agent import BaseAgent
from ..models import FinancialProfileInput, FinancialProfileOutput

class FinancialProfileAgent(BaseAgent):
    def run(self, input_data: FinancialProfileInput) -> FinancialProfileOutput:
        # Dummy Logic
        stability_score = 75.0
        risk_flags = []
        
        if input_data.expenses > 0.6 * input_data.income:
            risk_flags.append("High Expense Ratio")
            stability_score -= 10
            
        return FinancialProfileOutput(
            stability_score=stability_score,
            risk_flags=risk_flags
        )
