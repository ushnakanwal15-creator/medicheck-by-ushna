import React from 'react';
import { MedicineResponse } from '../types';
import { AlertTriangle, ShieldCheck, Activity, AlertCircle, Info } from 'lucide-react';

interface ResultCardProps {
  data: MedicineResponse;
  requestAge: number;
}

export const ResultCard: React.FC<ResultCardProps> = ({ data, requestAge }) => {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Summary Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-teal-600 px-6 py-4 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">{data.medicineName}</h2>
            <span className="bg-teal-500/30 text-teal-50 px-3 py-1 rounded-full text-sm font-medium border border-teal-400/30">
                Patient Age: {requestAge}
            </span>
        </div>
        <div className="p-6">
            <div className="flex items-start gap-3 text-slate-700">
                <Info className="w-5 h-5 text-teal-600 mt-0.5 flex-shrink-0" />
                <p className="text-lg leading-relaxed">{data.summary}</p>
            </div>
        </div>
      </div>

      {/* Dosage & Warnings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Dosage */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
                <ShieldCheck className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-slate-900">Dosage Guidance</h3>
            </div>
            <p className="text-slate-700 leading-relaxed">{data.dosageGuidance}</p>
        </div>

        {/* Age Specific Warnings */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
                <AlertCircle className="w-5 h-5 text-amber-500" />
                <h3 className="text-lg font-semibold text-slate-900">Age-Specific Warnings</h3>
            </div>
             <p className="text-slate-700 leading-relaxed">{data.ageSpecificWarnings}</p>
        </div>
      </div>

      {/* Side Effects */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         {/* Common Side Effects */}
         <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
                <Activity className="w-5 h-5 text-slate-500" />
                <h3 className="text-lg font-semibold text-slate-900">Common Side Effects</h3>
            </div>
            <ul className="space-y-2">
                {data.commonSideEffects.map((effect, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-slate-600">
                        <span className="block w-1.5 h-1.5 mt-2 rounded-full bg-slate-400 flex-shrink-0" />
                        <span>{effect}</span>
                    </li>
                ))}
            </ul>
         </div>

         {/* Serious Side Effects */}
         <div className="bg-white rounded-2xl shadow-sm border border-red-100 p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-red-50 rounded-bl-full -mr-8 -mt-8"></div>
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-red-100 relative z-10">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <h3 className="text-lg font-semibold text-slate-900">Serious Side Effects</h3>
            </div>
            <ul className="space-y-2 relative z-10">
                {data.seriousSideEffects.map((effect, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-red-700 font-medium">
                        <span className="block w-1.5 h-1.5 mt-2 rounded-full bg-red-400 flex-shrink-0" />
                        <span>{effect}</span>
                    </li>
                ))}
            </ul>
         </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-slate-100 border border-slate-200 rounded-xl p-4 text-sm text-slate-500 text-center">
         <p className="font-medium mb-1">AI Generated Disclaimer</p>
         <p>{data.disclaimer}</p>
      </div>
    </div>
  );
};
