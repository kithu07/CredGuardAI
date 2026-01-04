import { FinalVerdict, LenderComparison, LoanRequest, FinancialProfile, RiskLevel } from "@/types";
import { delay } from "@/utils/mockDelay";

export const calculateVerdict = async (
    profile: FinancialProfile,
    loan: LoanRequest
): Promise<FinalVerdict> => {
    await delay(2000);

    // Calculate EMI: P * r * (1+r)^n / ((1+r)^n - 1)
    // r = monthly rate
    const r = loan.interestRate / 12 / 100;
    const n = loan.tenureMonths;
    const emi = (loan.amount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);

    const totalObligations = profile.monthlyExpenses + profile.existingEMIs + emi;
    const income = profile.monthlyIncome;
    const debtToIncome = totalObligations / income;

    let riskLevel: RiskLevel = "SAFE";
    let explanation = "Your financial health is robust enough to handle this loan comfortably.";
    let confidenceScore = 92;
    let riskScore = 20;
    const riskFlags: string[] = [];

    if (debtToIncome > 0.60) {
        riskLevel = "DANGEROUS";
        explanation = "This loan would put you in severe financial stress. Your monthly obligations would exceed 60% of your income.";
        confidenceScore = 95;
        riskScore = 85;
        riskFlags.push("High Debt-to-Income Ratio", "Low Savings Buffer");
    } else if (debtToIncome > 0.45) {
        riskLevel = "RISKY";
        explanation = "You can afford this, but it will be tight. A small emergency could disrupt repayment.";
        confidenceScore = 80;
        riskScore = 55;
        riskFlags.push("Moderate Debt Strain", " reduced discretionary spending");
    }

    return {
        riskLevel,
        explanation,
        confidenceScore,
        riskFlags,
        riskScore,
    };
};


export const getLoanComparisons = async (): Promise<LenderComparison[]> => {
    await delay(1000);
    return [
        {
            id: "1",
            name: "HDFC Bank",
            type: "Bank",
            interestRate: 10.5,
            transparencyScore: 95,
            hiddenChargesWarning: false,
            maxAmount: 5000000,
        },
        {
            id: "2",
            name: "Bajaj Finserv",
            type: "NBFC",
            interestRate: 12.0,
            transparencyScore: 88,
            hiddenChargesWarning: true,
            maxAmount: 2500000,
        },
        {
            id: "3",
            name: "MoneyTap",
            type: "FinTech",
            interestRate: 15.0,
            transparencyScore: 80,
            hiddenChargesWarning: false,
            maxAmount: 500000,
        }
    ];
};
