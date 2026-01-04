import os
import google.genai as genai
from typing import Dict, Any

class LLMClient:
    def __init__(self):
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            print("Warning: GEMINI_API_KEY not found. LLM features will return mock data.")
        else:
            self.client = genai.Client(api_key=api_key)
            self.model_name = 'gemini-2.5-flash'
            print("Gemini API key kitti.")

    def generate_explanation(self, context_json: Dict[str, Any]) -> str:
        if not hasattr(self, 'client'):
            return "LLM Explanation unavailable (Missing API Key)."

        prompt = f"""
        You are a kind, empathetic, and wise Financial Mentor.
        Your goal is to explain the following financial decision to a user in plain English.
        
        RULES:
        1. Do NOT change the 'verdict' or any numeric scores.
        2. Be non-judgmental. If the result is 'Dangerous', say "This loan might put you in a tough spot" rather than "You are broke".
        3. Explain *why* based on the input data.
        4. Focus on the "recovery_plan" or "advice" if the verdict is not Safe.
        
        INPUT DATA:
        {context_json}
        
        OUTPUT:
        Produce a short, human-readable paragraph (2-3 sentences) explaining the situation and offering guidance.
        """
        
        try:
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=prompt
            )
            return response.text
        except Exception as e:
            return f"Error generating explanation: {str(e)}"
