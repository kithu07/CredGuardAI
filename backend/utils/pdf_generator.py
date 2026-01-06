from fpdf import FPDF
from datetime import datetime

class PDFReport(FPDF):
    def __init__(self, verdict_data, profile_data):
        super().__init__()
        self.verdict = verdict_data
        self.profile = profile_data
        self.set_auto_page_break(auto=True, margin=15)
        # self.add_font('Arial', '', 'arial.ttf', uni=True) # Removed to avoid FileNotFoundError
        
    def sanitize(self, text):
        if not isinstance(text, str):
            text = str(text)
        # partial support for Latin-1, gTTS might output utf-8
        # Simple replacements for common problematic chars
        replacements = {
            "•": "-",
            "—": "-",
            "’": "'",
            "‘": "'",
            "“": '"',
            "”": '"',
            "₹": "Rs. ",
            "–": "-"
        }
        for k, v in replacements.items():
            text = text.replace(k, v)
        
        # Finally encode/decode to strip anything else
        return text.encode('latin-1', 'replace').decode('latin-1')

    def header(self):
        # Logo/Brand
        self.set_font('Helvetica', 'B', 20)
        self.set_text_color(59, 130, 246) # Blue-500
        self.cell(0, 10, 'CredGuard AI', align='L', new_x="LMARGIN", new_y="NEXT")
        
        self.set_font('Helvetica', 'I', 10)
        self.set_text_color(100, 116, 139) # Slate-500
        self.cell(0, 5, self.sanitize(f'Financial Health Report - Generated on {datetime.now().strftime("%Y-%m-%d")}'), align='L', new_x="LMARGIN", new_y="NEXT")
        self.ln(5)
        # Line break
        self.set_draw_color(226, 232, 240)
        self.line(10, self.get_y(), 200, self.get_y())
        self.ln(10)

    def footer(self):
        self.set_y(-15)
        self.set_font('Helvetica', 'I', 8)
        self.set_text_color(150)
        self.cell(0, 10, f'Page {self.page_no()}', align='C')
        
    def chapter_title(self, label):
        self.set_font('Helvetica', 'B', 14)
        self.set_text_color(30, 41, 59) # Slate-800
        self.cell(0, 10, self.sanitize(label), new_x="LMARGIN", new_y="NEXT")
        self.ln(2)

    def chapter_body(self, text):
        self.set_font('Helvetica', '', 11)
        self.set_text_color(51, 65, 85)
        # Ensure we are at the start of the line or have space
        if self.get_x() > 20: 
            self.ln()
        try:
            self.multi_cell(0, 6, self.sanitize(text))
        except Exception:
            # Fallback for very long words or encoding issues
            self.multi_cell(0, 6, self.sanitize(text[:100] + "... (truncated)"))
        self.ln()

        return self.output()

    def calculate_technical_metrics(self):
        # Extract data with safe defaults
        amount = float(self.profile.get('loan_amount', 0))
        rate = float(self.profile.get('interest_rate', 0))
        tenure = int(self.profile.get('tenure_months', 0))
        income = float(self.profile.get('monthly_income', 0))
        existing_emis = float(self.profile.get('existing_emis', 0))

        # 1. EMI Calculation (PMT)
        emi = 0.0
        if tenure > 0 and rate > 0:
            r = rate / 1200
            emi = (amount * r * ((1 + r) ** tenure)) / (((1 + r) ** tenure) - 1)
        elif tenure > 0:
            emi = amount / tenure

        # 2. Total Cost
        total_payable = emi * tenure
        total_interest = total_payable - amount
        interest_ratio = (total_interest / total_payable * 100) if total_payable > 0 else 0

        # 3. Ratios
        new_total_emi = existing_emis + emi
        dti_ratio = (new_total_emi / income * 100) if income > 0 else 0
        
        return {
            "emi": emi,
            "total_payable": total_payable,
            "total_interest": total_interest,
            "interest_ratio": interest_ratio,
            "dti_ratio": dti_ratio,
            "amount": amount,
            "rate": rate,
            "tenure": tenure
        }

    def chapter_technical_analysis(self):
        self.chapter_title("Technical Analysis")
        metrics = self.calculate_technical_metrics()
        
        self.set_font('Helvetica', '', 10)
        self.set_fill_color(240, 249, 255) # Light Blue
        
        # Loan Structure Table
        structure_data = [
            ("Loan Amount", f"Rs. {metrics['amount']:,.2f}"),
            ("Interest Rate", f"{metrics['rate']}% p.a."),
            ("Tenure", f"{metrics['tenure']} Months"),
            ("Monthly EMI", f"Rs. {metrics['emi']:,.2f}")
        ]

        self.set_font('Helvetica', 'B', 11)
        self.cell(0, 8, "Loan Structure", new_x="LMARGIN", new_y="NEXT")
        self.ln(2)
        
        self.set_font('Helvetica', '', 10)
        for key, val in structure_data:
            self.cell(80, 8, key, border=1, fill=True)
            self.cell(0, 8, val, border=1, new_x="LMARGIN", new_y="NEXT")
            
        self.ln(5)

        # Financial Health Ratios
        self.set_font('Helvetica', 'B', 11)
        self.cell(0, 8, "Health Impact & Ratios", new_x="LMARGIN", new_y="NEXT")
        self.ln(2)

        ratio_data = [
            ("Debt-to-Income (DTI) Ratio", f"{metrics['dti_ratio']:.1f}%"),
            ("Interest Cost Ratio", f"{metrics['interest_ratio']:.1f}% of total payment"),
            ("Total Interest Payable", f"Rs. {metrics['total_interest']:,.2f}"),
            ("Total Payment (Principal + Interest)", f"Rs. {metrics['total_payable']:,.2f}")
        ]

        # Conditional Formatting for DTI
        dti = metrics['dti_ratio']
        dti_status = "(Safe)" if dti < 40 else "(Careful)" if dti < 50 else "(Dangerous)"
        
        for key, val in ratio_data:
            self.cell(80, 8, key, border=1, fill=True)
            if "DTI" in key:
                val += f" {dti_status}"
            self.cell(0, 8, val, border=1, new_x="LMARGIN", new_y="NEXT")
            
        self.ln(5)
        self.set_font('Helvetica', 'I', 9)
        self.multi_cell(0, 5, "Note: A DTI above 40% typically reduces your eligibility for future loans. High interest ratios indicate you are paying significantly more than the borrowed amount.")


    def generate(self):
        self.add_page()
        
        # 1. Verdict Banner
        risk = self.verdict.get('verdict', 'UNKNOWN').upper()
        if risk == 'SAFE':
            bg_color = (209, 250, 229) # Emerald-100
            text_color = (6, 95, 70)   # Emerald-800
        elif risk == 'RISKY':
            bg_color = (254, 243, 199) # Amber-100
            text_color = (146, 64, 14) # Amber-800
        else:
            bg_color = (255, 228, 230) # Rose-100
            text_color = (159, 18, 57) # Rose-800
            
        self.set_fill_color(*bg_color)
        self.set_text_color(*text_color)
        self.set_font('Helvetica', 'B', 16)
        self.cell(0, 15, self.sanitize(f"VERDICT: {risk}"), align='C', fill=True, new_x="LMARGIN", new_y="NEXT")
        self.ln(5)
        
        # 2. Executive Summary
        self.chapter_title("Executive Summary")
        self.chapter_body(self.verdict.get('explanation', ''))
        
        # 3. Key Metrics Table (Financial Snapshot) - REDUCED to avoid duplication
        self.chapter_title("Financial Snapshot")
        self.set_font('Helvetica', '', 10)
        self.set_fill_color(248, 250, 252)
        
        metrics = [
            ("Monthly Income", f"{self.profile.get('monthly_income', 0):,.2f}"),
            ("Monthly Expenses", f"{self.profile.get('monthly_expenses', 0):,.2f}"),
            ("Credit Score Band", self.verdict.get('credit_score_band', 'N/A')),
            ("Risk Score", f"{self.verdict.get('score', 0)}/100")
        ]
        
        for key, value in metrics:
            self.set_font('Helvetica', 'B', 10)
            self.cell(60, 8, self.sanitize(key), border=1, fill=True)
            self.set_font('Helvetica', '', 10)
            self.cell(0, 8, self.sanitize(str(value)), border=1, new_x="LMARGIN", new_y="NEXT")
            
        self.ln(10)

        # 4. Technical Analysis (NEW)
        self.chapter_technical_analysis()
        self.ln(5)
        
        # 5. AI Recommendations
        self.chapter_title("Financial Mentor Recommendations")
        tips = self.verdict.get('financial_tips', [])
        for tip in tips:
            self.set_text_color(0, 0, 0)
            full_text = f"- {self.sanitize(tip)}"
            if self.get_x() > 20: self.ln()
            try:
                self.multi_cell(0, 6, full_text)
            except Exception:
                 self.multi_cell(0, 6, full_text[:100] + "...")
        self.ln()
            
        # 6. Disclaimer
        self.ln(10)
        self.set_font('Helvetica', 'I', 9)
        self.set_text_color(100)
        self.multi_cell(0, 5, self.sanitize("DISCLAIMER: This report is generated by an AI system for informational purposes only. It does not constitute professional financial advice. Please verify all figures with a certified financial advisor before making decisions."))

        return self.output()
