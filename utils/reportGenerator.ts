import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { FinalVerdict, LoanRequest, FinancialProfile } from '@/types';

export const generatePDFReport = (
    verdict: FinalVerdict,
    loanRequest: LoanRequest,
    profile: FinancialProfile
) => {
    const doc = new jsPDF();

    // 1. Header
    doc.setFontSize(22);
    doc.setTextColor(41, 128, 185);
    doc.text("CreditGuard AI - Financial Health Report", 105, 20, { align: 'center' });

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, 105, 28, { align: 'center' });

    // 2. Verdict Summary
    doc.setFillColor(240, 248, 255);
    doc.rect(10, 35, 190, 40, 'F');

    doc.setFontSize(16);
    doc.setTextColor(0);
    doc.text(`Final Verdict: ${verdict.riskLevel} TO TAKE`, 20, 50);

    doc.setFontSize(12);
    doc.text(`Risk Score: ${verdict.riskScore}/100`, 20, 60);
    doc.text(`Confidence: ${verdict.confidenceScore}%`, 120, 60);

    doc.setFontSize(10);
    doc.setTextColor(60);
    const splitExplanation = doc.splitTextToSize(verdict.explanation, 170);
    doc.text(splitExplanation, 20, 70);

    // 3. User Input Summary
    autoTable(doc, {
        startY: 85,
        head: [['Category', 'Details']],
        body: [
            ['Monthly Income', `Rs. ${profile.monthlyIncome.toLocaleString()}`],
            ['Loan Amount', `Rs. ${loanRequest.amount.toLocaleString()}`],
            ['Interest Rate', `${loanRequest.interestRate}% for ${loanRequest.tenureMonths} months`],
            ['Savings', `Rs. ${profile.savings.toLocaleString()}`],
            ['Credit History', `${profile.missedPayments} missed payments, ${profile.creditUtilization}% utilization`],
        ],
        theme: 'grid',
        headStyles: { fillColor: [41, 128, 185] }
    });

    // 4. Identified Risks
    // @ts-ignore
    const finalY = doc.lastAutoTable.finalY + 10;

    if (verdict.riskFlags.length > 0) {
        doc.setFontSize(14);
        doc.setTextColor(192, 57, 43);
        doc.text("Identified Risk Factors:", 14, finalY);

        verdict.riskFlags.forEach((flag, index) => {
            doc.setFontSize(11);
            doc.setTextColor(0);
            doc.text(`• ${flag}`, 20, finalY + 10 + (index * 7));
        });
    }

    // 5. AI Suggestions (if any)
    const suggestionsY = finalY + 15 + (verdict.riskFlags.length * 7);
    if (verdict.suggestions && verdict.suggestions.length > 0) {
        doc.setFontSize(14);
        doc.setTextColor(39, 174, 96);
        doc.text("AI Smart Suggestions:", 14, suggestionsY);

        let currentY = suggestionsY + 10;
        verdict.suggestions.forEach((s) => {
            doc.setFontSize(12);
            doc.setTextColor(0);
            doc.setFont("helvetica", "bold");
            doc.text(s.title, 20, currentY);

            doc.setFont("helvetica", "normal");
            doc.setFontSize(10);
            const desc = doc.splitTextToSize(s.description, 170);
            doc.text(desc, 20, currentY + 6);

            currentY += 15 + (desc.length * 4);
        });
    }

    // Save
    doc.save(`CreditGuard_Report_${new Date().getTime()}.pdf`);
};
