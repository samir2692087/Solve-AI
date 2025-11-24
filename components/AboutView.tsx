
import React, { useState } from 'react';
import { ArrowLeft, Info, Calculator, Cpu, Sparkles } from 'lucide-react';

interface AboutViewProps {
  onBack: () => void;
}

export const AboutView: React.FC<AboutViewProps> = ({ onBack }) => {
  return (
    <div className="flex flex-col h-full max-w-2xl mx-auto p-6 bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl overflow-y-auto">
      <div className="flex items-center gap-4 mb-8 pb-4 border-b border-slate-800">
        <button onClick={onBack} className="p-2 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors">
            <ArrowLeft size={20} className="text-slate-400" />
        </button>
        <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Info className="text-blue-400" />
                About Calculator
            </h2>
        </div>
      </div>
      
      <div className="space-y-6">
        <div className="flex flex-col items-center justify-center py-8 text-center bg-slate-800/50 rounded-2xl border border-slate-700">
            <div className="w-20 h-20 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-600/20 mb-4">
                <Calculator className="text-white w-10 h-10" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-1">Solve AI</h1>
            <p className="text-slate-400 text-sm">Version 1.0.0</p>
        </div>

        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 space-y-4">
            <h3 className="text-lg font-bold text-white border-b border-slate-700 pb-2">Features</h3>
            <ul className="space-y-3">
                <li className="flex items-start gap-3">
                    <Sparkles className="text-yellow-400 mt-1 shrink-0" size={16} />
                    <span className="text-slate-300 text-sm">Powered by Google Gemini 3.0 Pro for advanced mathematical reasoning and step-by-step solutions.</span>
                </li>
                <li className="flex items-start gap-3">
                    <Cpu className="text-indigo-400 mt-1 shrink-0" size={16} />
                    <span className="text-slate-300 text-sm">Real-time scientific calculator, unit conversion, and financial tools.</span>
                </li>
            </ul>
        </div>

        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 text-center">
            <p className="text-slate-500 text-xs">© 2025 Solve AI Inc. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};
