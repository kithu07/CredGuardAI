const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001";

export const api = {
    post: async <T>(endpoint: string, body: any): Promise<T> => {
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(body),
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error("API Call Failed:", error);
            throw error;
        }
    },
};
