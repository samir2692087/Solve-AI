
import React, { useState, useEffect } from 'react';
import { ThemeId } from '../types';
import { ArrowLeft, RefreshCw, ArrowRightLeft, Coins, TrendingUp, Globe, Loader2 } from 'lucide-react';

interface CurrencyConverterProps {
  currentTheme: ThemeId;
  onBack: () => void;
}

interface CurrencyInfo {
  code: string;
  name: string;
  flag: string;
}

const POPULAR_CURRENCIES: CurrencyInfo[] = [
  { code: 'USD', name: 'US Dollar', flag: '🇺🇸' },
  { code: 'EUR', name: 'Euro', flag: '🇪🇺' },
  { code: 'GBP', name: 'British Pound', flag: '🇬🇧' },
  { code: 'INR', name: 'Indian Rupee', flag: '🇮🇳' },
  { code: 'JPY', name: 'Japanese Yen', flag: '🇯🇵' },
  { code: 'AUD', name: 'Australian Dollar', flag: '🇦🇺' },
  { code: 'CAD', name: 'Canadian Dollar', flag: '🇨🇦' },
  { code: 'CNY', name: 'Chinese Yuan', flag: '🇨🇳' },
  { code: 'CHF', name: 'Swiss Franc', flag: '🇨🇭' },
  { code: 'HKD', name: 'Hong Kong Dollar', flag: '🇭🇰' },
  { code: 'SGD', name: 'Singapore Dollar', flag: '🇸🇬' },
  { code: 'AED', name: 'UAE Dirham', flag: '🇦🇪' },
  { code: 'SAR', name: 'Saudi Riyal', flag: '🇸🇦' },
  { code: 'BRL', name: 'Brazilian Real', flag: '🇧🇷' },
  { code: 'ZAR', name: 'South African Rand', flag: '🇿🇦' },
  { code: 'KRW', name: 'South Korean Won', flag: '🇰🇷' },
  { code: 'MXN', name: 'Mexican Peso', flag: '🇲🇽' },
  { code: 'RUB', name: 'Russian Ruble', flag: '🇷🇺' },
  { code: 'TRY', name: 'Turkish Lira', flag: '🇹🇷' },
  { code: 'NZD', name: 'New Zealand Dollar', flag: '🇳🇿' },
];

