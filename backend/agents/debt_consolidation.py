from .base_agent import BaseAgent
from ..models import DebtConsolidationInput, DebtConsolidationOutput

class DebtConsolidationAgent(BaseAgent):
    def run(self, input_data: DebtConsolidationInput) -> DebtConsolidationOutput:
        # 1. Calculate weighted average rate of existing debts
        total_debt = sum(d.amount for d in input_data.existing_debts)
        if total_debt == 0:
            return DebtConsolidationOutput(
                should_consolidate=False, 
                monthly_savings=0, 
                total_savings=0, 
                recommendation="No existing debt to consolidate."
            )

        # Weighted Rate = Sum(Rate * Amount) / Total Amount
        weighted_rate = sum(d.interest_rate * d.amount for d in input_data.existing_debts) / total_debt
        
        # 2. Compare with New Loan Rate
        rate_diff = weighted_rate - input_data.new_loan_interest_rate
        
        # 3. Calculate Savings
        # Simplified: Savings = (Rate Diff / 100) * Amount * (Avg Tenure / 12)
        # Better: Calculate old total EMI vs New EMI
        
        current_total_emi = sum(d.monthly_payment for d in input_data.existing_debts)
        
        # Calculate New EMI (P * r * (1+r)^n) / ((1+r)^n - 1)
        # Rate per month
        r = input_data.new_loan_interest_rate / (12 * 100)
        n = input_data.new_loan_tenure_months
        P = input_data.new_loan_amount # Assuming we borrow enough to cover debts
        
        if P < total_debt:
            # If new loan < total debt, we can't consolidate all. 
            # Assume we consolidate partially or this is a user input error for "Consolidation Loan".
            # For MVP, assume P ~= Total Debt for consolidation analysis
            pass

        if r > 0:
            new_emi = (P * r * ((1 + r) ** n)) / (((1 + r) ** n) - 1)
        else:
            new_emi = P / n

        if current_total_emi == 0:
            # Fallback: If user didn't provide current EMI, likely they just want rate comparison.
            # Calculate theoretical savings based on Interest Rate difference only.
            # Annual Interest Save = Principal * (RateDiff / 100)
            if rate_diff > 0:
                monthly_savings = (total_debt * (rate_diff / 100)) / 12
            else:
                monthly_savings = 0
            
            # For total savings, assume new loan tenure
            total_savings = monthly_savings * n
        else:
            # Standard Cash Flow Comparison
            monthly_savings = current_total_emi - new_emi
            total_savings = monthly_savings * n

        should_consolidate = monthly_savings > 0 and rate_diff > 0.5 
        
        rec = "Consolidation is not recommended."
        if should_consolidate:
            rec = f"Consolidating your debts could save you ₹{int(monthly_savings)}/month in interest! Your current weighted interest is {weighted_rate:.1f}%, while the new loan is {input_data.new_loan_interest_rate:.1f}%."

        return DebtConsolidationOutput(
            should_consolidate=should_consolidate,
            monthly_savings=round(monthly_savings, 2),
            total_savings=round(total_savings, 2),
            recommendation=rec
        )
