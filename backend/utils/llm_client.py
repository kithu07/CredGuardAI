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
            print(response.text)
            return response.text
        except Exception as e:
            return f"Error generating explanation: {str(e)}"

    def generate_verdict_json(self, context_json: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generates a comprehensive decision verdict in structured JSON format.
        """
        if not hasattr(self, 'client'):
            # Return Mock/Fallback if no API key
            return {
                "verdict": "Risky",
                "confidence": 0.5,
                "explanation": "Mock decision (API Key Missing).",
                "score": 50,
                "suggestions": [],
                "financial_tips": ["Secure your API key to get real advice."]
            }

        prompt = f"""
        Act as an expert Credit Risk Analyst and Financial Mentor.
        Analyze the following user financial data and loan request to provide a final verdict.
        
        LANGUAGE INSTRUCTION: 
        Respond in the language specified in the input ('language' key). 
        If 'language' is 'ml', provide the 'explanation', 'suggestions.title', 'suggestions.description', and 'financial_tips' in Malayalam (Manglish script allowed if highly technical, but script preferred).
        If 'language' is 'en' or missing, use English.
        
        INPUT DATA:
        {context_json}
        
        OUTPUT SCHEMA (JSON):
        {{
            "verdict": "Safe" | "Risky" | "Dangerous",
            "confidence": float (0.0 - 1.0),
            "score": float (0-100, where 100 is Safest, 0 is Dangerous),
            "explanation": "Clear, empathetic explanation of why this verdict was reached.",
            "suggestions": [
                {{
                    "title": "Short title",
                    "description": "Detailed alternative suggestion",
                    "action_type": "lower_amount" | "wait_save" | "shorter_tenure" | "alternative"
                }}
            ],
            "financial_tips": ["Tip 1", "Tip 2"]
        }}
        
        LOGIC RULES (STRICT BANKING STANDARDS):
        1. **High Burden**: If 'loan_burden_score' > 50, the verdict MUST be "Risky" or "Dangerous". Never "Safe".
        2. **Stability Check**: If 'financial_stability_score' < 50, the verdict cannot be "Safe".
        3. **Credit Drag**: If 'credit_score_band' is "Poor", the maximum 'score' is 45 (Dangerous).
        4. **Income vs Loan**: If 'loan_amount' > 5x 'monthly_income', treat as high risk.
        5. **Verdict Definitions**:
            - "Safe": Stability > 70 AND Burden < 30 AND Credit != Poor.
            - "Dangerous": Burden > 70 OR Stability < 30 OR Credit == Poor.
            - "Risky": Anything in between.
        
        SUGGESTION GUIDELINES (BE SPECIFIC):
        1. Use the specific numbers provided in INPUT DATA (Income, Loan Amount, EMIs).
        2. Instead of "Save more", say "Try to cut your monthly expenses by ₹[Specific Amount]".
        3. Instead of "Borrow less", say "Consider reducing the loan amount to ₹[Lower Amount] to match your 40% EMI limit".
        4. If 'existing_emis' is high, suggest consolidating specific debts.
        5. Provide 2-3 highly actionable, concrete suggestions.

        Note: The user needs honest protection, not false hope. Be conservative.
        """
        
        try:
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=prompt,
                config={
                    'response_mime_type': 'application/json'
                }
            )
            import json
            print("gemini set aayeeee!")
            return json.loads(response.text)
        except Exception as e:
            print(f"LLM Error: {e}")
            # Fallback
            return {
                "verdict": "Risky",
                "confidence": 0.0,
                "explanation": "AI Analysis Failed. Please try again.",
                "score": 50,
                "suggestions": [],
                "financial_tips": []
            }

    def generate_negotiation_script(self, context_json: Dict[str, Any]) -> str:
        """
        Generates a highly personalized negotiation script.
        """
        if not hasattr(self, 'client'):
            return "Negotiation script unavailable (Missing API Key)."

        prompt = f"""
        You are a tough but polite Loan Negotiation expert.
        Write a SHORT, direct script (3-4 text lines max) that the user can read or email to their bank manager to get a better interest rate.
        
        INPUT DATA:
        {context_json}
        
        STRATEGY RULES:
        1. If Credit Score is "Good" or "Excellent": Leverage it heavily. Mention specific score if available.
        2. If Credit Score is "Fair" or "Poor": Focus on "Loyalty" or "Stability" (Income) instead of score.
        3. Mention the "Target Interest Rate" (e.g. 0.5% - 1% lower than offered).
        4. Reference the specific "Lender Name" if provided.
        5. Tone: Professional, confident, but not aggressive.
        6. Language: Return ONLY the script text in quotes. No "Here is the script:".
        
        EXAMPLE OUPUT:
        "Hello Manager, I've been a loyal customer for years. Given my credit score of 780, I noticed other banks offering 10.5%. Can you match that rate for me?"
        """
        
        try:
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=prompt
            )
            return response.text.replace('"', '').strip() # Clean quotes
        except Exception as e:
            return f"Error generating script: {str(e)}"
