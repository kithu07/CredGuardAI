from fastapi import FastAPI
from backend.models import (
    FinancialProfileInput, CreditScoreInput, LoanDetailsInput, LoanNecessityInput, DecisionSynthesisInput, FinancialMentorInput,
    FinancialProfileOutput, CreditScoreOutput, LoanNecessityOutput,
    LoanAnalyzerOutput, MarketComparisonOutput, DecisionSynthesisOutput,
    FinancialMentorOutput, FinancialMentorInput
)
from backend.agents.financial_profile import FinancialProfileAgent
from backend.agents.credit_score import CreditScoreAgent
from backend.agents.loan_necessity import LoanNecessityAgent
from backend.agents.loan_analyzer import LoanAnalyzerAgent
from backend.agents.market_comparison import MarketComparisonAgent
from backend.agents.decision_synthesis import DecisionSynthesisAgent
from backend.agents.financial_mentor import FinancialMentorAgent

app = FastAPI()

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Agents
financial_profile_agent = FinancialProfileAgent()
credit_score_agent = CreditScoreAgent()
loan_necessity_agent = LoanNecessityAgent()
loan_analyzer_agent = LoanAnalyzerAgent()
market_comparison_agent = MarketComparisonAgent()
decision_synthesis_agent = DecisionSynthesisAgent()
financial_mentor_agent = FinancialMentorAgent()

@app.post("/agents/financial-profile", response_model=FinancialProfileOutput)
def run_financial_profile(data: FinancialProfileInput):
    return financial_profile_agent.run(data)

@app.post("/agents/credit-score", response_model=CreditScoreOutput)
def run_credit_score(data: CreditScoreInput):
    return credit_score_agent.run(data)

@app.post("/agents/loan-necessity", response_model=LoanNecessityOutput)
def run_loan_necessity(data: LoanNecessityInput):
    return loan_necessity_agent.run(data)

@app.post("/agents/loan-analyzer", response_model=LoanAnalyzerOutput)
def run_loan_analyzer(data: LoanDetailsInput):
    return loan_analyzer_agent.run(data)

@app.post("/agents/market-comparison", response_model=MarketComparisonOutput)
def run_market_comparison(data: LoanDetailsInput):
    return market_comparison_agent.run(data)

@app.post("/agents/decision-synthesis", response_model=DecisionSynthesisOutput)
def run_decision_synthesis(data: DecisionSynthesisInput):
    return decision_synthesis_agent.run(data)

@app.post("/agents/financial-mentor", response_model=FinancialMentorOutput)
def run_financial_mentor(data: FinancialMentorInput):
    return financial_mentor_agent.run(data)

@app.get("/")
def health_check():
    return {"status": "CredGuard AI Backend Running"}
