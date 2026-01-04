"use client";

import { useAppFlow } from "@/context/AppFlowContext";
import { WelcomeScreen } from "@/components/flow/WelcomeScreen";
import { FinancialProfileWizard } from "@/components/flow/FinancialProfileWizard";
import { LoanDetailsScreen } from "@/components/flow/LoanDetailsScreen";
import { CreditScoreInsightScreen } from "@/components/flow/CreditScoreInsightScreen";
import { FinalVerdictDashboard } from "@/components/flow/FinalVerdictDashboard";

export default function Home() {
  const { currentStep } = useAppFlow();

  return (
    <div className="w-full max-w-6xl mx-auto py-12">
      {currentStep === 1 && <WelcomeScreen />}
      {currentStep === 2 && <FinancialProfileWizard />}
      {currentStep === 3 && <LoanDetailsScreen />}
      {currentStep === 4 && <CreditScoreInsightScreen />}
      {currentStep === 5 && <FinalVerdictDashboard />}
    </div>
  );
}
