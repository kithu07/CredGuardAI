import React, { useEffect, useState } from 'react';
import { getLoanComparisons } from '@/services/loanService';
import { LenderComparison } from '@/types';
import { Check, X, Shield, Info } from 'lucide-react';

export const ComparisonTable = () => {
    const [lenders, setLenders] = useState<LenderComparison[]>([]);

    useEffect(() => {
        getLoanComparisons().then(setLenders);
    }, []);

    if (lenders.length === 0) return <div className="p-4 text-center text-slate-500">Loading market rates...</div>;

    return (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm mt-8">
            <div className="p-4 border-b border-slate-100 bg-slate-50">
                <h3 className="text-lg font-bold text-slate-900 flex items-center">
                    <Shield className="w-5 h-5 mr-2 text-blue-600" /> Market Comparison
                </h3>
            </div>
            <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 uppercase bg-slate-50">
                    <tr>
                        <th className="px-6 py-3">Lender</th>
                        <th className="px-6 py-3">Type</th>
                        <th className="px-6 py-3 text-right">Interest Rate</th>
                        <th className="px-6 py-3 text-center">Transparency</th>
                        <th className="px-6 py-3 text-center">Hidden Charges</th>
                    </tr>
                </thead>
                <tbody>
                    {lenders.map((lender) => (
                        <tr key={lender.id} className="bg-white border-b hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4 font-medium text-slate-900">{lender.name}</td>
                            <td className="px-6 py-4 text-slate-500">{lender.type}</td>
                            <td className="px-6 py-4 text-right font-bold text-slate-800">{lender.interestRate}%</td>
                            <td className="px-6 py-4 text-center">
                                <div className="w-16 h-2 bg-slate-200 rounded-full inline-block overflow-hidden">
                                    <div className="bg-emerald-500 h-full" style={{ width: `${lender.transparencyScore}%` }} />
                                </div>
                            </td>
                            <td className="px-6 py-4 text-center">
                                {lender.hiddenChargesWarning ? (
                                    <span className="inline-flex items-center px-2 py-1 bg-rose-50 text-rose-600 rounded-full text-xs font-medium">
                                        <Info className="w-3 h-3 mr-1" /> Potential
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center px-2 py-1 bg-emerald-50 text-emerald-600 rounded-full text-xs font-medium">
                                        <Check className="w-3 h-3 mr-1" /> None
                                    </span>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
