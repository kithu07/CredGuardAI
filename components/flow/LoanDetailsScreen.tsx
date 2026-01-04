import React, { useEffect, useState } from 'react';
import { useAppFlow } from '@/context/AppFlowContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { LENDERS, LOAN_PURPOSES } from '@/constants';
import { ArrowLeft, Calculator, AlertTriangle } from 'lucide-react';

export const LoanDetailsScreen = () => {
    const { loanRequest, updateLoanRequest, setStep, profile } = useAppFlow();
    const [emiPreview, setEmiPreview] = useState(0);

    useEffect(() => {
        const { amount, interestRate, tenureMonths } = loanRequest;
        if (amount > 0 && interestRate > 0 && tenureMonths > 0) {
            const r = interestRate / 12 / 100;
            const n = tenureMonths;
            const emi = (amount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
            setEmiPreview(Math.round(emi));
        } else {
            setEmiPreview(0);
        }
    }, [loanRequest]);

    const income = profile.monthlyIncome;
    const isHighEmi = income > 0 && emiPreview > (income * 0.4);

    return (
        <div className="w-full max-w-2xl mx-auto animate-in fade-in slide-in-from-right-8 duration-500">
            <div className="mb-8 text-center">
                <h2 className="text-3xl font-bold text-slate-900">Loan Details</h2>
                <p className="text-slate-600 mt-2">Structure your desired loan.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                <Card className="p-6 space-y-5 h-fit">
                    <Input
                        label="Loan Amount Needed"
                        type="number"
                        value={loanRequest.amount || ''}
                        onChange={(e) => updateLoanRequest({ amount: Number(e.target.value) })}
                        icon={<span className="text-gray-500">₹</span>}
                    />
                    <Input
                        label="Interest Rate (% p.a.)"
                        type="number"
                        value={loanRequest.interestRate}
                        onChange={(e) => updateLoanRequest({ interestRate: Number(e.target.value) })}
                    />
                    <Input
                        label="Tenure (Months)"
                        type="number"
                        value={loanRequest.tenureMonths}
                        onChange={(e) => updateLoanRequest({ tenureMonths: Number(e.target.value) })}
                    />

                    <div className="w-full">
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">
                            Preferred Lender (Optional)
                        </label>
                        <select
                            className="block w-full px-4 py-3 text-gray-900 bg-white border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                            value={loanRequest.lender}
                            onChange={(e) => updateLoanRequest({ lender: e.target.value })}
                        >
                            <option value="">Select a lender...</option>
                            {LENDERS.map(l => <option key={l} value={l}>{l}</option>)}
                        </select>
                    </div>

                    <div className="w-full pt-4 border-t border-slate-100">
                        <label className="block text-sm font-semibold text-gray-700 mb-3 ml-1">
                            Why are you planning to take this loan? <span className="text-rose-500">*</span>
                        </label>
                        <div className="space-y-3">
                            {LOAN_PURPOSES.map((p) => (
                                <label key={p} className={`flex items-start space-x-3 p-3 border rounded-xl cursor-pointer transition-all ${loanRequest.purpose === p ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' : 'border-gray-200 hover:bg-slate-50'}`}>
                                    <input
                                        type="radio"
                                        name="loanPurpose"
                                        value={p}
                                        checked={loanRequest.purpose === p}
                                        onChange={(e) => updateLoanRequest({ purpose: e.target.value, customPurpose: e.target.value !== 'Other' ? '' : loanRequest.customPurpose })}
                                        className="mt-1 w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                    />
                                    <span className="text-sm font-medium text-slate-700 leading-snug">{p}</span>
                                </label>
                            ))}
                        </div>

                        {loanRequest.purpose === 'Other' && (
                            <div className="mt-3 animate-in fade-in slide-in-from-top-2">
                                <Input
                                    label="Please specify details"
                                    type="text"
                                    placeholder="e.g. debt consolidation..."
                                    value={loanRequest.customPurpose || ''}
                                    onChange={(e) => updateLoanRequest({ customPurpose: e.target.value })}
                                />
                            </div>
                        )}
                    </div>
                </Card>

                <div className="space-y-6 sticky top-4 h-fit">
                    <Card variant="highlight" className="p-6 text-center space-y-4">
                        <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto text-blue-600">
                            <Calculator className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-slate-500 font-medium uppercase tracking-wide text-xs">Estimated Monthly EMI</p>
                            <p className="text-4xl font-extrabold text-slate-900 mt-2">
                                ₹{emiPreview.toLocaleString()}
                            </p>
                        </div>

                        {isHighEmi && (
                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-left flex items-start space-x-3">
                                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                                <p className="text-xs text-amber-800 leading-relaxed">
                                    <span className="font-bold">Heads up:</span> This EMI is more than 40% of your current income. This might be tight.
                                </p>
                            </div>
                        )}
                    </Card>

                    <Button
                        className="w-full py-4 text-lg"
                        onClick={() => setStep(4)}
                        disabled={loanRequest.amount <= 0 || !loanRequest.purpose || (loanRequest.purpose === 'Other' && !loanRequest.customPurpose)}
                    >
                        Check My Eligibility
                    </Button>

                    <Button variant="ghost" onClick={() => setStep(2)} className="w-full">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Profile
                    </Button>
                </div>
            </div>
        </div>
    );
};
