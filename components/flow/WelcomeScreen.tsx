import React from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAppFlow } from '@/context/AppFlowContext';
import { APP_NAME, TAGLINE } from '@/constants';
import { ShieldCheck } from 'lucide-react';

import { useLanguage } from '@/context/LanguageContext';

export const WelcomeScreen = () => {
    const { setStep } = useAppFlow();
    const { t } = useLanguage();

    return (
        <div className="w-full max-w-2xl mx-auto text-center space-y-8 animate-in fade-in zoom-in duration-500">
            <div className="flex justify-center mb-6">
                <div className="bg-blue-600 p-4 rounded-2xl shadow-xl shadow-blue-500/20">
                    <ShieldCheck className="w-16 h-16 text-white" />
                </div>
            </div>

            <div className="space-y-4">
                <h1 className="text-5xl font-extrabold tracking-tight text-slate-900">
                    {t('welcome_title')}
                </h1>
                <p className="text-xl text-slate-600 font-medium">
                    {t('welcome_subtitle')}
                </p>
            </div>

            <Card variant="glass" className="mt-8 mx-auto max-w-lg">
                <div className="space-y-4 text-left">
                    <p className="text-sm font-semibold text-slate-900 uppercase tracking-wider">{t('disclaimer_title')}</p>
                    <p className="text-slate-600 leading-relaxed text-sm">
                        {t('disclaimer_text')}
                    </p>
                </div>
            </Card>

            <div className="pt-8">
                <Button
                    onClick={() => setStep(2)}
                    className="w-full max-w-sm text-lg py-4 shadow-xl shadow-blue-600/20 hover:shadow-blue-600/40 transition-all transform hover:-translate-y-1"
                >
                    {t('start_button')}
                </Button>
            </div>
        </div>
    );
};
