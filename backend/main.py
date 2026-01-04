from fastapi import FastAPI
from dotenv import load_dotenv
import os

from pathlib import Path

env_path = Path(__file__).parent / ".env"
load_dotenv(dotenv_path=env_path)

from backend.models import (
    FinancialProfileInput, CreditScoreInput, LoanDetailsInput, LoanNecessityInput, DecisionSynthesisInput, FinancialMentorInput,
    FinancialProfileOutput, CreditScoreOutput, LoanNecessityOutput,
    LoanAnalyzerOutput, MarketComparisonOutput, DecisionSynthesisOutput,
    FinancialMentorOutput, FinancialMentorInput
)
from backend.utils.pdf_generator import PDFReport
from backend.utils.pdf_generator import PDFReport
from backend.utils.tts_service import TTSService
from backend.utils.policy_knowledge_base import POLICY_KNOWLEDGE_BASE
from fastapi.responses import Response, StreamingResponse
from pydantic import BaseModel
from backend.agents.financial_profile import FinancialProfileAgent
from backend.agents.credit_score import CreditScoreAgent
from backend.agents.loan_necessity import LoanNecessityAgent
from backend.agents.loan_analyzer import LoanAnalyzerAgent
from backend.agents.market_comparison import MarketComparisonAgent
from backend.agents.decision_synthesis import DecisionSynthesisAgent
from backend.agents.financial_mentor import FinancialMentorAgent
from backend.agents.debt_consolidation import DebtConsolidationAgent
from backend.agents.legal_guardian import LegalGuardianAgent

from backend.models import (
    FinancialProfileInput, CreditScoreInput, LoanDetailsInput, LoanNecessityInput, DecisionSynthesisInput, FinancialMentorInput,
    FinancialProfileOutput, CreditScoreOutput, LoanNecessityOutput,
    LoanAnalyzerOutput, MarketComparisonOutput, DecisionSynthesisOutput,
    FinancialMentorOutput, FinancialMentorInput,
    DebtConsolidationInput, DebtConsolidationOutput, LegalReviewOutput
)

app = FastAPI()

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,

    allow_origins=["*", "http://localhost:3000"], # Explicitly added localhost:3000
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
debt_consolidation_agent = DebtConsolidationAgent()
legal_guardian_agent = LegalGuardianAgent()

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

@app.post("/agents/debt-consolidation", response_model=DebtConsolidationOutput)
def run_debt_consolidation(data: DebtConsolidationInput):
    return debt_consolidation_agent.run(data)

from fastapi import UploadFile, File
@app.post("/agents/legal-guardian", response_model=LegalReviewOutput)
async def run_legal_guardian(file: UploadFile = File(...)):
    content = await file.read()
    return legal_guardian_agent.run(content)

@app.post("/generate-pdf")
def generate_pdf(data: FinancialMentorInput):
    print("DEBUG: /generate-pdf endpoint hit!", flush=True)
    try:
        # Re-using FinancialMentorInput as it contains Profile (dict) and Decision (object)
        # We might need to adjust formatting as 'financial_profile' is a loose dict in that model
        
        pdf = PDFReport(
            verdict_data=data.decision_synthesis.dict(),
            profile_data=data.financial_profile
        )
        pdf_bytes = pdf.generate()
        
        print("DEBUG: PDF generated successfully", flush=True)
        return Response(
            content=bytes(pdf_bytes),
            media_type="application/pdf",
            headers={"Content-Disposition": "attachment; filename=financial_report.pdf"}
        )
    except Exception as e:
        print(f"DEBUG: Error generating PDF: {e}", flush=True)
        return Response(content=str(e), status_code=500)

    except Exception as e:
        print(f"DEBUG: Error generating PDF: {e}", flush=True)
        return Response(content=str(e), status_code=500)

class TTSInput(BaseModel):
    text: str
    language: str = "en"

@app.post("/tts/speak")
async def run_tts(data: TTSInput):
    stream = await TTSService.generate_audio_stream(data.text, data.language)
    return StreamingResponse(stream, media_type="audio/mpeg")

@app.get("/policies/{bank_code}")
def get_policy(bank_code: str, lang: str = "en"):
    policy_data = POLICY_KNOWLEDGE_BASE.get(bank_code.upper(), POLICY_KNOWLEDGE_BASE["GENERIC"])
    return {"text": policy_data.get(lang, policy_data["en"])}
def health_check():
    return {"status": "CredGuard AI Backend Running"}
