import { FinalVerdict, LenderComparison, LoanRequest, FinancialProfile, RiskLevel } from "@/types";
import { api } from "./api";

// Helper interfaces for Backend Responses
export interface FinancialMentorOutput {
    advice: string[];
    recovery_plan: string;
    negotiation_script?: string; // New field
}

export interface DebtConsolidationInput {
    existing_debts: {
        name: string;
        amount: number;
        interest_rate: number;
        monthly_payment: number;
    }[];
    new_loan_amount: number;
    new_loan_interest_rate: number;
    new_loan_tenure_months: number;
}

export interface DebtConsolidationOutput {
    should_consolidate: boolean;
    monthly_savings: number;
    total_savings: number;
    recommendation: string;
}

export interface LegalReviewOutput {
    risk_clauses: {
        clause_text: string;
        risk_level: string;
        explanation: string;
        recommendation: string;
    }[];
    overall_risk: string;
    summary: string;
}

interface FinancialProfileOutput {
    stability_score: number;
    risk_flags: string[];
}

interface LoanAnalyzerOutput {
    burden_score: number;
    total_payable: number;
    hidden_traps: string[];
}

interface LoanNecessityOutput {
    necessity_level: string;
    is_necessary: boolean;
}

interface MarketComparisonOutput {
    is_fair: boolean;
    market_average_rate: number;
    alternatives: string[];
}

interface Suggestion {
    title: string;
    description: string;
    action_type: string;
}

interface DecisionSynthesisOutput {
    verdict: string;
    confidence: number;
    explanation: string;
    score: number;
    suggestions: Suggestion[];
    financial_tips: string[];
}

import { CreditInsight } from "@/types";

export const calculateVerdict = async (
    profile: FinancialProfile,
    loan: LoanRequest,
    creditInsight: CreditInsight,
    language: string = 'en'
): Promise<FinalVerdict> => {

    // 1. Get Financial Stability Score
    const profileBody = {
        income: profile.monthlyIncome,
        expenses: profile.monthlyExpenses,
        savings: profile.savings,
        emergency_fund: profile.savings, // Assuming savings includes emergency fund
        assets: profile.assets.reduce((sum, a) => sum + a.value, 0),
        existing_emis: profile.existingEMIs,
        dependents: profile.dependents,
        language
    };

    // Allow error to propagate if this fails - UI should handle loading/error state
    const financialRes = await api.post<FinancialProfileOutput>("/agents/financial-profile", profileBody);

    // 2. Analyze Loan Burden
    const loanBody = {
        amount: loan.amount,
        interest_rate: loan.interestRate,
        tenure_months: loan.tenureMonths,
        lender_name: loan.lender || "Generic Lender",
        purpose: loan.purpose,
        monthly_income: profile.monthlyIncome,
        language
    };

    const analyzerRes = await api.post<LoanAnalyzerOutput>("/agents/loan-analyzer", loanBody);

    // 3. Check Necessity
    const necessityBody = {
        loan_purpose: loan.purpose,
        loan_amount: loan.amount,
        financial_stability_score: financialRes.stability_score,
        savings: profile.savings,
        emergency_fund: profile.savings,
        language
    };

    const necessityRes = await api.post<LoanNecessityOutput>("/agents/loan-necessity", necessityBody);

    // 4. Check Market Fairness
    const marketRes = await api.post<MarketComparisonOutput>("/agents/market-comparison", loanBody);

    // 5. Final Decision Synthesis
    // Use the actual credit band from the earlier step
    const decisionBody = {
        financial_stability_score: financialRes.stability_score,
        credit_score_band: creditInsight.band,
        loan_burden_score: analyzerRes.burden_score,
        loan_necessity_level: necessityRes.necessity_level,
        market_is_fair: marketRes.is_fair,
        language,
        // Detailed Financial Context for Personalized Suggestions
        monthly_income: profile.monthlyIncome,
        monthly_expenses: profile.monthlyExpenses,
        loan_amount: loan.amount,
        existing_emis: profile.existingEMIs,
        desired_emi: analyzerRes.total_payable / loan.tenureMonths // Approximation
    };

    const finalRes = await api.post<DecisionSynthesisOutput>("/agents/decision-synthesis", decisionBody);

    // 6. Get Negotiation Script (Financial Mentor)
    const mentorBody = {
        financial_profile: {
            ...profileBody,
            // Inject Loan Details for Dynamic Negotiation Script
            lender_name: loan.lender || "the Bank",
            loan_amount: loan.amount,
            interest_rate: loan.interestRate
        },
        decision_synthesis: finalRes,
        language
    };

    let negotiationScript = "";
    try {
        const mentorRes = await api.post<FinancialMentorOutput>("/agents/financial-mentor", mentorBody);
        negotiationScript = mentorRes.negotiation_script || "";
    } catch (e) {
        console.warn("Failed to fetch negotiation script", e);
    }

    // Map to Frontend Verdict
    let riskLevel: RiskLevel = "RISKY";
    if (finalRes.verdict === "Safe") riskLevel = "SAFE";
    if (finalRes.verdict === "Dangerous") riskLevel = "DANGEROUS";

    // Use Precise Score from Backend
    // Backend 'score' is Stability/Safety (Higher is Better). 
    // Frontend 'riskScore' usually implies Higher is Riskier (visual meter goes usually from Green to Red).
    // Let's invert it: Risk Score = 100 - Safety Score.
    const riskScore = 100 - finalRes.score;

    return {
        riskLevel,
        explanation: finalRes.explanation,
        confidenceScore: Math.round(finalRes.confidence * 100),
        riskFlags: [...financialRes.risk_flags, ...analyzerRes.hidden_traps],
        riskScore: Math.max(0, Math.min(100, riskScore)),
        suggestions: finalRes.suggestions,
        financialTips: finalRes.financial_tips,
        negotiationScript // Add the script to verdict
    };
};


