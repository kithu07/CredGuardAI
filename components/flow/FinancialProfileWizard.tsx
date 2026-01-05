import React, { useState, useEffect } from 'react';
import { useAppFlow } from '@/context/AppFlowContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ArrowRight, ArrowLeft, Wallet, PiggyBank, Users, Plus, Trash2, RefreshCcw } from 'lucide-react';
import { ASSET_TYPES } from '@/constants';
import { useLanguage } from '@/context/LanguageContext';

const TOTAL_WIZARD_STEPS = 3;

interface Asset {
    id: string;
    type: string;
    value: number;
    quantity?: number; // for Gold/Silver in grams
    unit?: string;
}

export const FinancialProfileWizard = () => {
    const { profile, updateProfile, setStep } = useAppFlow();
    const { t } = useLanguage();
    const [wizardStep, setWizardStep] = useState(1);

    // Asset Management State
    const [assetsList, setAssetsList] = useState<Asset[]>([]);
    const [liveRates, setLiveRates] = useState<any>(null);
    const [loadingRates, setLoadingRates] = useState(false);

    // New Asset Form State
    const [newAssetType, setNewAssetType] = useState(ASSET_TYPES[0]);
    const [newAssetValue, setNewAssetValue] = useState(''); // Value or Quantity

    // Fetch live rates on mount
    useEffect(() => {
        const fetchRates = async () => {
            setLoadingRates(true);
            try {
                // In a real app, use environment variable for API URL
                const response = await fetch('http://localhost:8000/assets/prices');
                if (response.ok) {
                    const data = await response.json();
                    setLiveRates(data);
                }
            } catch (error) {
                console.error("Failed to fetch rates", error);
            } finally {
                setLoadingRates(false);
            }
        };
        fetchRates();
    }, []);

    // Update global profile assets whenever local list changes
    useEffect(() => {
        const totalParams = assetsList.reduce((acc, curr) => acc + curr.value, 0);
        updateProfile({ assets: totalParams });
    }, [assetsList]);

    const handleAddAsset = () => {
        if (!newAssetValue) return;

        const numValue = parseFloat(newAssetValue);
        if (isNaN(numValue) || numValue <= 0) return;

        let finalValue = numValue;
        let quantity: number | undefined = undefined;
        let unit: string | undefined = undefined;

        // Calculate value for specialized assets
        if (newAssetType === 'Gold' && liveRates?.Gold) {
            quantity = numValue;
            unit = 'gram';
            finalValue = numValue * liveRates.Gold.rate;
        } else if (newAssetType === 'Silver' && liveRates?.Silver) {
            quantity = numValue;
            unit = 'gram';
            finalValue = numValue * liveRates.Silver.rate;
        }

        const newAsset: Asset = {
            id: Math.random().toString(36).substr(2, 9),
            type: newAssetType,
            value: finalValue,
            quantity,
            unit
        };

        setAssetsList([...assetsList, newAsset]);
        setNewAssetValue(''); // Reset input
    };

    const handleRemoveAsset = (id: string) => {
        setAssetsList(assetsList.filter(a => a.id !== id));
    };

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
        return true;
    };

    const getAssetInputLabel = () => {
        if (newAssetType === 'Gold' || newAssetType === 'Silver') {
            return `Quantity (Grams)`;
        }
        return `Estimated Value (₹)`;
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
                        <div className="flex items-center justify-between text-emerald-600 mb-2">
                            <div className="flex items-center space-x-3">
                                <PiggyBank className="w-6 h-6" />
                                <h3 className="text-lg font-semibold">{t('savings_title')}</h3>
                            </div>
                            {loadingRates && <span className="text-xs flex items-center bg-gray-100 px-2 py-1 rounded-lg text-gray-500"><RefreshCcw className="w-3 h-3 mr-1 animate-spin" /> Updating Rates...</span>}
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

                        <div className="pt-4 border-t border-slate-100">
                            <label className="block text-sm font-semibold text-gray-700 mb-4">{t('assets_label')}</label>

                            {/* Asset Entry Form */}
                            <div className="flex flex-col sm:flex-row gap-3 mb-6 bg-slate-50 p-4 rounded-xl border border-slate-200">
                                <div className="flex-1">
                                    <label className="text-xs text-gray-500 font-medium mb-1 block">Asset Type</label>
                                    <select
                                        className="w-full p-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                        value={newAssetType}
                                        onChange={(e) => setNewAssetType(e.target.value)}
                                    >
                                        {ASSET_TYPES.map(type => (
                                            <option key={type} value={type}>{type}</option>
                                        ))}
                                    </select>
                                    {(newAssetType === 'Gold' || newAssetType === 'Silver') && liveRates && (
                                        <p className="text-xs text-emerald-600 mt-1 font-medium">
                                            Current Rate: ₹{liveRates[newAssetType]?.rate}/{liveRates[newAssetType]?.unit}
                                        </p>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <label className="text-xs text-gray-500 font-medium mb-1 block">{getAssetInputLabel()}</label>
                                    <input
                                        type="number"
                                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                        placeholder="0"
                                        value={newAssetValue}
                                        onChange={(e) => setNewAssetValue(e.target.value)}
                                    />
                                </div>
                                <div className="flex items-end">
                                    <Button
                                        onClick={handleAddAsset}
                                        disabled={!newAssetValue}
                                        className="w-full sm:w-auto h-[42px]"
                                    >
                                        <Plus className="w-4 h-4 mr-1" /> Add
                                    </Button>
                                </div>
                            </div>

                            {/* Added Assets List */}
                            <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
                                {assetsList.length === 0 ? (
                                    <div className="text-center py-6 text-slate-400 text-sm border-2 border-dashed border-slate-200 rounded-xl">
                                        No assets added yet
                                    </div>
                                ) : (
                                    assetsList.map((asset) => (
                                        <div key={asset.id} className="flex justify-between items-center p-3 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                                            <div>
                                                <p className="font-semibold text-slate-700">{asset.type}</p>
                                                <p className="text-xs text-slate-500">
                                                    {asset.quantity ? `${asset.quantity} ${asset.unit} @ Market Rate` : 'Manual Valuation'}
                                                </p>
                                            </div>
                                            <div className="flex items-center space-x-3">
                                                <span className="font-bold text-emerald-600">₹{asset.value.toLocaleString()}</span>
                                                <button
                                                    onClick={() => handleRemoveAsset(asset.id)}
                                                    className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            <div className="mt-4 flex justify-between items-center text-sm font-semibold bg-blue-50 text-blue-800 p-3 rounded-lg">
                                <span>Total Assets Value</span>
                                <span>₹{assetsList.reduce((acc, curr) => acc + curr.value, 0).toLocaleString()}</span>
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
