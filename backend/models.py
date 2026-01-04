from pydantic import BaseModel
from typing import List, Optional

class FinancialProfileInput(BaseModel):
    income: float
    expenses: float
    savings: float
    assets: float
    existing_emis: float
    dependents: int

class CreditScoreInput(BaseModel):
    missed_payments: int
    credit_utilization_ratio: float
    credit_age_years: float
    active_loans: int

class LoanDetailsInput(BaseModel):
    amount: float
    interest_rate: float
    tenure_months: int
    lender_name: str
    purpose: str

class FinancialProfileOutput(BaseModel):
    stability_score: float # 0-100
    risk_flags: List[str]

class CreditScoreOutput(BaseModel):
    score_band: str # Poor, Fair, Good, Excellent
    approval_probability: float
    predicted_impact: str

class LoanNecessityOutput(BaseModel):
    is_necessary: bool
    confidence: float
    reasoning: str

class LoanAnalyzerOutput(BaseModel):
    burden_score: float # 0-100 (Higher is worse)
    total_payable: float
    hidden_traps: List[str]

class MarketComparisonOutput(BaseModel):
    is_fair: bool
    market_average_rate: float
    alternatives: List[str]

class DecisionSynthesisOutput(BaseModel):
    verdict: str # Safe, Risky, Dangerous
    confidence: float
    explanation: str

class FinancialMentorOutput(BaseModel):
    advice: List[str]
    recovery_plan: str