export const getLoanComparisons = async (loan: LoanRequest): Promise<LenderComparison[]> => {
    // Simulated Dynamic Logic: Adjust rates based on "Credit Score" (Mocked via random or stability).
    // In a real app, this would come from the market-comparison agent.
    // We'll use a randomizer seeded by loan amount to keep it consistent but "dynamic-looking" across sessions or users?
    // Better: use a base rate and adjust randomly.

    const baseRate = 10.5;
    const dynamicFactor = Math.random() * 2; // Simulated fluctuation

    return [
        {
            id: "1",
            name: "HDFC Bank",
            type: "Bank",
            interestRate: Number((baseRate + dynamicFactor - 0.5).toFixed(2)),
            transparencyScore: 95,
            hiddenChargesWarning: false,
            maxAmount: 5000000,
        },
        {
            id: "2",
            name: "Bajaj Finserv",
            type: "NBFC",
            interestRate: Number((baseRate + dynamicFactor + 1.5).toFixed(2)),
            transparencyScore: 88,
            hiddenChargesWarning: true,
            maxAmount: 2500000,
        },
        {
            id: "3",
            name: "MoneyTap",
            type: "FinTech",
            interestRate: Number((baseRate + dynamicFactor + 4.5).toFixed(2)),
            transparencyScore: 80,
            hiddenChargesWarning: false,
            maxAmount: 500000,
        }
    ];

};

export const downloadReport = async (
    profile: FinancialProfile,
    verdict: FinalVerdict,
    creditInsight: CreditInsight,
    language: string = 'en'
): Promise<Blob> => {
    // 1. Reconstruct DecisionSynthesisOutput from Frontend Verdict
    // This is a bit redundant but necessary to match backend schema expected by /generate-pdf
    // Ideally we would store the raw backend response in context.
    // For now, we map back what we can.

    const decisionBody = {
        verdict: verdict.riskLevel === "SAFE" ? "Safe" : verdict.riskLevel === "RISKY" ? "Risky" : "Dangerous",
        confidence: verdict.confidenceScore / 100,
        explanation: verdict.explanation,
        score: 100 - verdict.riskScore, // Inverting back to Safety Score
        suggestions: verdict.suggestions,
        financial_tips: verdict.financialTips
    };

    const payload = {
        financial_profile: {
            monthly_income: profile.monthlyIncome,
            monthly_expenses: profile.monthlyExpenses,
            savings: profile.savings,
            existing_emis: profile.existingEMIs,
            dependents: profile.dependents,
            assets: [], // Add required field for Pydantic model if needed, otherwise empty list
            language: language // Ensure language is passed in profile if expected
        },
        decision_synthesis: {
            ...decisionBody,
        },
        language
    };

    return await api.postBlob("/generate-pdf", payload);
};

// New Agent Functions

export const checkDebtConsolidation = async (input: DebtConsolidationInput): Promise<DebtConsolidationOutput> => {
    return await api.post<DebtConsolidationOutput>("/agents/debt-consolidation", input);
};

export const analyzeContract = async (file: File): Promise<LegalReviewOutput> => {
    return await api.postFile<LegalReviewOutput>("/agents/legal-guardian", file);
};
