from .base_agent import BaseAgent
from ..models import LoanDetailsInput, MarketComparisonOutput

class MarketComparisonAgent(BaseAgent):
    def run(self, input_data: LoanDetailsInput) -> MarketComparisonOutput:
        # Dummy Logic
        market_average_rate = 12.0
        is_fair = True
        alternatives = []
        
        if input_data.interest_rate > market_average_rate + 5:
            is_fair = False
            alternatives.append("Try Credit Union Loans (approx 10%)")
            
        return MarketComparisonOutput(
            is_fair=is_fair,
            market_average_rate=market_average_rate,
            alternatives=alternatives
        )
