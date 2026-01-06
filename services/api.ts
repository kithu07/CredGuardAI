export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://credguardai.onrender.com";

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
    postBlob: async (endpoint: string, body: any): Promise<Blob> => {
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(body),
            });

            if (!response.ok) {
                const errText = await response.text();
                throw new Error(`API Error: ${response.status} - ${errText || response.statusText}`);
            }

            return await response.blob();
        } catch (error) {
            console.error("API Call Failed:", error);
            throw error;
        }
    },
    postFile: async <T>(endpoint: string, file: File): Promise<T> => {
        try {
            const formData = new FormData();
            formData.append("file", file);

            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: "POST",
                body: formData, // No Content-Type header; browser sets it with boundary
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error("API Call Failed:", error);
            throw error;
        }
    }
};
