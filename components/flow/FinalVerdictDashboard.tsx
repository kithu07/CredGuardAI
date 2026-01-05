import React, { useEffect, useState } from 'react';
import { useAppFlow } from '@/context/AppFlowContext';
import { calculateVerdict, downloadReport } from '@/services/loanService';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ComparisonTable } from '@/components/visuals/ComparisonTable';
import { AlertOctagon, CheckCircle, AlertTriangle, Download, ArrowRight, RefreshCw, Copy, FileText, ShieldAlert, ArrowLeft } from 'lucide-react';
import { Bar, Line } from 'react-chartjs-2';
import '@/components/visuals/chartRegistry';

import { useLanguage } from '@/context/LanguageContext';
import { API_BASE_URL } from '@/services/api';

export const FinalVerdictDashboard = () => {
    const { profile, loanRequest, verdict, setVerdict, resetApp, creditInsight, setStep } = useAppFlow();
    const { t, language } = useLanguage();
    const [loading, setLoading] = useState(true);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [selectedBank, setSelectedBank] = useState<string>('HDFC_PERSONAL');

    const dataFetchedRef = React.useRef(false);

    // Auto-Play Audio Effect
    const autoPlayPolicy = async () => {
        // Dynamic Policy Key Mapping
        let policyKey = "GENERIC";
        const purpose = (loanRequest.purpose || "").toLowerCase();
        const lender = (loanRequest.lender || "").toUpperCase();

        if (lender.includes("HDFC")) policyKey = "HDFC_PERSONAL";
        else if (lender.includes("BAJAJ")) policyKey = "BAJAJ_EMI";
        else if (lender.includes("SBI")) policyKey = "SBI_HOME";
        else if (purpose.includes("home") || purpose.includes("housing")) policyKey = "GENERIC_HOME";
        else if (purpose.includes("personal") || purpose.includes("wedding") || purpose.includes("travel")) policyKey = "GENERIC_PERSONAL";

        // Clear previous audio
        setAudioUrl(null);

        try {
            const userName = profile.name || "User";
            const loanType = loanRequest.purpose || "Loan";

            // 1. Fetch text with Personalization
            const policyRes = await fetch(`${API_BASE_URL}/policies/${policyKey}?lang=${language}&name=${userName}&loan_type=${loanType}`);
            if (!policyRes.ok) return;
            const policyJson = await policyRes.json();

            // 2. Fetch Audio
            const ttsRes = await fetch(`${API_BASE_URL}/tts/speak`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: policyJson.text, language: language })
            });
            if (!ttsRes.ok) return;

            const blob = await ttsRes.blob();
            const url = window.URL.createObjectURL(blob);
            setAudioUrl(url);
        } catch (e) {
            console.error("Auto-play failed", e);
        }
    };

    useEffect(() => {
        // Trigger only if user has interacted (conceptually), but per request "soon as chosen".
        // To avoid playing on initial load immediately, we could add a flag, but user asked "soon as chosen".
        // We'll let it play (might need user interaction policy check in browser, but let's try).
        autoPlayPolicy();
    }, [selectedBank, language]);

    useEffect(() => {
        const fetchVerdict = async () => {
            if (dataFetchedRef.current) return; // Prevent double call

            if (!verdict) {
                dataFetchedRef.current = true; // Mark as started
                setLoading(true);
                const res = await calculateVerdict(profile, loanRequest, creditInsight!, language);
                setVerdict(res);
                setLoading(false);
            } else {
                setLoading(false);
            }
        };
        fetchVerdict();
    }, [profile, loanRequest, verdict, setVerdict, creditInsight, language]);

    if (loading || !verdict) {
        return (
            <div className="flex flex-col items-center justify-center p-24 space-y-6 animate-pulse">
                <div className="w-16 h-16 bg-blue-200 rounded-full"></div>
                <p className="text-xl text-slate-500 font-medium">{t('crunching_numbers')}</p>
            </div>
        );
    }

    const { riskLevel, explanation, confidenceScore, riskFlags, riskScore, suggestions, financialTips } = verdict;

    const colorMap = {
        SAFE: "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-emerald-200",
        RISKY: "bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-amber-200",
        DANGEROUS: "bg-gradient-to-r from-rose-600 to-red-700 text-white shadow-rose-200",
    };

    const iconMap = {
        SAFE: <CheckCircle className="w-16 h-16 text-white/90 drop-shadow-md" />,
        RISKY: <AlertTriangle className="w-16 h-16 text-white/90 drop-shadow-md" />,
        DANGEROUS: <AlertOctagon className="w-16 h-16 text-white/90 drop-shadow-md" />,
    };

    // Dynamic Charts Data
    const calculatePMT = (principal: number, rate: number, months: number) => {
        if (months <= 0) return 0;
        const r = rate / 1200; // Monthly rate
        if (r === 0) return principal / months;
        // P * r * (1 + r)^n / ((1 + r)^n - 1)
        return (principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
    };

    const monthlyEMI = calculatePMT(loanRequest.amount, loanRequest.interestRate, loanRequest.tenureMonths);

    // Correct logic: Income - Expenses - ExistingEMIs - NewEMI = Remaining
    // Allow negative remaining to show deficit
    const remaining = profile.monthlyIncome - (profile.monthlyExpenses + profile.existingEMIs + monthlyEMI);

    const emiIncomeData = {
        labels: ['Income', 'Expenses', 'New EMI', 'Net Cash Flow'],
        datasets: [{
            label: t('monthly_allocation'),
            data: [
                profile.monthlyIncome,
                profile.monthlyExpenses,
                monthlyEMI,
                remaining
            ],
            backgroundColor: [
                '#3b82f6', // Blue (Income)
                '#94a3b8', // Gray (Expenses)
                riskLevel === 'DANGEROUS' ? '#f43f5e' : '#f59e0b', // Red/Amber (EMI)
                remaining >= 0 ? '#10b981' : '#ef4444' // Green (Surplus) or Red (Deficit)
            ],
            borderRadius: 8,
        }]
    };

    const savingsProjectionData = {
        labels: ['Now', '3 Months', '6 Months', '12 Months', '24 Months'],
        datasets: [{
            label: t('projected_savings_health'),
            data: [
                profile.savings,
                profile.savings + (remaining * 3),
                profile.savings + (remaining * 6),
                profile.savings + (remaining * 12),
                profile.savings + (remaining * 24)
            ],
            borderColor: remaining >= 0 ? '#3b82f6' : '#ef4444', // Blue or Red line
            backgroundColor: remaining >= 0 ? 'rgba(59, 130, 246, 0.1)' : 'rgba(239, 68, 68, 0.1)', // Blue or Red fill
            fill: true,
            tension: 0.4,
        }]
    };

    return (
        <div className="w-full max-w-5xl mx-auto space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-8 duration-500">

            {/* 1. Hero Verdict Card - Premium Gradient */}
            <div className={`rounded-3xl shadow-2xl overflow-hidden ${colorMap[riskLevel]} transition-all duration-500 hover:scale-[1.01]`}>
                <div className="p-8 md:p-10 flex flex-col md:flex-row items-start md:items-center gap-6">
                    <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl shadow-inner">
                        {iconMap[riskLevel]}
                    </div>
                    <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3">
                            <h2 className="text-4xl font-extrabold tracking-tight text-white drop-shadow-sm">
                                {verdict.riskLevel === 'SAFE' ? "Financially Sound" : verdict.riskLevel.replace('_', ' ')}
                            </h2>
                            <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold uppercase tracking-wider border border-white/10">
                                {confidenceScore}% Confidence
                            </span>
                        </div>
                        <p className="text-lg text-blue-50/90 font-medium leading-relaxed max-w-3xl">
                            {explanation}
                        </p>
                    </div>
                    <div className="bg-white/10 p-4 rounded-xl backdrop-blur-md border border-white/10 min-w-[140px] text-center">
                        <div className="text-xs font-medium text-blue-100 uppercase tracking-widest mb-1">Risk Score</div>
                        <div className="text-3xl font-bold text-white">{riskScore}/100</div>
                    </div>
                </div>

                {/* Progress Bar Strip */}
                <div className="h-2 bg-black/10 w-full relative">
                    <div
                        className="h-full bg-white/40 absolute top-0 left-0 transition-all duration-1000 ease-out"
                        style={{ width: `${riskScore}%` }}
                    />
                </div>
            </div>

            {/* 2. Visual Analysis (Charts) */}
            <div className="grid md:grid-cols-2 gap-8">
                <Card className="p-6 hover:shadow-xl transition-shadow duration-300 border-none bg-white/80 backdrop-blur-sm ring-1 ring-slate-200/60">
                    <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <span className="w-1 h-6 bg-blue-500 rounded-full"></span>
                        {t('budget_impact')}
                    </h3>
                    <div className="h-64">
                        <Bar
                            data={emiIncomeData}
                            options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: { legend: { display: false } },
                                scales: {
                                    x: { grid: { display: false } },
                                    y: { grid: { color: '#f1f5f9' }, border: { display: false } }
                                },
                                elements: { bar: { borderRadius: 6 } }
                            }}
                        />
                    </div>
                </Card>

                <Card className="p-6 hover:shadow-xl transition-shadow duration-300 border-none bg-white/80 backdrop-blur-sm ring-1 ring-slate-200/60">
                    <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <span className="w-1 h-6 bg-emerald-500 rounded-full"></span>
                        {t('savings_projection')}
                    </h3>
                    <div className="h-64">
                        <Line
                            data={savingsProjectionData}
                            options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: { legend: { display: false } },
                                scales: {
                                    x: { grid: { display: false } },
                                    y: { grid: { color: '#f1f5f9' }, border: { display: false } }
                                },
                                elements: { point: { radius: 3, hoverRadius: 6 }, line: { tension: 0.4 } }
                            }}
                        />
                    </div>
                </Card>
            </div>

            {/* T&C Audio Player (Hidden / Background) 
                User requested: "the uploaded screenshot shouldnt be physically visible to user .. instead whenever the user reached this page the speech should go like..."
            */}
            {/* 
            <Card className="p-6">
                 ... (Hidden UI) ...
            </Card> 
            */}

            {/* Audio Element for Background Play */}
            {audioUrl && (
                <div className="fixed bottom-4 right-4 z-50 opacity-80 hover:opacity-100 transition-opacity">
                    <div className="bg-slate-900 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-3">
                        <span className="text-xs font-semibold animate-pulse">
                            🔴 Advisor Speaking...
                        </span>
                        <audio controls autoPlay src={audioUrl} className="h-8 w-32" />
                        <button onClick={() => setAudioUrl(null)} className="text-xs hover:text-red-400">✖</button>
                    </div>
                </div>
            )}

            {/* 3. AI Suggestions (Smart Alternatives) */}
            {suggestions && suggestions.length > 0 && (
                <Card variant="highlight" className="p-8 border-l-4 border-l-emerald-500 bg-white shadow-lg">
                    <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                        💡 {t('smart_alternatives')}
                    </h3>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            {suggestions.map((s, idx) => (
                                <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-xl hover:border-emerald-300 transition-colors">
                                    <h4 className="font-bold text-emerald-800 mb-1 flex items-center gap-2">
                                        <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                                        {s.title}
                                    </h4>
                                    <p className="text-sm text-slate-600 leading-relaxed">{s.description}</p>
                                </div>
                            ))}
                        </div>

                        {/* Financial Literacy Tips / Mentor Note */}
                        <div className="bg-gradient-to-br from-slate-50 to-emerald-50 p-6 rounded-xl flex flex-col justify-between border border-emerald-100">
                            <div>
                                <h4 className="font-bold text-slate-800 mb-3 flex items-center border-b border-emerald-100 pb-2">
                                    🎓 {t('financial_wisdom')}
                                </h4>
                                <ul className="space-y-4">
                                    {financialTips?.map((tip, idx) => (
                                        <li key={idx} className="text-sm text-slate-700 flex items-start group">
                                            <span className="mr-3 text-emerald-500 mt-1 transition-transform group-hover:scale-125">•</span>
                                            {tip}
                                        </li>
                                    )) || (
                                            <li className="text-sm text-slate-700">
                                                "{t('financial_tip_fallback')}"
                                            </li>
                                        )}
                                </ul>
                            </div>
                            <p className="text-right text-indigo-400 text-xs mt-4 font-medium">{t('mentor_signoff')}</p>
                        </div>
                    </div>
                </Card>
            )}

            {/* 5. Smart Tools & Negotiation */}
            <div className="grid md:grid-cols-2 gap-8">
                {/* Negotiation Script */}
                {verdict.negotiationScript && (
                    <Card className="p-6 border-l-4 border-l-blue-600 bg-white hover:shadow-xl transition-all duration-300 group">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2 group-hover:text-blue-700 transition-colors">
                                    <FileText className="w-5 h-5 text-blue-600" />
                                    {t('negotiation_script') || "Negotiation Script"}
                                </h3>
                                <p className="text-sm text-slate-500">Read this to your bank manager.</p>
                            </div>
                            <Button variant="ghost" onClick={() => navigator.clipboard.writeText(verdict.negotiationScript || "")} className="p-2 h-auto text-blue-600 hover:bg-blue-50">
                                <Copy className="w-4 h-4" />
                            </Button>
                        </div>
                        <div className="bg-slate-50/50 p-4 rounded-xl text-slate-700 italic border border-blue-100/50 relative">
                            <span className="absolute top-2 left-2 text-4xl text-blue-100 font-serif leading-none">"</span>
                            <div className="relative z-10 pl-2">
                                {verdict.negotiationScript}
                            </div>
                        </div>
                    </Card>
                )}

                {/* Legal Guardian (Contract Scanner) */}
                <Card className="p-6 border-l-4 border-l-rose-500 bg-white hover:shadow-xl transition-all duration-300 group">
                    <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2 mb-2 group-hover:text-rose-700 transition-colors">
                        <ShieldAlert className="w-5 h-5 text-rose-600" />
                        {t('legal_guardian') || "Legal Guardian"}
                    </h3>
                    <p className="text-sm text-slate-500 mb-4">Upload a Loan Agreement PDF to scan for predatory clauses.</p>

                    <ContractScanner />
                </Card>

                {/* Debt Consolidation Calculator */}
                <Card className="p-6 border-l-4 border-l-amber-500 bg-white hover:shadow-xl transition-all duration-300 group">
                    <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2 mb-2 group-hover:text-amber-700 transition-colors">
                        <RefreshCw className="w-5 h-5 text-amber-600" />
                        Debt Switch Calculator
                    </h3>
                    <p className="text-sm text-slate-500 mb-4">Check if this new loan can save you money on old debts.</p>
                    <DebtSwitchCalculator currentLoanRate={loanRequest.interestRate} loanAmount={loanRequest.amount} />
                </Card>
            </div>

            {/* 6. Comparison Table */}
            <ComparisonTable />

            {/* 7. Actions */}
            <div className="flex flex-col sm:flex-row justify-center gap-4 pt-8">
                <Button variant="secondary" className="w-full sm:w-auto text-slate-600 border-slate-300 hover:bg-slate-50" onClick={() => setStep(3)}>
                    <ArrowLeft className="w-4 h-4 mr-2" /> Edit Inputs
                </Button>
                <Button variant="secondary" className="w-full sm:w-auto" onClick={() => resetApp()}>
                    <RefreshCw className="w-4 h-4 mr-2" /> {t('start_new')}
                </Button>
                <Button className="w-full sm:w-auto" onClick={async () => {
                    try {
                        const blob = await downloadReport(profile, loanRequest, verdict!, creditInsight!, language);
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.style.display = 'none';
                        a.href = url;
                        a.download = `CredGuard_Report_${new Date().toISOString().split('T')[0]}.pdf`;
                        document.body.appendChild(a);
                        a.click();
                        window.URL.revokeObjectURL(url);
                    } catch (e) {
                        alert('Failed to download report. Please try again.');
                        console.error(e);
                    }
                }}>
                    <Download className="w-4 h-4 mr-2" /> {t('download_report')}
                </Button>
            </div>

        </div>
    );
};

