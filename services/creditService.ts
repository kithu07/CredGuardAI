import { CreditInsight, FinancialProfile } from "@/types";
import { api } from "./api";

export const getCreditInsight = async (profile: FinancialProfile): Promise<CreditInsight> => {
    // Map Frontend Profile to Backend Input
    // Since frontend doesn't capture specific credit history, we infer/mock inputs for the agent based on financial health
    const debtRatio = profile.monthlyIncome > 0
        ? (profile.existingEMIs + profile.monthlyExpenses) / profile.monthlyIncome
        : 1.0;

    const body = {
        missed_payments: profile.spendingBehavior < 30 ? 2 : 0, // Infer simpler behavior
        credit_utilization_ratio: Math.min(debtRatio, 1.0), // Use debt ratio as a proxy
        credit_age_years: 5.0, // Default assumption
        active_loans: profile.existingEMIs > 0 ? 1 : 0,
    };

    try {
        const data = await api.post<{
            score_band: string;
            approval_probability: number;
            predicted_impact: string;
        }>("/agents/credit-score", body);

        // Map Backend Output to Frontend Type
        // The backend returns a single band, we can map it to a range for display
        let range = "650-700";
        const band = data.score_band as CreditInsight['band'];

        if (band === 'Excellent') range = "750-850";
        if (band === 'Good') range = "700-749";
        if (band === 'Fair') range = "650-699";
        if (band === 'Poor') range = "300-649";

        return {
            scoreRange: range,
            band: band,
            approvalProbability: data.approval_probability,
            impactNote: data.predicted_impact,
        };
    } catch (error) {
        console.error("Credit Service Error", error);
        // Fallback if API fails
        return {
            scoreRange: "---",
            band: "Fair",
            approvalProbability: 0,
            impactNote: "Could not fetch credit data. Please try again.",
        };
    }
};
