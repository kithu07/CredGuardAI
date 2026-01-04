from .base_agent import BaseAgent
from ..models import FinancialProfileInput, FinancialProfileOutput

class FinancialProfileAgent(BaseAgent):
    def run(self, input_data: FinancialProfileInput) -> FinancialProfileOutput:
        # 1. Calculate Ratios (Continuous)
        monthly_income = input_data.income
        if monthly_income <= 0:
            return FinancialProfileOutput(stability_score=0, risk_flags=["No Income"])

        expense_ratio = input_data.expenses / monthly_income
        emi_ratio = input_data.existing_emis / monthly_income
        savings_ratio = input_data.savings / (monthly_income * 6) # Target: 6 months of income in savings
        
        # 2. Weighted Scoring Model (0-100)
        # Base starts at 100, penalized by committed outflows, boosted by savings
        # Coefficients tuned for conservative "Bank-Grade" assessment
        
        score = 100.0
        
        # Penalty: Fixed Expenses (High impact)
        # If expenses are 50% of income, penalize 25 points. If 100%, penalize 50.
        score -= (expense_ratio * 50) 
        
        # Penalty: Existing Debt (Very High impact)
        # Debt is riskier than lifestyle expenses.
        score -= (emi_ratio * 70) 
        
        # Boost: Savings Coverage (Cap at 20 points boost)
        # If you have 6 months income saved, full boost.
        savings_boost = min(savings_ratio * 20, 20)
        score += savings_boost
        
        # Penalty: Dependents (Small adjustment for liability)
        score -= (input_data.dependents * 2)
        
        # Clamp Score 0-100
        final_score = max(0, min(100, score))
        
        # 3. Dynamic Flagging
        risk_flags = []
        if expense_ratio > 0.7:
            risk_flags.append(f"High Fixed Expenses ({int(expense_ratio*100)}%)")
        if emi_ratio > 0.4:
            risk_flags.append(f"High Existing Debt ({int(emi_ratio*100)}%)")
        if savings_ratio < 0.2: # Less than ~1 month income
            risk_flags.append("Low Liquid Savings")
        if final_score < 40:
             risk_flags.append("Overall Financial Fragility")
            
        return FinancialProfileOutput(
            stability_score=round(final_score, 1),
            risk_flags=risk_flags
        )
