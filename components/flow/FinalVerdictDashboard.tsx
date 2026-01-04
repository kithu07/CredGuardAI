import React, { useEffect, useState } from 'react';
import { useAppFlow } from '@/context/AppFlowContext';
import { calculateVerdict, downloadReport } from '@/services/loanService';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ComparisonTable } from '@/components/visuals/ComparisonTable';
import { AlertOctagon, CheckCircle, AlertTriangle, Download, ArrowRight, RefreshCw, Copy, FileText, ShieldAlert } from 'lucide-react';
import { Bar, Line } from 'react-chartjs-2';
import '@/components/visuals/chartRegistry';

import { useLanguage } from '@/context/LanguageContext';
import { API_BASE_URL } from '@/services/api';

export const FinalVerdictDashboard = () => {
    const { profile, loanRequest, verdict, setVerdict, resetApp, creditInsight } = useAppFlow();
    const { t, language } = useLanguage();
    const [loading, setLoading] = useState(true);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [selectedBank, setSelectedBank] = useState<string>('HDFC_PERSONAL');

    const dataFetchedRef = React.useRef(false);

    // Auto-Play Audio Effect
    const autoPlayPolicy = async () => {
        if (!selectedBank) return;
        // Clear previous audio
        setAudioUrl(null);

        try {
            // 1. Fetch text
            const policyRes = await fetch(`${API_BASE_URL}/policies/${selectedBank}?lang=${language}`);
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
        SAFE: "text-emerald-700 bg-emerald-50 border-emerald-200",
        RISKY: "text-amber-700 bg-amber-50 border-amber-200",
        DANGEROUS: "text-rose-700 bg-rose-50 border-rose-200",
    };

    const iconMap = {
        SAFE: <CheckCircle className="w-12 h-12 text-emerald-600" />,
        RISKY: <AlertTriangle className="w-12 h-12 text-amber-600" />,
        DANGEROUS: <AlertOctagon className="w-12 h-12 text-rose-600" />,
    };

    // Dynamic Charts Data
    const monthlyEMI = loanRequest.amount * (loanRequest.interestRate / 1200); // Simple approx

    // Correct logic: Income - Expenses - ExistingEMIs - NewEMI = Remaining
    const remaining = Math.max(0, profile.monthlyIncome - (profile.monthlyExpenses + profile.existingEMIs + monthlyEMI));

    const emiIncomeData = {
        labels: ['Income', 'Expenses', 'New EMI', 'Remaining'],
        datasets: [{
            label: t('monthly_allocation'),
            data: [
                profile.monthlyIncome,
                profile.monthlyExpenses,
                monthlyEMI,
                remaining
            ],
            backgroundColor: ['#3b82f6', '#94a3b8', riskLevel === 'DANGEROUS' ? '#f43f5e' : '#f59e0b', '#10b981'],
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
                            {riskLevel === 'SAFE' ? t('verdict_safe') : riskLevel === 'RISKY' ? t('verdict_risky') : t('verdict_dangerous')}
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
                        <span>{t('safe_label')}</span>
                        <span>{t('critical_label')}</span>
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
                    <h3 className="text-lg font-bold text-slate-900 mb-4">{t('budget_impact')}</h3>
                    <div className="h-64">
                        <Bar
                            data={emiIncomeData}
                            options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }}
                        />
                    </div>
                </Card>
                <Card className="p-6">
                    <h3 className="text-lg font-bold text-slate-900 mb-4">{t('savings_projection')}</h3>
                    <div className="h-64">
                        <Line
                            data={savingsProjectionData}
                            options={{ maintainAspectRatio: false, scales: { y: { beginAtZero: false } } }}
                        />
                    </div>
                </Card>
            </div>

            {/* NEW: T&C Audio Player */}
            <Card className="p-6">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div>
                        <h3 className="text-xl font-bold text-slate-900">{t('listen_tc')}</h3>
                        <p className="text-slate-500 text-sm">{t('listen_tc_sub')}</p>
                    </div>

                    <div className="flex gap-2 items-center">
                        <select
                            className="p-2 border rounded-md"
                            value={selectedBank}
                            onChange={(e) => setSelectedBank(e.target.value)}
                        >
                            <option value="HDFC_PERSONAL">HDFC Personal</option>
                            <option value="BAJAJ_EMI">Bajaj EMI</option>
                            <option value="SBI_HOME">SBI Home</option>
                        </select>
                        <Button onClick={() => autoPlayPolicy()}>
                            {/* Keep manual play button just in case, but auto-play runs on change */}
                            {t('play_audio')}
                        </Button>
                    </div>
                </div>

                {audioUrl && (
                    <div className="mt-6 bg-slate-50 p-4 rounded-lg flex justify-center">
                        <audio controls autoPlay src={audioUrl} className="w-full max-w-md" />
                    </div>
                )}
            </Card>

            {/* 3. AI Suggestions (Smart Alternatives) */}
            {suggestions && suggestions.length > 0 && (
                <Card variant="highlight" className="p-8 border-l-4 border-l-blue-500">
                    <h3 className="text-2xl font-bold text-slate-900 mb-6">💡 {t('smart_alternatives')}</h3>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            {suggestions.map((s, idx) => (
                                <div key={idx} className="p-4 bg-white rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                                    <h4 className="font-bold text-blue-700 mb-1">{s.title}</h4>
                                    <p className="text-sm text-slate-600">{s.description}</p>
                                </div>
                            ))}
                        </div>

                        {/* Financial Literacy Tips / Mentor Note */}
                        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-6 rounded-xl flex flex-col justify-between">
                            <div>
                                <h4 className="font-bold text-indigo-900 mb-3 flex items-center">
                                    🎓 {t('financial_wisdom')}
                                </h4>
                                <ul className="space-y-3">
                                    {financialTips?.map((tip, idx) => (
                                        <li key={idx} className="text-sm text-indigo-800 flex items-start">
                                            <span className="mr-2 text-indigo-500">•</span>
                                            {tip}
                                        </li>
                                    )) || (
                                            <li className="text-sm text-indigo-800">
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
                    <Card className="p-6 border-l-4 border-l-purple-500">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-purple-600" />
                                    {t('negotiation_script') || "Negotiation Script"}
                                </h3>
                                <p className="text-sm text-slate-500">Read this to your bank manager.</p>
                            </div>
                            <Button variant="ghost" onClick={() => navigator.clipboard.writeText(verdict.negotiationScript || "")} className="p-2 h-auto">
                                <Copy className="w-4 h-4" />
                            </Button>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-lg text-slate-700 italic border border-slate-200">
                            "{verdict.negotiationScript}"
                        </div>
                    </Card>
                )}

                {/* Legal Guardian (Contract Scanner) */}
                <Card className="p-6 border-l-4 border-l-red-500">
                    <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2 mb-2">
                        <ShieldAlert className="w-5 h-5 text-red-600" />
                        {t('legal_guardian') || "Legal Guardian"}
                    </h3>
                    <p className="text-sm text-slate-500 mb-4">Upload a Loan Agreement PDF to scan for predatory clauses.</p>

                    <ContractScanner />
                </Card>

                {/* Debt Consolidation Calculator */}
                <Card className="p-6 border-l-4 border-l-orange-500">
                    <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2 mb-2">
                        <RefreshCw className="w-5 h-5 text-orange-600" />
                        Debt Switch Calculator
                    </h3>
                    <p className="text-sm text-slate-500 mb-4">Check if this new loan can save you money on old debts.</p>
                    <DebtSwitchCalculator currentLoanRate={loanRequest.interestRate} />
                </Card>
            </div>

            {/* 6. Comparison Table */}
            <ComparisonTable />

            {/* 7. Actions */}
            <div className="flex flex-col sm:flex-row justify-center gap-4 pt-8">
                <Button variant="secondary" className="w-full sm:w-auto" onClick={() => resetApp()}>
                    <RefreshCw className="w-4 h-4 mr-2" /> {t('start_new')}
                </Button>
                <Button className="w-full sm:w-auto" onClick={async () => {
                    try {
                        const blob = await downloadReport(profile, verdict!, creditInsight!, language);
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

const DebtSwitchCalculator = ({ currentLoanRate }: { currentLoanRate: number }) => {
    const [debtAmount, setDebtAmount] = useState<string>("");
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
                    monthly_payment: 0 // Not needed for MVP calc
                }],
                new_loan_amount: parseFloat(debtAmount), // Assuming full refinance
                new_loan_interest_rate: currentLoanRate,
                new_loan_tenure_months: 12 // Default 1 year for comparison
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
