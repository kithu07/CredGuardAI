from .base_agent import BaseAgent
from ..models import CreditScoreInput, CreditScoreOutput

class CreditScoreAgent(BaseAgent):
    def run(self, input_data: CreditScoreInput) -> CreditScoreOutput:
        # 0. Override if CIBIL provided
        if input_data.cibil_score and input_data.cibil_score > 300:
            cibil = input_data.cibil_score
            if cibil >= 750:
                 return CreditScoreOutput(score_band="Excellent", approval_probability=0.95, predicted_impact="None")
            elif cibil >= 700:
                 return CreditScoreOutput(score_band="Good", approval_probability=0.85, predicted_impact="Low Impact")
            elif cibil >= 650:
                 return CreditScoreOutput(score_band="Fair", approval_probability=0.60, predicted_impact="Moderate Impact")
            else:
                 return CreditScoreOutput(score_band="Poor", approval_probability=0.20, predicted_impact="Severe Impact")

        # Base Probability starts high, penalized by bad behavior
        prob = 0.95
        
        # 1. Missed Payments (Heavy Penalty)
        # 1 missed payment takes it down to ~0.75 immediately. 
        prob -= (input_data.missed_payments * 0.20)
        
        # 2. Credit Utilization (Moderate Penalty)
        # Util > 30% is standard warning. 
        if input_data.credit_utilization_ratio > 0.3:
            excess_util = input_data.credit_utilization_ratio - 0.3
            prob -= (excess_util * 0.5) # If 80% util -> 0.5 * 0.5 = 0.25 penalty
            
        # 3. Credit Age (Bonus/Penalty)
        # Short history (< 2 years) is risky? Maybe just smaller penalty.
        if input_data.credit_age_years < 2:
            prob -= 0.1
        elif input_data.credit_age_years > 5:
            prob += 0.05
            
        # 4. Active Loans
        if input_data.active_loans > 3:
            prob -= 0.05
            
        # Clamp 0.1 to 0.99
        final_prob = max(0.1, min(0.99, prob))
        
        # Determine Band based on 'virtual' score logic or just map probability
        if final_prob > 0.8:
            score_band = "Excellent"
            impact = "Minimal Impact"
        elif final_prob > 0.6:
            score_band = "Good"
            impact = "Low Impact"
        elif final_prob > 0.4:
            score_band = "Fair"
            impact = "Moderate Drop"
        else:
            score_band = "Poor"
            impact = "Severe Drop"

        return CreditScoreOutput(
            score_band=score_band,
            approval_probability=round(final_prob, 2),
            predicted_impact=impact
        )
