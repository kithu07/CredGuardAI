import React, { useEffect, useState } from 'react';
import { useAppFlow } from '@/context/AppFlowContext';
import { getCreditInsight } from '@/services/creditService';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Loader2, ArrowRight } from 'lucide-react';
import { Doughnut } from 'react-chartjs-2';
import '@/components/visuals/chartRegistry';

export const CreditScoreInsightScreen = () => {
    const { profile, creditInsight, setCreditInsight, setStep } = useAppFlow();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchInsight = async () => {
            if (!creditInsight) {
                setLoading(true);
                const data = await getCreditInsight(profile);
                setCreditInsight(data);
                setLoading(false);
            } else {
                setLoading(false);
            }
        };
        fetchInsight();
    }, [profile, creditInsight, setCreditInsight]);

    const scoreData = {
        labels: ['Score', 'Remaining'],
        datasets: [
            {
                data: [75, 25], // Mock visual data, dynamic based on insight if needed
                backgroundColor: [
                    creditInsight?.band === 'Excellent' ? '#10b981' : creditInsight?.band === 'Fair' ? '#f59e0b' : '#3b82f6',
                    '#e2e8f0'
                ],
                borderWidth: 0,
                circumference: 180,
                rotation: 270,
            },
        ],
    };

    const chartOptions = {
        cutout: '80%',
        plugins: { legend: { display: false }, tooltip: { enabled: false } },
        maintainAspectRatio: false,
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-12 space-y-4">
                <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
                <p className="text-slate-600 font-medium">Analyzing credit health simulation...</p>
            </div>
        );
    }

    if (!creditInsight) return null;

    return (
        <div className="w-full max-w-3xl mx-auto space-y-8 animate-in fade-in zoom-in duration-500 text-center">
            <div className="mb-4">
                <h2 className="text-3xl font-bold text-slate-900">Your Credit Insight</h2>
                <p className="text-slate-600">Based on the provided financial profile.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 items-center">
                <Card className="p-8 flex flex-col items-center justify-center relative min-h-[300px]">
                    <div className="w-64 h-32 relative mb-4">
                        <Doughnut data={scoreData} options={chartOptions} />
                        <div className="absolute inset-0 top-10 flex flex-col items-center justify-center">
                            <span className={`text-3xl font-bold ${creditInsight.band === 'Excellent' ? 'text-emerald-600' :
                                    creditInsight.band === 'Fair' ? 'text-amber-600' : 'text-blue-600'
                                }`}>
                                {creditInsight.scoreRange}
                            </span>
                            <span className="text-sm font-semibold text-slate-400 mt-1 uppercase tracking-widest">
                                {creditInsight.band}
                            </span>
                        </div>
                    </div>

                    <div className="mt-4 text-center space-y-2">
                        <p className="text-slate-700 font-medium">Approval Probability</p>
                        <div className="w-full bg-slate-100 rounded-full h-3 max-w-[200px] mx-auto overflow-hidden">
                            <div
                                className="bg-blue-600 h-full rounded-full"
                                style={{ width: `${creditInsight.approvalProbability}%` }}
                            />
                        </div>
                        <p className="text-xs text-slate-500">{creditInsight.approvalProbability}% Chance</p>
                    </div>
                </Card>

                <div className="text-left space-y-6">
                    <div className="space-y-2">
                        <h3 className="text-xl font-bold text-slate-900">Impact Analysis</h3>
                        <p className="text-slate-600 leading-relaxed text-lg">
                            {creditInsight.impactNote}
                        </p>
                    </div>

                    <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl">
                        <p className="text-sm text-blue-800 font-medium">
                            💡 Tip: Keeping your utilization below 30% boosts your score quickly.
                        </p>
                    </div>

                    <p className="text-xs text-slate-400 italic">
                        *This score is an estimate for educational purposes only.
                    </p>

                    <Button onClick={() => setStep(5)} className="w-full py-4 text-lg">
                        See Final Verdict <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                </div>
            </div>
        </div>
    );
};
