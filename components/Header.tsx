import React from 'react';
import { Stethoscope, Globe } from 'lucide-react';
import { LanguageOption } from '../types';

interface HeaderProps {
  selectedLanguage: string;
  onLanguageChange: (lang: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ selectedLanguage, onLanguageChange }) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
      <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-3 flex-wrap">
        <div className="bg-teal-100 p-2 rounded-full flex-shrink-0">
          <Stethoscope className="w-6 h-6 text-teal-600" />
        </div>
        <div className="flex-grow sm:flex-grow-0">
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">MediCheck by USHNA</h1>
          <p className="text-xs text-slate-500 font-medium">AI-Powered Medicine Guide</p>
        </div>
        
        <div className="w-full sm:w-auto sm:ml-auto flex items-center">
           <div className="relative w-full sm:w-auto">
              <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                <Globe className="h-4 w-4 text-slate-400" />
              </div>
              <select
                value={selectedLanguage}
                onChange={(e) => onLanguageChange(e.target.value)}
                className="block w-full sm:w-40 pl-9 pr-8 py-1.5 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-slate-50 text-slate-700 appearance-none cursor-pointer hover:bg-slate-100 transition-colors"
              >
                {Object.values(LanguageOption).map((lang) => (
                  <option key={lang} value={lang}>
                    {lang}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none">
                <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
           </div>
        </div>
      </div>
    </header>
  );
};
