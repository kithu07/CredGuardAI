
import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useAppFlow } from '@/context/AppFlowContext';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export const LanguageSelectionScreen = () => {
    const { setLanguage } = useLanguage();
    const { setStep } = useAppFlow();

    const handleSelect = (lang: 'en' | 'ml') => {
        setLanguage(lang);
        setStep(1); // Proceed to Welcome Screen (Step 1)
    };

    return (
        <div className="w-full max-w-lg mx-auto space-y-8 animate-in fade-in zoom-in duration-500">
            <div className="text-center space-y-4">
                <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                    CredGuard AI
                </h1>
                <p className="text-xl text-slate-600">Choose your preferred language</p>
                <p className="text-xl text-slate-600">ഭാഷ തിരഞ്ഞെടുക്കുക</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Card
                    className="p-6 cursor-pointer hover:border-blue-500 hover:shadow-lg transition-all text-center flex flex-col items-center justify-center space-y-4 h-48 group"
                    onClick={() => handleSelect('en')}
                >
                    <span className="text-5xl group-hover:scale-110 transition-transform">🇬🇧</span>
                    <span className="text-xl font-bold text-slate-800">English</span>
                </Card>

                <Card
                    className="p-6 cursor-pointer hover:border-blue-500 hover:shadow-lg transition-all text-center flex flex-col items-center justify-center space-y-4 h-48 group"
                    onClick={() => handleSelect('ml')}
                >
                    <span className="text-5xl group-hover:scale-110 transition-transform">🇮🇳</span>
                    <span className="text-xl font-bold text-slate-800">മലയാളം</span>
                </Card>
            </div>
        </div>
    );
};
