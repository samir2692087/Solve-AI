
import React, { useState, useEffect } from 'react';
import { ThemeId } from '../types';
import { Calculator, ArrowLeft, DollarSign, Percent, Calendar, Globe } from 'lucide-react';

interface EMICalculatorProps {
  currentTheme: ThemeId;
  onBack: () => void;
}

interface Currency {
  code: string;
  symbol: string;
  locale: string;
  name: string;
}

const CURRENCIES: Currency[] = [
  { code: 'USD', symbol: '$', locale: 'en-US', name: 'US Dollar ($)' },
  { code: 'INR', symbol: '₹', locale: 'en-IN', name: 'Indian Rupee (₹)' },
  { code: 'EUR', symbol: '€', locale: 'de-DE', name: 'Euro (€)' },
  { code: 'GBP', symbol: '£', locale: 'en-GB', name: 'British Pound (£)' },
  { code: 'JPY', symbol: '¥', locale: 'ja-JP', name: 'Japanese Yen (¥)' },
  { code: 'AUD', symbol: 'A$', locale: 'en-AU', name: 'Australian Dollar (A$)' },
  { code: 'CAD', symbol: 'C$', locale: 'en-CA', name: 'Canadian Dollar (C$)' },
  { code: 'CNY', symbol: '¥', locale: 'zh-CN', name: 'Chinese Yuan (¥)' },
  { code: 'AED', symbol: 'د.إ', locale: 'ar-AE', name: 'UAE Dirham (د.إ)' },
  { code: 'SAR', symbol: '﷼', locale: 'ar-SA', name: 'Saudi Riyal (﷼)' },
];

export const EMICalculator: React.FC<EMICalculatorProps> = ({ currentTheme, onBack }) => {
  const [loanAmount, setLoanAmount] = useState<string>('100000');
  const [interestRate, setInterestRate] = useState<string>('10.5');
  const [tenureYears, setTenureYears] = useState<string>('5');
  const [currencyCode, setCurrencyCode] = useState<string>('USD');
  
  const [emi, setEmi] = useState<number>(0);
  const [totalInterest, setTotalInterest] = useState<number>(0);
  const [totalPayment, setTotalPayment] = useState<number>(0);

  useEffect(() => {
    const P = parseFloat(loanAmount);
    const R = parseFloat(interestRate);
    const N = parseFloat(tenureYears) * 12; // Months

    if (P > 0 && R > 0 && N > 0) {
      const r = R / (12 * 100); // Monthly interest rate
      const emiValue = (P * r * Math.pow(1 + r, N)) / (Math.pow(1 + r, N) - 1);
      
      setEmi(emiValue);
      setTotalPayment(emiValue * N);
      setTotalInterest((emiValue * N) - P);
    } else {
        setEmi(0);
        setTotalPayment(0);
        setTotalInterest(0);
    }
  }, [loanAmount, interestRate, tenureYears]);

  const selectedCurrency = CURRENCIES.find(c => c.code === currencyCode) || CURRENCIES[0];

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat(selectedCurrency.locale, { 
      style: 'currency', 
      currency: selectedCurrency.code,
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="flex flex-col h-full max-w-2xl mx-auto p-6 bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl overflow-y-auto">
      <div className="flex items-center gap-4 mb-8 pb-4 border-b border-slate-800">
        <button onClick={onBack} className="p-2 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors">
            <ArrowLeft size={20} className="text-slate-400" />
        </button>
        <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Calculator className="text-indigo-500" />
                EMI Calculator
            </h2>
            <p className="text-slate-400 text-sm">Calculate loan installments</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Currency Selector */}
        <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">Currency</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Globe size={18} />
              </div>
              <select
                value={currencyCode}
                onChange={(e) => setCurrencyCode(e.target.value)}
                className="bg-slate-900 border border-slate-700 text-white rounded-lg pl-10 pr-4 py-3 w-full focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none appearance-none cursor-pointer"
              >
                {CURRENCIES.map(c => (
                  <option key={c.code} value={c.code}>{c.name}</option>
                ))}
              </select>
            </div>
        </div>

        {/* Input: Loan Amount */}
        <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">Loan Amount</label>
            <div className="flex items-center gap-3">
                <span className="text-xl font-bold text-indigo-500 w-6 text-center">{selectedCurrency.symbol}</span>
                <input 
                    type="number" 
                    value={loanAmount}
                    onChange={(e) => setLoanAmount(e.target.value)}
                    className="bg-transparent border-none text-xl font-mono text-white focus:ring-0 w-full"
                />
            </div>
            <input 
                type="range" 
                min="1000" max="10000000" step="1000"
                value={loanAmount}
                onChange={(e) => setLoanAmount(e.target.value)}
                className="w-full mt-2 accent-indigo-500"
            />
        </div>

        {/* Input: Interest Rate */}
        <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">Interest Rate (%)</label>
            <div className="flex items-center gap-3">
                <Percent className="text-emerald-500 w-6" size={20} />
                <input 
                    type="number" 
                    value={interestRate}
                    onChange={(e) => setInterestRate(e.target.value)}
                    className="bg-transparent border-none text-xl font-mono text-white focus:ring-0 w-full"
                />
            </div>
            <input 
                type="range" 
                min="0.1" max="30" step="0.1"
                value={interestRate}
                onChange={(e) => setInterestRate(e.target.value)}
                className="w-full mt-2 accent-emerald-500"
            />
        </div>

        {/* Input: Tenure */}
        <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">Loan Tenure (Years)</label>
            <div className="flex items-center gap-3">
                <Calendar className="text-orange-500 w-6" size={20} />
                <input 
                    type="number" 
                    value={tenureYears}
                    onChange={(e) => setTenureYears(e.target.value)}
                    className="bg-transparent border-none text-xl font-mono text-white focus:ring-0 w-full"
                />
            </div>
            <input 
                type="range" 
                min="1" max="30" step="1"
                value={tenureYears}
                onChange={(e) => setTenureYears(e.target.value)}
                className="w-full mt-2 accent-orange-500"
            />
        </div>

        {/* Results */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-indigo-900/30 border border-indigo-500/30 p-6 rounded-2xl flex flex-col justify-center items-center text-center">
                <div className="text-sm text-indigo-300 font-bold uppercase tracking-wider mb-1">Monthly EMI</div>
                <div className="text-3xl font-mono font-bold text-white">{formatCurrency(emi)}</div>
            </div>

            <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 space-y-4">
                <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-400">Total Interest</span>
                    <span className="text-white font-mono">{formatCurrency(totalInterest)}</span>
                </div>
                <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500" style={{ width: totalPayment > 0 ? `${(totalInterest/totalPayment)*100}%` : '0%' }}></div>
                </div>
                
                <div className="flex justify-between items-center text-sm pt-2 border-t border-slate-700">
                    <span className="text-slate-400">Total Payable</span>
                    <span className="text-white font-mono">{formatCurrency(totalPayment)}</span>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};
