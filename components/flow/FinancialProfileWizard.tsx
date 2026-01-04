import React, { useState } from 'react';
import { useAppFlow } from '@/context/AppFlowContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ArrowRight, ArrowLeft, Wallet, PiggyBank, Users } from 'lucide-react';
import { ASSET_TYPES } from '@/constants';

const TOTAL_WIZARD_STEPS = 3;

import { useLanguage } from '@/context/LanguageContext';

export const FinancialProfileWizard = () => {
    const { profile, updateProfile, setStep } = useAppFlow();
    const { t } = useLanguage();
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
                        {wizardStep === 1 && t('step_income')}
                        {wizardStep === 2 && t('step_assets')}
                        {wizardStep === 3 && t('step_lifestyle')}
                    </h2>
                    <span className="text-sm font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                        {t('wizard_step')} {wizardStep} / {TOTAL_WIZARD_STEPS}
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
                            <h3 className="text-lg font-semibold">{t('step_income')}</h3>
                        </div>
                        <Input
                            label={t('income_label')}
                            type="number"
                            placeholder="e.g. 50000"
                            value={profile.monthlyIncome || ''}
                            onChange={(e) => updateProfile({ monthlyIncome: Number(e.target.value) })}
                            helperText={t('income_helper')}
                            icon={<span className="text-gray-500">₹</span>}
                        />
                        <Input
                            label={t('expenses_label')}
                            type="number"
                            placeholder="e.g. 20000"
                            value={profile.monthlyExpenses || ''}
                            onChange={(e) => updateProfile({ monthlyExpenses: Number(e.target.value) })}
                            helperText={t('expenses_helper')}
                            icon={<span className="text-gray-500">₹</span>}
                        />
                        <Input
                            label={t('emis_label')}
                            type="number"
                            placeholder="e.g. 5000"
                            value={profile.existingEMIs ?? ''}
                            onChange={(e) => updateProfile({ existingEMIs: Number(e.target.value) })}
                            helperText={t('emis_helper')}
                            icon={<span className="text-gray-500">₹</span>}
                        />
                    </div>
                )}

                {wizardStep === 2 && (
                    <div className="space-y-6">
                        <div className="flex items-center space-x-3 text-emerald-600 mb-2">
                            <PiggyBank className="w-6 h-6" />
                            <h3 className="text-lg font-semibold">{t('savings_title')}</h3>
                        </div>
                        <Input
                            label={t('savings_label')}
                            type="number"
                            placeholder="e.g. 200000"
                            value={profile.savings || ''}
                            onChange={(e) => updateProfile({ savings: Number(e.target.value) })}
                            helperText={t('savings_helper')}
                            icon={<span className="text-gray-500">₹</span>}
                        />

                        <div className="space-y-3">
                            <label className="block text-sm font-semibold text-gray-700">{t('assets_label')}</label>
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
                            <h3 className="text-lg font-semibold">{t('context_title')}</h3>
                        </div>

                        <Input
                            label={t('dependents_label')}
                            type="number"
                            placeholder="e.g. 2"
                            value={profile.dependents || ''}
                            onChange={(e) => updateProfile({ dependents: Number(e.target.value) })}
                        />

                        <div className="space-y-4">
                            <div className="flex justify-between">
                                <label className="text-sm font-semibold text-gray-700">{t('spending_label')}</label>
                                <span className="text-sm font-medium text-blue-600">
                                    {profile.spendingBehavior > 70 ? t('spending_needs') : profile.spendingBehavior < 30 ? t('spending_wants') : t('spending_balanced')}
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
                                <span>{t('spending_wants')}</span>
                                <span>{t('spending_balanced')}</span>
                                <span>{t('spending_needs')}</span>
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex justify-between mt-8 pt-6 border-t border-slate-100">
                    <Button variant="secondary" onClick={handleBack}>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        {t('back')}
                    </Button>
                    <Button onClick={handleNext} disabled={!isStepValid()}>
                        {wizardStep === TOTAL_WIZARD_STEPS ? t('continue') : t('next')}
                        {wizardStep < TOTAL_WIZARD_STEPS && <ArrowRight className="w-4 h-4 ml-2" />}
                    </Button>
                </div>
            </Card>
        </div>
    );
};
