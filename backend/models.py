from pydantic import BaseModel
from typing import List, Optional, Dict, Any

class FinancialProfileInput(BaseModel):
    income: float
    expenses: float
    savings: float
    emergency_fund: float = 0.0
    assets: float
    existing_emis: float
    dependents: int

class CreditScoreInput(BaseModel):
    missed_payments: int
    credit_utilization_ratio: float
    credit_age_years: float
    active_loans: int
    cibil_score: Optional[int] = None # Added for precise tracking


class LoanDetailsInput(BaseModel):
    amount: float
    interest_rate: float
    tenure_months: int
    lender_name: str
    purpose: str
    monthly_income: float = 0.0 # Added for Affordability/DTI calculation

class LoanNecessityInput(BaseModel):
    loan_purpose: str
    loan_amount: float
    financial_stability_score: float
    savings: float
    emergency_fund: float

class FinancialProfileOutput(BaseModel):
    stability_score: float # 0-100
    risk_flags: List[str]

class CreditScoreOutput(BaseModel):
    score_band: str # Poor, Fair, Good, Excellent
    approval_probability: float
    predicted_impact: str

class LoanNecessityOutput(BaseModel):
    necessity_level: str # High, Medium, Low
    is_necessary: bool
    confidence: float
    reasoning: str
    risk_flags: List[str]

class LoanAnalyzerOutput(BaseModel):
    burden_score: float # 0-100 (Higher is worse)
    total_payable: float
    hidden_traps: List[str]

class MarketComparisonOutput(BaseModel):
    is_fair: bool
    market_average_rate: float
    alternatives: List[str]

class DecisionSynthesisInput(BaseModel):
    financial_stability_score: float # 0-100
    credit_score_band: str # Poor, Fair, Good, Excellent
    loan_burden_score: float # 0-100 (Higher is worse)
    loan_necessity_level: str # High, Medium, Low
    market_is_fair: bool 
    language: str = "en" # 'en' or 'ml' 

class Suggestion(BaseModel):
    title: str
    description: str
    action_type: str # e.g., "lower_amount", "wait_save", "alternative"

class DecisionSynthesisOutput(BaseModel):
    verdict: str # Safe, Risky, Dangerous
    confidence: float
    explanation: str
    score: float # 0-100 (Higher is Safer)
    suggestions: List[Suggestion] = []
    financial_tips: List[str] = []

class FinancialMentorInput(BaseModel):
    financial_profile: Dict[str, Any]
    decision_synthesis: DecisionSynthesisOutput 
    language: str = "en" 

class FinancialMentorOutput(BaseModel):
    advice: List[str]
    recovery_plan: str
    negotiation_script: str = "" # Script to read to the bank

class DebtItem(BaseModel):
    name: str # e.g. "Credit Card"
    amount: float
    interest_rate: float
    monthly_payment: float

class DebtConsolidationInput(BaseModel):
    existing_debts: List[DebtItem]
    new_loan_amount: float
    new_loan_interest_rate: float
    new_loan_tenure_months: int

class DebtConsolidationOutput(BaseModel):
    should_consolidate: bool
    monthly_savings: float
    total_savings: float
    recommendation: str

class RiskClause(BaseModel):
    clause_text: str
    risk_level: str # 'High', 'Medium', 'Low'
    explanation: str
    recommendation: str

class LegalReviewOutput(BaseModel):
    risk_clauses: List[RiskClause]
    overall_risk: str # 'Safe', 'Caution', 'Danger'
    summary: str