export const CurrencyConverter: React.FC<CurrencyConverterProps> = ({ currentTheme, onBack }) => {
  const [amount, setAmount] = useState<string>('1');
  const [fromCurrency, setFromCurrency] = useState<string>('USD');
  const [toCurrency, setToCurrency] = useState<string>('INR');
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [error, setError] = useState<string>('');

  const fetchRates = async () => {
    setLoading(true);
    setError('');
    try {
      // Using open.er-api.com which provides a stable, CORS-friendly free API
      const response = await fetch(`https://open.er-api.com/v6/latest/${fromCurrency}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch rates');
      }
      
      const data = await response.json();
      const rate = data.rates[toCurrency];
      
      if (rate) {
        setExchangeRate(rate);
        // API returns unix timestamp in seconds
        const timestamp = data.time_last_update_unix || Date.now() / 1000;
        setLastUpdated(new Date(timestamp * 1000).toLocaleTimeString());
      } else {
        setError('Rate not found');
      }
    } catch (err) {
      console.error(err);
      setError('Service unavailable. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  // Initial Fetch & On Change
  useEffect(() => {
    fetchRates();
  }, [fromCurrency, toCurrency]);

  const handleSwap = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  const convertedAmount = exchangeRate && amount ? (parseFloat(amount) * exchangeRate).toFixed(2) : '---';

  return (
    <div className="flex flex-col h-full max-w-2xl mx-auto p-6 bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl overflow-y-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8 pb-4 border-b border-slate-800">
        <button onClick={onBack} className="p-2 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors">
            <ArrowLeft size={20} className="text-slate-400" />
        </button>
        <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Coins className="text-yellow-500" />
                Currency Converter
            </h2>
            <p className="text-slate-400 text-sm">Real-time exchange rates</p>
        </div>
      </div>

      <div className="space-y-6">
        
        {/* Main Converter Card */}
        <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 shadow-xl">
           
           {/* Amount Input */}
           <div className="mb-6">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">Amount</label>
              <div className="relative">
                 <input 
                    type="number" 
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 text-white text-3xl font-mono p-4 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none"
                    placeholder="0.00"
                 />
                 <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-500 font-bold">
                    {fromCurrency}
                 </div>
              </div>
           </div>

           {/* Currencies Grid */}
           <div className="grid grid-cols-[1fr_auto_1fr] gap-2 items-center mb-6">
              
              {/* From Select */}
              <div className="relative">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">From</label>
                  <select 
                    value={fromCurrency}
                    onChange={(e) => setFromCurrency(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 text-white p-3 rounded-xl appearance-none cursor-pointer hover:border-slate-600 transition-colors"
                  >
                    {POPULAR_CURRENCIES.map(c => (
                        <option key={c.code} value={c.code}>{c.flag} {c.code} - {c.name}</option>
                    ))}
                  </select>
              </div>

              {/* Swap Button */}
              <div className="pt-5">
                 <button 
                   onClick={handleSwap}
                   className="p-3 bg-slate-700 hover:bg-indigo-600 rounded-full text-white transition-all shadow-lg active:scale-90"
                   title="Swap Currencies"
                 >
                    <ArrowRightLeft size={18} />
                 </button>
              </div>

              {/* To Select */}
              <div className="relative">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">To</label>
                  <select 
                    value={toCurrency}
                    onChange={(e) => setToCurrency(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 text-white p-3 rounded-xl appearance-none cursor-pointer hover:border-slate-600 transition-colors"
                  >
                    {POPULAR_CURRENCIES.map(c => (
                        <option key={c.code} value={c.code}>{c.flag} {c.code} - {c.name}</option>
                    ))}
                  </select>
              </div>
           </div>

           {/* Result Display */}
           <div className="bg-gradient-to-br from-indigo-900/50 to-slate-900/50 border border-indigo-500/30 rounded-xl p-6 text-center relative overflow-hidden">
               {loading ? (
                  <div className="flex justify-center py-4">
                     <Loader2 className="animate-spin text-indigo-400" size={32} />
                  </div>
               ) : (
                  <>
                    <div className="text-sm text-indigo-300 font-medium mb-1">
                        {amount} {fromCurrency} =
                    </div>
                    <div className="text-4xl font-bold text-white tracking-tight break-all">
                        {convertedAmount} <span className="text-2xl text-slate-400 font-normal">{toCurrency}</span>
                    </div>
                    <div className="mt-3 text-xs text-slate-500 flex items-center justify-center gap-1">
                        <TrendingUp size={12} />
                        1 {fromCurrency} = {exchangeRate} {toCurrency}
                    </div>
                  </>
               )}
               {error && <div className="text-red-400 text-xs mt-2 bg-red-900/20 py-1 px-2 rounded">{error}</div>}
           </div>
        </div>

        {/* Footer Info */}
        <div className="flex items-center justify-between text-xs text-slate-500 px-2">
            <div className="flex items-center gap-1">
                <Globe size={12} />
                <span>Live Rates (Open Exchange API)</span>
            </div>
            <div className="flex items-center gap-2">
                <span>Updated: {lastUpdated}</span>
                <button 
                  onClick={fetchRates} 
                  disabled={loading}
                  className="p-1.5 hover:bg-slate-800 rounded-full transition-colors disabled:opacity-50"
                  title="Refresh Rates"
                >
                    <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
                </button>
            </div>
        </div>

        <div className="text-center opacity-30 text-[10px] pt-4">
             Exchange rates are updated daily.
        </div>
      </div>
    </div>
  );
};