// Sub-components
import { analyzeContract, checkDebtConsolidation, LegalReviewOutput, DebtConsolidationOutput } from '@/services/loanService';

const ContractScanner = () => {
    const [file, setFile] = useState<File | null>(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [result, setResult] = useState<LegalReviewOutput | null>(null);

    const handleAnalyze = async () => {
        if (!file) return;
        setAnalyzing(true);
        try {
            const res = await analyzeContract(file);
            setResult(res);
        } catch (e) {
            alert("Analysis failed. Please try again.");
            console.error(e);
        } finally {
            setAnalyzing(false);
        }
    };

    return (
        <div className="space-y-4">
            {!result ? (
                <>
                    <input
                        type="file"
                        accept="application/pdf"
                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                        className="block w-full text-sm text-slate-500
                            file:mr-4 file:py-2 file:px-4
                            file:rounded-full file:border-0
                            file:text-sm file:font-semibold
                            file:bg-red-50 file:text-red-700
                            hover:file:bg-red-100"
                    />
                    <Button onClick={handleAnalyze} disabled={!file || analyzing} className="w-full bg-red-600 hover:bg-red-700 text-white">
                        {analyzing ? "Scanning..." : "Scan Contract"}
                    </Button>
                </>
            ) : (
                <div className="space-y-3 animation-in fade-in slide-in-from-bottom-2">
                    <div className="bg-red-50 p-3 rounded-md border border-red-100">
                        <h4 className="font-bold text-red-900 text-sm">Verdict: {result.overall_risk}</h4>
                        <p className="text-xs text-red-700 mt-1">{result.summary}</p>
                    </div>

                    {/* Show Full Analysis Text if it's a narrative response */}
                    {result.risk_clauses[0]?.clause_text === "Full Analysis" ? (
                        <div className="text-xs bg-white p-3 rounded border border-slate-100 max-h-60 overflow-y-auto whitespace-pre-wrap">
                            <h5 className="font-bold text-slate-800 mb-1">AI Analysis:</h5>
                            {result.risk_clauses[0].explanation}
                        </div>
                    ) : (
                        /* Standard Clause List */
                        result.risk_clauses.slice(0, 3).map((clause, idx) => (
                            <div key={idx} className="text-xs bg-white p-2 rounded border border-slate-100">
                                <span className="font-bold text-slate-700">Warning:</span> {clause.clause_text}
                                <p className="text-slate-500 mt-1 pl-2 border-l-2 border-slate-200">{clause.explanation}</p>
                            </div>
                        ))
                    )}

                    <Button variant="ghost" onClick={() => setResult(null)} className="text-xs w-full text-slate-500 py-2 h-auto">
                        Scan Another
                    </Button>
                </div>
            )}
        </div>
    );
};

const DebtSwitchCalculator = ({ currentLoanRate, loanAmount }: { currentLoanRate: number, loanAmount: number }) => {
    // Pre-fill if reasonable, or leave empty to encourage user input. 
    // User said "Dynamic based on user data".
    // If we assume the loan they are asking for is TO pay off debt, we can pre-fill.
    const [debtAmount, setDebtAmount] = useState<string>(loanAmount.toString());
    const [oldRate, setOldRate] = useState<string>("");
    const [result, setResult] = useState<DebtConsolidationOutput | null>(null);
    const [loading, setLoading] = useState(false);

    const handleCheck = async () => {
        if (!debtAmount || !oldRate) return;
        setLoading(true);
        try {
            const res = await checkDebtConsolidation({
                existing_debts: [{
                    name: "Existing Debt",
                    amount: parseFloat(debtAmount),
                    interest_rate: parseFloat(oldRate),
                    monthly_payment: 0
                }],
                new_loan_amount: parseFloat(debtAmount), // Compare apples to apples (refinancing this specific debt amount)
                new_loan_interest_rate: currentLoanRate,
                new_loan_tenure_months: 12
            });
            setResult(res);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-3">
            {!result ? (
                <>
                    <input
                        type="number"
                        placeholder="Current Debt Amount (e.g. 50000)"
                        className="w-full p-2 border rounded text-sm"
                        value={debtAmount}
                        onChange={(e) => setDebtAmount(e.target.value)}
                    />
                    <input
                        type="number"
                        placeholder="Current Interest Rate (e.g. 18%)"
                        className="w-full p-2 border rounded text-sm"
                        value={oldRate}
                        onChange={(e) => setOldRate(e.target.value)}
                    />
                    <Button onClick={handleCheck} disabled={loading || !debtAmount} className="w-full bg-orange-500 hover:bg-orange-600 text-white">
                        {loading ? "Calculating..." : "Check Savings"}
                    </Button>
                </>
            ) : (
                <div className="bg-orange-50 p-3 rounded-md border border-orange-100 animate-in fade-in">
                    <h4 className="font-bold text-orange-900 text-sm">
                        {result.should_consolidate ? "Yes, Switch!" : "Stick with Old Loan"}
                    </h4>
                    <p className="text-xs text-orange-800 mt-1">{result.recommendation}</p>
                    {result.monthly_savings > 0 && (
                        <div className="mt-2 text-sm font-bold text-green-600">
                            Save ₹{result.monthly_savings}/month
                        </div>
                    )}
                    <Button variant="ghost" onClick={() => setResult(null)} className="text-xs w-full text-slate-500 mt-2 py-1 h-auto">
                        Check Another
                    </Button>
                </div>
            )}
        </div>
    );
};
