"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { FinancialProfile, LoanRequest, FinalVerdict, CreditInsight } from '@/types';

interface AppFlowState {
    currentStep: number;
    profile: FinancialProfile;
    loanRequest: LoanRequest;
    verdict: FinalVerdict | null;
    creditInsight: CreditInsight | null;
    setStep: (step: number) => void;
    updateProfile: (data: Partial<FinancialProfile>) => void;
    updateLoanRequest: (data: Partial<LoanRequest>) => void;
    setVerdict: (verdict: FinalVerdict) => void;
    setCreditInsight: (insight: CreditInsight) => void;
    resetApp: () => void;
}

const defaultProfile: FinancialProfile = {
    monthlyIncome: 0,
    monthlyExpenses: 0,
    existingEMIs: 0,
    savings: 0,
    assets: [],
    dependents: 0,
    spendingBehavior: 50,
};

const defaultLoanResult: LoanRequest = {
    amount: 0,
    interestRate: 10,
    tenureMonths: 12,
    lender: '',
};

const AppFlowContext = createContext<AppFlowState | undefined>(undefined);

export const AppFlowProvider = ({ children }: { children: ReactNode }) => {
    const [currentStep, setStep] = useState(1);
    const [profile, setProfile] = useState<FinancialProfile>(defaultProfile);
    const [loanRequest, setLoanRequest] = useState<LoanRequest>(defaultLoanResult);
    const [verdict, setVerdictState] = useState<FinalVerdict | null>(null);
    const [creditInsight, setCreditInsightState] = useState<CreditInsight | null>(null);

    const updateProfile = (data: Partial<FinancialProfile>) => {
        setProfile(prev => ({ ...prev, ...data }));
    };

    const updateLoanRequest = (data: Partial<LoanRequest>) => {
        setLoanRequest(prev => ({ ...prev, ...data }));
    };

    const setVerdict = (v: FinalVerdict) => setVerdictState(v);
    const setCreditInsight = (c: CreditInsight) => setCreditInsightState(c);

    const resetApp = () => {
        setStep(1);
        setProfile(defaultProfile);
        setLoanRequest(defaultLoanResult);
        setVerdictState(null);
        setCreditInsightState(null);
    };

    return (
        <AppFlowContext.Provider
            value={{
                currentStep,
                profile,
                loanRequest,
                verdict,
                creditInsight,
                setStep,
                updateProfile,
                updateLoanRequest,
                setVerdict,
                setCreditInsight,
                resetApp,
            }}
        >
            {children}
        </AppFlowContext.Provider>
    );
};

export const useAppFlow = () => {
    const context = useContext(AppFlowContext);
    if (!context) {
        throw new Error('useAppFlow must be used within an AppFlowProvider');
    }
    return context;
};
