export interface FinancialProfile {
    monthlyIncome: number;
    monthlyExpenses: number;
    existingEMIs: number;
    savings: number;
    assets: Asset[];
    dependents: number;
    spendingBehavior: number; // 0-100 slider
}

export interface Asset {
    id: string;
    name: string;
    value: number;
}

export interface LoanRequest {
    amount: number;
    interestRate: number;
    tenureMonths: number;
    lender: string;
    purpose: string;
    customPurpose?: string;
}

export interface CreditInsight {
    scoreRange: string;
    band: 'Excellent' | 'Good' | 'Fair' | 'Poor';
    approvalProbability: number;
    impactNote: string;
}

export type RiskLevel = 'SAFE' | 'RISKY' | 'DANGEROUS';

export interface FinalVerdict {
    riskLevel: RiskLevel;
    confidenceScore: number;
    explanation: string;
    riskFlags: string[];
    riskScore: number; // 0-100
}

export interface LenderComparison {
    id: string;
    name: string;
    type: 'Bank' | 'NBFC' | 'FinTech';
    interestRate: number;
    transparencyScore: number;
    hiddenChargesWarning: boolean;
    maxAmount: number;
}
