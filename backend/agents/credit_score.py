from .base_agent import BaseAgent
from ..models import CreditScoreInput, CreditScoreOutput

class CreditScoreAgent(BaseAgent):
    def run(self, input_data: CreditScoreInput) -> CreditScoreOutput:
        # Dummy Logic
        score_band = "Good"
        approval_probability = 0.8
        predicted_impact = "Minor Dip"
        
        if input_data.missed_payments > 0:
            score_band = "Fair"
            approval_probability = 0.5
            predicted_impact = "Significant Drop"
            
        return CreditScoreOutput(
            score_band=score_band,
            approval_probability=approval_probability,
            predicted_impact=predicted_impact
        )
