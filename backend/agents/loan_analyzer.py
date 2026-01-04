from .base_agent import BaseAgent
from ..models import LoanDetailsInput, LoanAnalyzerOutput

class LoanAnalyzerAgent(BaseAgent):
    def run(self, input_data: LoanDetailsInput) -> LoanAnalyzerOutput:
        # 1. Precise EMI Calculation (P x R x (1+R)^N)/((1+R)^N - 1)
        monthly_rate = (input_data.interest_rate / 12) / 100
        months = input_data.tenure_months
        
        if monthly_rate == 0:
             emi = input_data.amount / months
        else:
             emi = (input_data.amount * monthly_rate * ((1 + monthly_rate) ** months)) / (((1 + monthly_rate) ** months) - 1)
             
        total_payable = emi * months
        
        # 2. Burden Score Calculation (Now Affordability Focused)
        # We calculate a score 0-100 where higher is heavier burden.
        
        burden_score = 0.0
        hidden_traps = []

        # Factor A: Affordability (EMI to Income Ratio) - CRITICAL
        # If Income is provided (should be), this is the main driver.
        if input_data.monthly_income > 0:
            emi_income_ratio = emi / input_data.monthly_income
            # If EMI is 10% of income -> Burden 20
            # If EMI is 30% of income -> Burden 60
            # If EMI is 50% of income -> Burden 100 (Unsafe)
            affordability_burden = min(emi_income_ratio * 200, 100)
            
            burden_score = affordability_burden
            
            if emi_income_ratio > 0.5:
                hidden_traps.append(f"EMI is >50% of Income (Extremely Risky)")
            elif emi_income_ratio > 0.3:
                hidden_traps.append(f"EMI eats 30%+ of monthly income")
        else:
            # Fallback if income missing (shouldn't happen with new flow)
            burden_score = 50.0 
            hidden_traps.append("Income data missing for burden check")

        # Factor B: Cost of Credit (Interest Ratio) - Secondary
        # If you pay double the principal, that's burdensome too.
        interest_burden = (total_payable - input_data.amount) / input_data.amount
        if interest_burden > 0.5:
             burden_score += 10
             hidden_traps.append("Total Interest is >50% of Principal")
            
        # Factor C: Tenure Drag
        if months > 60:
            burden_score += 5
            hidden_traps.append("Long Tenure increases total cost")
            
        # Factor D: High Rate
        if input_data.interest_rate > 18:
            burden_score += 10
            hidden_traps.append("Very High Interest Rate")
            
        # Clamp 0-100
        final_burden = max(0, min(100, burden_score))
            
        return LoanAnalyzerOutput(
            burden_score=round(final_burden, 1),
            total_payable=round(total_payable, 2),
            hidden_traps=hidden_traps
        )
