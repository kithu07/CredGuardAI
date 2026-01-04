from .base_agent import BaseAgent
from ..models import LoanDetailsInput, LoanAnalyzerOutput

class LoanAnalyzerAgent(BaseAgent):
    def run(self, input_data: LoanDetailsInput) -> LoanAnalyzerOutput:
        # Dummy Logic
        total_payable = input_data.amount * (1 + (input_data.interest_rate / 100) * (input_data.tenure_months / 12))
        burden_score = 40.0
        hidden_traps = []
        
        if input_data.interest_rate > 20:
            burden_score = 80.0
            hidden_traps.append("High Interest Rate")
            
        return LoanAnalyzerOutput(
            burden_score=burden_score,
            total_payable=total_payable,
            hidden_traps=hidden_traps
        )
