import React, { useEffect, useState } from 'react';
import { useAppFlow } from '@/context/AppFlowContext';
import { calculateVerdict } from '@/services/loanService';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ComparisonTable } from '@/components/visuals/ComparisonTable';
import { AlertOctagon, CheckCircle, AlertTriangle, Download, ArrowRight, RefreshCw } from 'lucide-react';
import { Bar, Line } from 'react-chartjs-2';
import '@/components/visuals/chartRegistry';

export const FinalVerdictDashboard = () => {
    const { profile, loanRequest, verdict, setVerdict, resetApp } = useAppFlow();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchVerdict = async () => {
            if (!verdict) {
                setLoading(true);
                const res = await calculateVerdict(profile, loanRequest);
                setVerdict(res);
                setLoading(false);
            } else {
                setLoading(false);
            }
        };
        fetchVerdict();
    }, [profile, loanRequest, verdict, setVerdict]);

    if (loading || !verdict) {
        return (
            <div className="flex flex-col items-center justify-center p-24 space-y-6 animate-pulse">
                <div className="w-16 h-16 bg-blue-200 rounded-full"></div>
                <p className="text-xl text-slate-500 font-medium">Crunching the numbers...</p>
            </div>
        );
    }

    const { riskLevel, explanation, confidenceScore, riskFlags, riskScore } = verdict;

    const colorMap = {
        SAFE: "text-emerald-700 bg-emerald-50 border-emerald-200",
        RISKY: "text-amber-700 bg-amber-50 border-amber-200",
        DANGEROUS: "text-rose-700 bg-rose-50 border-rose-200",
    };

    const iconMap = {
        SAFE: <CheckCircle className="w-12 h-12 text-emerald-600" />,
        RISKY: <AlertTriangle className="w-12 h-12 text-amber-600" />,
        DANGEROUS: <AlertOctagon className="w-12 h-12 text-rose-600" />,
    };

    // Mock Charts Data
    const emiIncomeData = {
        labels: ['Income', 'Expenses', 'New EMI', 'Remaining'],
        datasets: [{
            label: 'Monthly Allocation',
            data: [
                profile.monthlyIncome,
                profile.monthlyExpenses,
                profile.existingEMIs + ((loanRequest.amount * 0.02)), // Rough EMI est
                profile.monthlyIncome - (profile.monthlyExpenses + profile.existingEMIs + (loanRequest.amount * 0.02))
            ],
            backgroundColor: ['#3b82f6', '#94a3b8', riskLevel === 'DANGEROUS' ? '#f43f5e' : '#f59e0b', '#10b981'],
            borderRadius: 8,
        }]
    };

    const savingsProjectionData = {
        labels: ['Now', '3 Months', '6 Months', '12 Months', '24 Months'],
        datasets: [{
            label: 'Projected Savings Health',
            data: [profile.savings, profile.savings * 0.95, profile.savings * 0.9, profile.savings * 1.1, profile.savings * 1.3],
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            fill: true,
            tension: 0.4,
        }]
    };

    return (
        <div className="w-full max-w-5xl mx-auto space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-8 duration-500">

            {/* 1. Main Verdict Card */}
            <Card className={`p-8 border-2 ${colorMap[riskLevel]} shadow-lg relative overflow-hidden`} variant="white">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    {iconMap[riskLevel]}
                </div>

                <div className="flex flex-col md:flex-row items-center md:items-start gap-6 relative z-10">
                    <div className="shrink-0">
                        {iconMap[riskLevel]}
                    </div>
                    <div className="flex-1 text-center md:text-left space-y-2">
                        <h1 className="text-4xl font-extrabold tracking-tight">
                            {riskLevel === 'SAFE' ? "SAFE TO TAKE" : riskLevel === 'RISKY' ? "RISKY — THINK TWICE" : "FINANCIALLY DANGEROUS"}
                        </h1>
                        <p className="text-lg font-medium opacity-90">{explanation}</p>

                        <div className="flex items-center justify-center md:justify-start gap-4 mt-4 text-sm font-bold opacity-75">
                            <span>Confidence: {confidenceScore}%</span>
                            <span>•</span>
                            <span>Risk Score: {riskScore}/100</span>
                        </div>
                    </div>
                </div>

                {/* Risk Meter */}
                <div className="mt-8">
                    <div className="flex justify-between text-xs font-bold uppercase tracking-wider mb-2 opacity-60">
                        <span>Safe</span>
                        <span>Critical</span>
                    </div>
                    <div className="w-full h-4 bg-black/10 rounded-full overflow-hidden">
                        <div
                            className={`h-full transition-all duration-1000 ease-out ${riskLevel === 'SAFE' ? 'bg-emerald-500' : riskLevel === 'RISKY' ? 'bg-amber-500' : 'bg-rose-500'
                                }`}
                            style={{ width: `${riskScore}%` }}
                        />
                    </div>
                </div>
            </Card>

            {/* 2. Visual Analysis */}
            <div className="grid md:grid-cols-2 gap-8">
                <Card className="p-6">
                    <h3 className="text-lg font-bold text-slate-900 mb-4">Monthly Budget Impact</h3>
                    <div className="h-64">
                        <Bar
                            data={emiIncomeData}
                            options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }}
                        />
                    </div>
                </Card>
                <Card className="p-6">
                    <h3 className="text-lg font-bold text-slate-900 mb-4">Savings Projection</h3>
                    <div className="h-64">
                        <Line
                            data={savingsProjectionData}
                            options={{ maintainAspectRatio: false, scales: { y: { beginAtZero: false } } }}
                        />
                    </div>
                </Card>
            </div>

            {/* 3. Alternatives (Conditional) */}
            {(riskLevel === 'RISKY' || riskLevel === 'DANGEROUS') && (
                <Card variant="highlight" className="p-8 border-l-4 border-l-blue-500">
                    <h3 className="text-2xl font-bold text-slate-900 mb-4">💡 Smarter Alternatives</h3>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div className="p-4 bg-white rounded-xl shadow-sm border border-slate-100">
                                <h4 className="font-bold text-blue-700">Reduce Loan Amount</h4>
                                <p className="text-sm text-slate-600">Try borrowing ₹{(loanRequest.amount * 0.7).toLocaleString()} instead. This drops your EMI to a safe zone.</p>
                            </div>
                            <div className="p-4 bg-white rounded-xl shadow-sm border border-slate-100">
                                <h4 className="font-bold text-purple-700">Wait & Save</h4>
                                <p className="text-sm text-slate-600">Delay by 6 months. Save ₹5,000/mo creates a buffer.</p>
                            </div>
                        </div>
                        <div className="bg-blue-50 p-6 rounded-xl">
                            <p className="text-blue-900 italic font-medium">
                                "Financial freedom is about patience. Avoiding this debt now could save you years of stress."
                            </p>
                            <p className="text-right text-blue-600 text-sm mt-2">- Your Mentor</p>
                        </div>
                    </div>
                </Card>
            )}

            {/* 4. Comparison Table */}
            <ComparisonTable />

            {/* 5. Actions */}
            <div className="flex flex-col sm:flex-row justify-center gap-4 pt-8">
                <Button variant="secondary" className="w-full sm:w-auto" onClick={() => resetApp()}>
                    <RefreshCw className="w-4 h-4 mr-2" /> Start New Check
                </Button>
                <Button className="w-full sm:w-auto" onClick={() => alert('Report downloaded (Mock).')}>
                    <Download className="w-4 h-4 mr-2" /> Download Report
                </Button>
            </div>

        </div>
    );
};
