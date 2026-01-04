import React, { useState } from 'react';
import { useAppFlow } from '@/context/AppFlowContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ArrowRight, ArrowLeft, Wallet, PiggyBank, Users } from 'lucide-react';
import { ASSET_TYPES } from '@/constants';

const TOTAL_WIZARD_STEPS = 3;

export const FinancialProfileWizard = () => {
    const { profile, updateProfile, setStep } = useAppFlow();
    const [wizardStep, setWizardStep] = useState(1);

    const handleNext = () => {
        if (wizardStep < TOTAL_WIZARD_STEPS) {
            setWizardStep(prev => prev + 1);
        } else {
            setStep(3); // Go to Loan Details
        }
    };

    const handleBack = () => {
        if (wizardStep > 1) {
            setWizardStep(prev => prev - 1);
        } else {
            setStep(1); // Back to Welcome
        }
    };

    const isStepValid = () => {
        if (wizardStep === 1) {
            return profile.monthlyIncome > 0 && profile.monthlyExpenses >= 0;
        }
        return true; // Simplified validation
    };

    return (
        <div className="w-full max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Progress Header */}
            <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-slate-900">
                        {wizardStep === 1 && "Income & Expenses"}
                        {wizardStep === 2 && "Assets & Savings"}
                        {wizardStep === 3 && "Lifestyle Profile"}
                    </h2>
                    <span className="text-sm font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                        Step {wizardStep} of {TOTAL_WIZARD_STEPS}
                    </span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div
                        className="bg-blue-600 h-full transition-all duration-500"
                        style={{ width: `${(wizardStep / TOTAL_WIZARD_STEPS) * 100}%` }}
                    />
                </div>
            </div>

            <Card className="p-8 shadow-xl border-slate-100">
                {wizardStep === 1 && (
                    <div className="space-y-6">
                        <div className="flex items-center space-x-3 text-blue-600 mb-2">
                            <Wallet className="w-6 h-6" />
                            <h3 className="text-lg font-semibold">Monthly Cash Flow</h3>
                        </div>
                        <Input
                            label="Monthly Income (Post-Tax)"
                            type="number"
                            placeholder="e.g. 50000"
                            value={profile.monthlyIncome || ''}
                            onChange={(e) => updateProfile({ monthlyIncome: Number(e.target.value) })}
                            helperText="Include salary, rent, and other fixed income."
                            icon={<span className="text-gray-500">₹</span>}
                        />
                        <Input
                            label="Monthly Fixed Expenses"
                            type="number"
                            placeholder="e.g. 20000"
                            value={profile.monthlyExpenses || ''}
                            onChange={(e) => updateProfile({ monthlyExpenses: Number(e.target.value) })}
                            helperText="Rent, food, utilities, etc."
                            icon={<span className="text-gray-500">₹</span>}
                        />
                        <Input
                            label="Existing EMIs"
                            type="number"
                            placeholder="e.g. 5000"
                            value={profile.existingEMIs || ''}
                            onChange={(e) => updateProfile({ existingEMIs: Number(e.target.value) })}
                            helperText="Total of all current loan repayments."
                            icon={<span className="text-gray-500">₹</span>}
                        />
                    </div>
                )}

                {wizardStep === 2 && (
                    <div className="space-y-6">
                        <div className="flex items-center space-x-3 text-emerald-600 mb-2">
                            <PiggyBank className="w-6 h-6" />
                            <h3 className="text-lg font-semibold">Safety Net</h3>
                        </div>
                        <Input
                            label="Total Savings & Emergency Fund"
                            type="number"
                            placeholder="e.g. 200000"
                            value={profile.savings || ''}
                            onChange={(e) => updateProfile({ savings: Number(e.target.value) })}
                            helperText="Liquid cash available for emergencies."
                            icon={<span className="text-gray-500">₹</span>}
                        />

                        <div className="space-y-3">
                            <label className="block text-sm font-semibold text-gray-700">Assets Owned</label>
                            <div className="grid grid-cols-2 gap-3">
                                {ASSET_TYPES.map((asset) => (
                                    <label key={asset} className="flex items-center space-x-3 p-3 border rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
                                        <input
                                            type="checkbox"
                                            className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
                                            // Mock implementation for assets array
                                            onChange={() => { }}
                                        />
                                        <span className="text-sm font-medium text-slate-700">{asset}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {wizardStep === 3 && (
                    <div className="space-y-8">
                        <div className="flex items-center space-x-3 text-amber-600 mb-2">
                            <Users className="w-6 h-6" />
                            <h3 className="text-lg font-semibold">Personal Context</h3>
                        </div>

                        <Input
                            label="Number of Dependents"
                            type="number"
                            placeholder="e.g. 2"
                            value={profile.dependents || ''}
                            onChange={(e) => updateProfile({ dependents: Number(e.target.value) })}
                        />

                        <div className="space-y-4">
                            <div className="flex justify-between">
                                <label className="text-sm font-semibold text-gray-700">Spending Behavior</label>
                                <span className="text-sm font-medium text-blue-600">
                                    {profile.spendingBehavior > 70 ? "Needs Oriented" : profile.spendingBehavior < 30 ? "Wants Oriented" : "Balanced"}
                                </span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={profile.spendingBehavior}
                                onChange={(e) => updateProfile({ spendingBehavior: Number(e.target.value) })}
                                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                            />
                            <div className="flex justify-between text-xs text-slate-500 px-1">
                                <span>Spends on Wants</span>
                                <span>Balanced</span>
                                <span>Strictly Needs</span>
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex justify-between mt-8 pt-6 border-t border-slate-100">
                    <Button variant="secondary" onClick={handleBack}>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back
                    </Button>
                    <Button onClick={handleNext} disabled={!isStepValid()}>
                        {wizardStep === TOTAL_WIZARD_STEPS ? "Continue to Loan Details" : "Next Step"}
                        {wizardStep < TOTAL_WIZARD_STEPS && <ArrowRight className="w-4 h-4 ml-2" />}
                    </Button>
                </div>
            </Card>
        </div>
    );
};
