import { CreditInsight, FinancialProfile } from "@/types";
import { delay } from "@/utils/mockDelay";

export const getCreditInsight = async (profile: FinancialProfile): Promise<CreditInsight> => {
    await delay(1500); // Simulate API

    const disposableIncome = profile.monthlyIncome - profile.monthlyExpenses - profile.existingEMIs;
    const debtRatio = (profile.existingEMIs + profile.monthlyExpenses) / profile.monthlyIncome;

    let scoreRange = "720–760";
    let band: CreditInsight['band'] = "Excellent";
    let approvalProbability = 85;
    let impactNote = "This loan will have minimal impact on your excellent score.";

    if (debtRatio > 0.6) {
        scoreRange = "600–640";
        band = "Fair";
        approvalProbability = 45;
        impactNote = "Taking this loan might significantly lower your credit score.";
    } else if (debtRatio > 0.4) {
        scoreRange = "660–700";
        band = "Good";
        approvalProbability = 70;
        impactNote = "Your score resembles a healthy profile, but be cautious with new inquiries.";
    }

    return {
        scoreRange,
        band,
        approvalProbability,
        impactNote,
    };
};
