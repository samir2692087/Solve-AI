
import React, { useState, useEffect } from 'react';
import { ThemeId } from '../types';
import { ArrowLeft, Percent, IndianRupee } from 'lucide-react';

interface GSTCalculatorProps {
  currentTheme: ThemeId;
  onBack: () => void;
}

export const GSTCalculator: React.FC<GSTCalculatorProps> = ({ currentTheme, onBack }) => {
  const [amount, setAmount] = useState<string>('1000');
  const [rate, setRate] = useState<number>(18);
  const [isInclusive, setIsInclusive] = useState<boolean>(false); // false = Exclusive (Add GST), true = Inclusive (Remove GST)

  const [netAmount, setNetAmount] = useState<number>(0);
  const [gstAmount, setGstAmount] = useState<number>(0);
  const [totalAmount, setTotalAmount] = useState<number>(0);

  const COMMON_RATES = [3, 5, 12, 18, 28];

  useEffect(() => {
    const val = parseFloat(amount);
    if (isNaN(val) || val < 0) {
        setNetAmount(0);
        setGstAmount(0);
        setTotalAmount(0);
        return;
    }

    if (isInclusive) {
        // GST is included in the amount
        // GST Amount = Amount - (Amount * (100 / (100 + Rate)))
        const base = val * (100 / (100 + rate));
        const gst = val - base;
        
        setTotalAmount(val);
        setNetAmount(base);
        setGstAmount(gst);
    } else {
        // GST is added to the amount
        // GST Amount = Amount * (Rate / 100)
        const gst = val * (rate / 100);
        const total = val + gst;

        setNetAmount(val);
        setGstAmount(gst);
        setTotalAmount(total);
    }
  }, [amount, rate, isInclusive]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', { 
      style: 'currency', 
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2 
    }).format(val);
  };

  return (
    <div className="flex flex-col h-full max-w-2xl mx-auto p-6 bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl overflow-y-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8 pb-4 border-b border-slate-800">
            <button onClick={onBack} className="p-2 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors">
                <ArrowLeft size={20} className="text-slate-400" />
            </button>
            <div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <Percent className="text-pink-500" />
                    GST Calculator
                </h2>
                <p className="text-slate-400 text-sm">Calculate Goods & Services Tax</p>
            </div>
        </div>

        <div className="space-y-6">
            {/* Mode Toggle */}
            <div className="bg-slate-800 p-1 rounded-xl flex">
                <button 
                    onClick={() => setIsInclusive(false)}
                    className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${!isInclusive ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                >
                    Exclusive (Add GST)
                </button>
                <button 
                    onClick={() => setIsInclusive(true)}
                    className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${isInclusive ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                >
                    Inclusive (Remove GST)
                </button>
            </div>

            {/* Amount Input */}
             <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">
                    {isInclusive ? 'Total Amount' : 'Initial Amount'}
                </label>
                <div className="flex items-center gap-3">
                    <span className="text-xl font-bold text-indigo-500"><IndianRupee size={20} /></span>
                    <input 
                        type="number" 
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="bg-transparent border-none text-2xl font-mono text-white focus:ring-0 w-full p-0"
                        placeholder="0"
                    />
                </div>
            </div>

            {/* Rate Selection */}
             <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 block">Tax Rate (%)</label>
                
                <div className="flex flex-wrap gap-2 mb-4">
                    {COMMON_RATES.map(r => (
                        <button
                            key={r}
                            onClick={() => setRate(r)}
                            className={`px-4 py-2 rounded-lg text-sm font-bold border transition-all ${rate === r ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-500'}`}
                        >
                            {r}%
                        </button>
                    ))}
                    <div className="flex items-center bg-slate-900 border border-slate-700 rounded-lg px-2 w-24">
                         <input 
                            type="number"
                            value={rate}
                            onChange={(e) => setRate(parseFloat(e.target.value))}
                            className="bg-transparent border-none text-white text-sm w-full focus:ring-0 text-right pr-1"
                         />
                         <span className="text-slate-500 text-xs">%</span>
                    </div>
                </div>
                
                <input 
                    type="range" 
                    min="0" max="50" step="0.1"
                    value={rate}
                    onChange={(e) => setRate(parseFloat(e.target.value))}
                    className="w-full accent-emerald-500"
                />
            </div>

            {/* Results Display */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex flex-col items-center justify-center text-center">
                    <span className="text-xs text-slate-400 uppercase tracking-wider mb-1">Net Amount</span>
                    <span className="text-xl font-mono text-white">{formatCurrency(netAmount)}</span>
                </div>
                
                <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex flex-col items-center justify-center text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
                    <span className="text-xs text-slate-400 uppercase tracking-wider mb-1">GST Amount</span>
                    <span className="text-xl font-mono text-emerald-400">{formatCurrency(gstAmount)}</span>
                    <span className="text-[10px] text-emerald-500/70 font-bold mt-1">
                        {isInclusive ? 'INCLUDED' : 'ADDED'}
                    </span>
                </div>

                <div className="bg-indigo-900/30 p-4 rounded-xl border border-indigo-500/30 flex flex-col items-center justify-center text-center">
                    <span className="text-xs text-indigo-300 uppercase tracking-wider mb-1">Total Amount</span>
                    <span className="text-2xl font-mono font-bold text-white">{formatCurrency(totalAmount)}</span>
                </div>
            </div>
        </div>
    </div>
  );
};
