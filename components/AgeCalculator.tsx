import React, { useState } from 'react';
import { ThemeId } from '../types';
import { Cake, ArrowLeft, CalendarDays, Hourglass } from 'lucide-react';

interface AgeCalculatorProps {
  currentTheme: ThemeId;
  onBack: () => void;
}

export const AgeCalculator: React.FC<AgeCalculatorProps> = ({ currentTheme, onBack }) => {
  const [birthDate, setBirthDate] = useState<string>('');
  
  const calculateAge = () => {
    if (!birthDate) return null;
    const today = new Date();
    const dob = new Date(birthDate);
    
    let years = today.getFullYear() - dob.getFullYear();
    let months = today.getMonth() - dob.getMonth();
    let days = today.getDate() - dob.getDate();

    if (days < 0) {
        months--;
        // Days in previous month
        const prevMonth = new Date(today.getFullYear(), today.getMonth(), 0).getDate();
        days += prevMonth;
    }

    if (months < 0) {
        years--;
        months += 12;
    }

    return { years, months, days };
  };

  const age = calculateAge();

  return (
    <div className="flex flex-col h-full max-w-2xl mx-auto p-6 bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl">
      <div className="flex items-center gap-4 mb-8 pb-4 border-b border-slate-800">
        <button onClick={onBack} className="p-2 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors">
            <ArrowLeft size={20} className="text-slate-400" />
        </button>
        <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Cake className="text-pink-500" />
                Age Calculator
            </h2>
            <p className="text-slate-400 text-sm">Find your exact age in years, months, and days</p>
        </div>
      </div>

      <div className="space-y-8">
         <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
            <label className="text-sm font-bold text-slate-300 mb-2 block">Date of Birth</label>
            <div className="flex items-center gap-3">
                <CalendarDays className="text-pink-500" size={24} />
                <input 
                    type="date" 
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="bg-slate-900 border border-slate-700 text-white rounded-lg p-3 w-full focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
                />
            </div>
         </div>

         {age && (
            <div className="grid grid-cols-3 gap-4 animate-fade-in-up">
                <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 text-center flex flex-col items-center gap-2">
                    <span className="text-4xl font-bold text-white font-mono">{age.years}</span>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Years</span>
                </div>
                <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 text-center flex flex-col items-center gap-2">
                    <span className="text-4xl font-bold text-indigo-400 font-mono">{age.months}</span>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Months</span>
                </div>
                <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 text-center flex flex-col items-center gap-2">
                    <span className="text-4xl font-bold text-emerald-400 font-mono">{age.days}</span>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Days</span>
                </div>
            </div>
         )}

         {!age && (
             <div className="text-center py-12 opacity-30 flex flex-col items-center gap-4">
                <Hourglass size={48} />
                <p>Select your date of birth to calculate age.</p>
             </div>
         )}
      </div>
    </div>
  );
};