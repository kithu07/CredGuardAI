import { FinancialProfile } from "@/types";
import { delay } from "@/utils/mockDelay";

export const validateProfile = async (profile: FinancialProfile): Promise<{ valid: boolean; message?: string }> => {
    await delay(500);
    if (profile.monthlyIncome <= 0) {
        return { valid: false, message: "Income must be greater than zero." };
    }
    return { valid: true };
};
