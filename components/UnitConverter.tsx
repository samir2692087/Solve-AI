
import React, { useState, useEffect } from 'react';
import { ThemeId } from '../types';
import { 
  ArrowRightLeft, 
  Ruler, 
  Weight, 
  Thermometer, 
  Beaker, 
  Square, 
  Clock, 
  HardDrive, 
  Zap,
  ArrowLeft,
  Flame,
  Gauge,
  Lightbulb,
  Compass,
  ChevronDown,
  Palette
} from 'lucide-react';

interface UnitConverterProps {
  onCopy?: (result: string) => void;
  onBack?: () => void;
  currentTheme?: ThemeId;
  onThemeChange?: (theme: ThemeId) => void;
}

type UnitCategory = 'LENGTH' | 'MASS' | 'VOLUME' | 'TEMP' | 'AREA' | 'TIME' | 'DIGITAL' | 'SPEED' | 'ENERGY' | 'PRESSURE' | 'POWER' | 'ANGLE';

interface Unit {
  id: string;
  label: string;
  ratio: number; // Ratio relative to base unit
}

// --- Theme Styling for Converter ---
interface ConverterThemeConfig {
  container: string;
  headerBg: string;
  headerBorder: string;
  headerText: string;
  selectorBg: string;
  dropdownBg: string;
  dropdownText: string;
  inputBg: string;
  inputBorder: string;
  inputRing: string;
  inputText: string;
  resultBg: string;
  resultBorder: string;
  resultText: string;
  swapBtn: string;
}

const CONVERTER_THEMES: Record<ThemeId, ConverterThemeConfig> = {
  classic: {
    container: 'bg-slate-900 border-slate-800 shadow-slate-900/50',
    headerBg: 'bg-[#1a1f2c]',
    headerBorder: 'border-slate-800',
    headerText: 'text-indigo-400',
    selectorBg: 'bg-slate-950/50',
    dropdownBg: 'bg-slate-800 border-slate-700 hover:bg-slate-700',
    dropdownText: 'text-white',
    inputBg: 'bg-slate-800 border-slate-700',
    inputBorder: 'border-slate-700',
    inputRing: 'focus-within:ring-indigo-500',
    inputText: 'text-white',
    resultBg: 'bg-indigo-900/20 border-indigo-500/30',
    resultBorder: 'border-indigo-500/20',
    resultText: 'text-indigo-100',
    swapBtn: 'bg-slate-800 border-slate-700 text-indigo-400 hover:bg-indigo-600 hover:text-white'
  },
  ocean: {
    container: 'bg-cyan-950 border-cyan-900 shadow-cyan-900/50',
    headerBg: 'bg-[#083344]',
    headerBorder: 'border-cyan-800',
    headerText: 'text-cyan-400',
    selectorBg: 'bg-cyan-950/50',
    dropdownBg: 'bg-cyan-800 border-cyan-700 hover:bg-cyan-700',
    dropdownText: 'text-cyan-50',
    inputBg: 'bg-cyan-800 border-cyan-700',
    inputBorder: 'border-cyan-700',
    inputRing: 'focus-within:ring-cyan-500',
    inputText: 'text-cyan-50',
    resultBg: 'bg-blue-900/20 border-blue-500/30',
    resultBorder: 'border-blue-500/20',
    resultText: 'text-blue-100',
    swapBtn: 'bg-cyan-800 border-cyan-700 text-cyan-400 hover:bg-cyan-600 hover:text-white'
  },
  forest: {
    container: 'bg-emerald-950 border-emerald-900 shadow-emerald-900/50',
    headerBg: 'bg-[#022c22]',
    headerBorder: 'border-emerald-900',
    headerText: 'text-emerald-400',
    selectorBg: 'bg-emerald-950/50',
    dropdownBg: 'bg-emerald-800 border-emerald-700 hover:bg-emerald-700',
    dropdownText: 'text-emerald-50',
    inputBg: 'bg-emerald-800 border-emerald-700',
    inputBorder: 'border-emerald-700',
    inputRing: 'focus-within:ring-emerald-500',
    inputText: 'text-emerald-50',
    resultBg: 'bg-teal-900/20 border-teal-500/30',
    resultBorder: 'border-teal-500/20',
    resultText: 'text-teal-100',
    swapBtn: 'bg-emerald-800 border-emerald-700 text-emerald-400 hover:bg-emerald-600 hover:text-white'
  },
  sunset: {
    container: 'bg-indigo-950 border-purple-900 shadow-purple-900/50',
    headerBg: 'bg-[#2e1065]',
    headerBorder: 'border-purple-900',
    headerText: 'text-purple-400',
    selectorBg: 'bg-indigo-950/50',
    dropdownBg: 'bg-indigo-900 border-indigo-800 hover:bg-indigo-800',
    dropdownText: 'text-purple-50',
    inputBg: 'bg-indigo-900 border-indigo-800',
    inputBorder: 'border-indigo-800',
    inputRing: 'focus-within:ring-pink-500',
    inputText: 'text-pink-50',
    resultBg: 'bg-violet-900/20 border-violet-500/30',
    resultBorder: 'border-violet-500/20',
    resultText: 'text-violet-100',
    swapBtn: 'bg-indigo-900 border-indigo-800 text-purple-400 hover:bg-purple-600 hover:text-white'
  },
  monochrome: {
    container: 'bg-zinc-950 border-zinc-800 shadow-zinc-900/50',
    headerBg: 'bg-zinc-900',
    headerBorder: 'border-zinc-800',
    headerText: 'text-white',
    selectorBg: 'bg-zinc-950/50',
    dropdownBg: 'bg-zinc-800 border-zinc-700 hover:bg-zinc-700',
    dropdownText: 'text-zinc-100',
    inputBg: 'bg-zinc-800 border-zinc-700',
    inputBorder: 'border-zinc-700',
    inputRing: 'focus-within:ring-white',
    inputText: 'text-zinc-100',
    resultBg: 'bg-zinc-900 border-zinc-700',
    resultBorder: 'border-zinc-700',
    resultText: 'text-white',
    swapBtn: 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:bg-white hover:text-black'
  }
};

const CATEGORIES: { id: UnitCategory; label: string; icon: React.ReactNode }[] = [
  { id: 'LENGTH', label: 'Length', icon: <Ruler size={18} /> },
  { id: 'MASS', label: 'Mass', icon: <Weight size={18} /> },
  { id: 'TEMP', label: 'Temperature', icon: <Thermometer size={18} /> },
  { id: 'VOLUME', label: 'Volume', icon: <Beaker size={18} /> },
  { id: 'AREA', label: 'Area', icon: <Square size={18} /> },
  { id: 'TIME', label: 'Time', icon: <Clock size={18} /> },
  { id: 'SPEED', label: 'Speed', icon: <Zap size={18} /> },
  { id: 'DIGITAL', label: 'Digital Storage', icon: <HardDrive size={18} /> },
  { id: 'ENERGY', label: 'Energy', icon: <Flame size={18} /> },
  { id: 'PRESSURE', label: 'Pressure', icon: <Gauge size={18} /> },
  { id: 'POWER', label: 'Power', icon: <Lightbulb size={18} /> },
  { id: 'ANGLE', label: 'Angle', icon: <Compass size={18} /> },
];

const UNITS: Record<UnitCategory, Unit[]> = {
  LENGTH: [ // Base: Meter
    { id: 'm', label: 'Meters (m)', ratio: 1 },
    { id: 'km', label: 'Kilometers (km)', ratio: 1000 },
    { id: 'cm', label: 'Centimeters (cm)', ratio: 0.01 },
    { id: 'mm', label: 'Millimeters (mm)', ratio: 0.001 },
    { id: 'um', label: 'Micrometers (µm)', ratio: 1e-6 },
    { id: 'nm', label: 'Nanometers (nm)', ratio: 1e-9 },
    { id: 'mi', label: 'Miles (mi)', ratio: 1609.344 },
    { id: 'yd', label: 'Yards (yd)', ratio: 0.9144 },
    { id: 'ft', label: 'Feet (ft)', ratio: 0.3048 },
    { id: 'in', label: 'Inches (in)', ratio: 0.0254 },
    { id: 'nmi', label: 'Nautical Miles (nmi)', ratio: 1852 },
    { id: 'ly', label: 'Light Years (ly)', ratio: 9.4607e15 },
    { id: 'au', label: 'Astronomical Units (AU)', ratio: 1.496e11 },
    { id: 'pc', label: 'Parsecs (pc)', ratio: 3.0857e16 },
    { id: 'fm', label: 'Fathoms', ratio: 1.8288 },
  ],
  MASS: [ // Base: Kilogram
    { id: 'kg', label: 'Kilograms (kg)', ratio: 1 },
    { id: 'g', label: 'Grams (g)', ratio: 0.001 },
    { id: 'mg', label: 'Milligrams (mg)', ratio: 1e-6 },
    { id: 'ug', label: 'Micrograms (µg)', ratio: 1e-9 },
    { id: 't', label: 'Metric Tonnes (t)', ratio: 1000 },
    { id: 'lb', label: 'Pounds (lb)', ratio: 0.453592 },
    { id: 'oz', label: 'Ounces (oz)', ratio: 0.0283495 },
    { id: 'st', label: 'Stones (st)', ratio: 6.35029 },
    { id: 'carat', label: 'Carats (ct)', ratio: 0.0002 },
    { id: 'slug', label: 'Slugs', ratio: 14.5939 },
    { id: 'gr', label: 'Grains', ratio: 6.4799e-5 },
  ],
  VOLUME: [ // Base: Liter
    { id: 'l', label: 'Liters (L)', ratio: 1 },
    { id: 'ml', label: 'Milliliters (mL)', ratio: 0.001 },
    { id: 'm3', label: 'Cubic Meters (m³)', ratio: 1000 },
    { id: 'cm3', label: 'Cubic Centimeters (cm³)', ratio: 0.001 },
    { id: 'gal', label: 'Gallons (US)', ratio: 3.78541 },
    { id: 'qt', label: 'Quarts (US)', ratio: 0.946353 },
    { id: 'pt', label: 'Pints (US)', ratio: 0.473176 },
    { id: 'cup', label: 'Cups (US)', ratio: 0.236588 },
    { id: 'floz', label: 'Fluid Ounces (US)', ratio: 0.0295735 },
    { id: 'tbsp', label: 'Tablespoons (US)', ratio: 0.0147868 },
    { id: 'tsp', label: 'Teaspoons (US)', ratio: 0.00492892 },
    { id: 'gal_uk', label: 'Gallons (UK)', ratio: 4.54609 },
    { id: 'floz_uk', label: 'Fluid Ounces (UK)', ratio: 0.0284131 },
    { id: 'ft3', label: 'Cubic Feet (ft³)', ratio: 28.3168 },
    { id: 'in3', label: 'Cubic Inches (in³)', ratio: 0.0163871 },
    { id: 'bbl', label: 'Oil Barrels', ratio: 158.987 },
  ],
  TEMP: [ // Special Logic
    { id: 'c', label: 'Celsius (°C)', ratio: 1 },
    { id: 'f', label: 'Fahrenheit (°F)', ratio: 1 }, 
    { id: 'k', label: 'Kelvin (K)', ratio: 1 },
    { id: 'r', label: 'Rankine (°R)', ratio: 1 },
  ],
  AREA: [ // Base: Square Meter
    { id: 'm2', label: 'Square Meters (m²)', ratio: 1 },
    { id: 'km2', label: 'Square Kilometers (km²)', ratio: 1e6 },
    { id: 'cm2', label: 'Square Centimeters (cm²)', ratio: 0.0001 },
    { id: 'mm2', label: 'Square Millimeters (mm²)', ratio: 1e-6 },
    { id: 'ha', label: 'Hectares (ha)', ratio: 10000 },
    { id: 'ac', label: 'Acres (ac)', ratio: 4046.86 },
    { id: 'mi2', label: 'Square Miles (mi²)', ratio: 2.59e6 },
    { id: 'yd2', label: 'Square Yards (yd²)', ratio: 0.836127 },
    { id: 'ft2', label: 'Square Feet (ft²)', ratio: 0.092903 },
    { id: 'in2', label: 'Square Inches (in²)', ratio: 0.00064516 },
  ],
  TIME: [ // Base: Second
    { id: 's', label: 'Seconds (s)', ratio: 1 },
    { id: 'ms', label: 'Milliseconds (ms)', ratio: 0.001 },
    { id: 'us', label: 'Microseconds (µs)', ratio: 1e-6 },
    { id: 'ns', label: 'Nanoseconds (ns)', ratio: 1e-9 },
    { id: 'min', label: 'Minutes (min)', ratio: 60 },
    { id: 'h', label: 'Hours (h)', ratio: 3600 },
    { id: 'd', label: 'Days (d)', ratio: 86400 },
    { id: 'wk', label: 'Weeks (wk)', ratio: 604800 },
    { id: 'mo', label: 'Months (avg)', ratio: 2.628e6 },
    { id: 'y', label: 'Years (y)', ratio: 3.154e7 },
    { id: 'dec', label: 'Decades', ratio: 3.154e8 },
    { id: 'cen', label: 'Centuries', ratio: 3.154e9 },
  ],
  DIGITAL: [ // Base: Byte
    { id: 'b', label: 'Bytes (B)', ratio: 1 },
    { id: 'bit', label: 'Bits (b)', ratio: 0.125 },
    { id: 'kb', label: 'Kilobytes (KB)', ratio: 1024 },
    { id: 'mb', label: 'Megabytes (MB)', ratio: 1.049e6 },
    { id: 'gb', label: 'Gigabytes (GB)', ratio: 1.074e9 },
    { id: 'tb', label: 'Terabytes (TB)', ratio: 1.1e12 },
    { id: 'pb', label: 'Petabytes (PB)', ratio: 1.126e15 },
    { id: 'kbit', label: 'Kilobits (Kb)', ratio: 128 },
    { id: 'mbit', label: 'Megabits (Mb)', ratio: 131072 },
    { id: 'gbit', label: 'Gigabits (Gb)', ratio: 1.342e8 },
  ],
  SPEED: [ // Base: Meters per Second
    { id: 'mps', label: 'Meters/Second (m/s)', ratio: 1 },
    { id: 'kph', label: 'Kilometers/Hour (km/h)', ratio: 0.277778 },
    { id: 'mph', label: 'Miles/Hour (mph)', ratio: 0.44704 },
    { id: 'kn', label: 'Knots (kn)', ratio: 0.514444 },
    { id: 'fps', label: 'Feet/Second (ft/s)', ratio: 0.3048 },
    { id: 'mach', label: 'Mach (std atm)', ratio: 343 },
    { id: 'c', label: 'Speed of Light (c)', ratio: 2.998e8 },
  ],
  ENERGY: [ // Base: Joule
    { id: 'j', label: 'Joules (J)', ratio: 1 },
    { id: 'kj', label: 'Kilojoules (kJ)', ratio: 1000 },
    { id: 'cal', label: 'Calories (cal)', ratio: 4.184 },
    { id: 'kcal', label: 'Kilocalories (kcal)', ratio: 4184 },
    { id: 'wh', label: 'Watt-hours (Wh)', ratio: 3600 },
    { id: 'kwh', label: 'Kilowatt-hours (kWh)', ratio: 3.6e6 },
    { id: 'ev', label: 'Electronvolts (eV)', ratio: 1.602e-19 },
    { id: 'btu', label: 'British Thermal Units (BTU)', ratio: 1055.06 },
    { id: 'ftlb', label: 'Foot-pounds (ft⋅lb)', ratio: 1.35582 },
  ],
  PRESSURE: [ // Base: Pascal
    { id: 'pa', label: 'Pascals (Pa)', ratio: 1 },
    { id: 'kpa', label: 'Kilopascals (kPa)', ratio: 1000 },
    { id: 'mpa', label: 'Megapascals (MPa)', ratio: 1e6 },
    { id: 'bar', label: 'Bar', ratio: 100000 },
    { id: 'psi', label: 'PSI', ratio: 6894.76 },
    { id: 'atm', label: 'Atmospheres (atm)', ratio: 101325 },
    { id: 'torr', label: 'Torr (mmHg)', ratio: 133.322 },
  ],
  POWER: [ // Base: Watt
    { id: 'w', label: 'Watts (W)', ratio: 1 },
    { id: 'kw', label: 'Kilowatts (kW)', ratio: 1000 },
    { id: 'mw', label: 'Megawatts (MW)', ratio: 1e6 },
    { id: 'hp', label: 'Horsepower (mech)', ratio: 745.7 },
    { id: 'hp_m', label: 'Horsepower (metric)', ratio: 735.5 },
    { id: 'btuh', label: 'BTU/hour', ratio: 0.293071 },
  ],
  ANGLE: [ // Base: Degree
    { id: 'deg', label: 'Degrees (°)', ratio: 1 },
    { id: 'rad', label: 'Radians (rad)', ratio: 57.2958 },
    { id: 'grad', label: 'Gradians (gon)', ratio: 0.9 },
    { id: 'arcmin', label: 'Arcminutes', ratio: 1/60 },
    { id: 'arcsec', label: 'Arcseconds', ratio: 1/3600 },
  ]
};

export const UnitConverter: React.FC<UnitConverterProps> = ({ 
  onCopy, 
  onBack, 
  currentTheme = 'classic', 
  onThemeChange 
}) => {
  const [category, setCategory] = useState<UnitCategory>('LENGTH');
  const [amount, setAmount] = useState<string>('1');
  const [fromUnit, setFromUnit] = useState<string>(UNITS['LENGTH'][0].id);
  const [toUnit, setToUnit] = useState<string>(UNITS['LENGTH'][1].id);
  const [result, setResult] = useState<string>('');

  const theme = CONVERTER_THEMES[currentTheme];

  // Reset units when category changes
  useEffect(() => {
    if (UNITS[category] && UNITS[category].length > 1) {
      setFromUnit(UNITS[category][0].id);
      setToUnit(UNITS[category][1].id);
    }
  }, [category]);

  // Calculate conversion
  useEffect(() => {
    const val = parseFloat(amount);
    if (isNaN(val)) {
      setResult('---');
      return;
    }

    if (category === 'TEMP') {
      let celsius = val;
      // Convert to Celsius first
      if (fromUnit === 'f') celsius = (val - 32) * (5/9);
      else if (fromUnit === 'k') celsius = val - 273.15;
      else if (fromUnit === 'r') celsius = (val - 491.67) * (5/9);
      
      // Convert Celsius to Target
      let res = celsius;
      if (toUnit === 'f') res = celsius * (9/5) + 32;
      else if (toUnit === 'k') res = celsius + 273.15;
      else if (toUnit === 'r') res = (celsius + 273.15) * 1.8;
      
      setResult(res.toFixed(2));
      return;
    }

    // Standard conversion using ratios
    const fromU = UNITS[category].find(u => u.id === fromUnit);
    const toU = UNITS[category].find(u => u.id === toUnit);

    if (fromU && toU) {
      const baseVal = val * fromU.ratio;
      const finalVal = baseVal / toU.ratio;
      
      // Format logic to avoid 0.0000001 formatting issues or overly long decimals
      if (finalVal === 0) setResult('0');
      else if (Math.abs(finalVal) < 0.0001 || Math.abs(finalVal) > 1000000) {
        setResult(finalVal.toExponential(4));
      } else {
        setResult(parseFloat(finalVal.toFixed(6)).toString()); // Remove trailing zeros
      }
    }
  }, [amount, fromUnit, toUnit, category]);

  const handleSwap = () => {
    setFromUnit(toUnit);
    setToUnit(fromUnit);
  };

  const cycleTheme = () => {
    if (!onThemeChange) return;
    const themes: ThemeId[] = ['classic', 'ocean', 'forest', 'sunset', 'monochrome'];
    const nextIdx = (themes.indexOf(currentTheme as ThemeId) + 1) % themes.length;
    onThemeChange(themes[nextIdx]);
  };

  return (
    <div className={`flex flex-col h-full max-w-4xl mx-auto rounded-2xl border transition-colors duration-300 shadow-2xl overflow-hidden animate-fade-in ${theme.container}`}>
      
      {/* Header */}
      <div className={`border-b p-4 flex items-center justify-between flex-shrink-0 transition-colors duration-300 pr-24 ${theme.headerBg} ${theme.headerBorder}`}>
        <div className="flex items-center gap-3">
           {onBack && (
             <button onClick={onBack} className="p-1 hover:bg-white/10 rounded text-slate-400 hover:text-white transition-colors">
               <ArrowLeft size={20} />
             </button>
           )}
           <div>
             <div className={`flex items-center gap-2 font-bold uppercase tracking-widest text-xs mb-1 transition-colors ${theme.headerText}`}>
               <ArrowRightLeft size={14} />
               <span>Unit Converter</span>
             </div>
             <div className="text-slate-200 font-medium text-lg leading-none">
               Professional Tool
             </div>
           </div>
        </div>
        {/* Theme Toggle */}
        {onThemeChange && (
             <button 
                onClick={cycleTheme} 
                className="hover:text-white text-slate-400 transition-colors flex items-center gap-1 group px-2 py-2 rounded hover:bg-white/10"
                title="Change Theme"
             >
                <Palette size={18} className="group-hover:rotate-12 transition-transform" />
             </button>
        )}
      </div>

      {/* Category Selector Dropdown */}
      <div className={`p-4 border-b flex-shrink-0 transition-colors duration-300 ${theme.selectorBg} ${theme.headerBorder}`}>
        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Category</label>
        <div className="relative group">
            <div className={`absolute inset-y-0 left-3 flex items-center pointer-events-none transition-colors ${theme.headerText}`}>
                {CATEGORIES.find(c => c.id === category)?.icon}
            </div>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as UnitCategory)}
              className={`w-full text-base rounded-xl pl-10 pr-10 py-3 focus:outline-none focus:ring-2 focus:ring-opacity-50 focus:border-transparent appearance-none cursor-pointer transition-all shadow-sm ${theme.dropdownBg} ${theme.dropdownText} ${theme.inputRing}`}
            >
              {CATEGORIES.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.label}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-500">
              <ChevronDown size={18} />
            </div>
        </div>
      </div>

      {/* Converter Body */}
      <div className="p-6 sm:p-8 flex flex-col gap-8 overflow-y-auto flex-1">
        
        {/* Input Group */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 items-center">
          
          {/* From Side */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">From</label>
            <div className={`p-1 rounded-xl border focus-within:ring-1 transition-all shadow-inner ${theme.inputBg} ${theme.inputRing}`}>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className={`w-full bg-transparent border-none text-2xl p-3 focus:ring-0 font-mono ${theme.inputText}`}
                placeholder="0"
              />
              <div className={`border-t relative ${theme.inputBorder}`}>
                 <select 
                    value={fromUnit}
                    onChange={(e) => setFromUnit(e.target.value)}
                    className="w-full bg-transparent border-none text-slate-300 text-sm py-2 pl-3 pr-8 focus:ring-0 cursor-pointer hover:text-white appearance-none"
                 >
                    {UNITS[category].map(u => (
                      <option key={u.id} value={u.id} className="bg-slate-800">{u.label}</option>
                    ))}
                 </select>
                 <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none text-slate-500">
                    <ChevronDown size={14} />
                 </div>
              </div>
            </div>
          </div>

          {/* Swap Button */}
          <div className="flex justify-center md:pt-6">
             <button 
               onClick={handleSwap}
               className={`p-3 rounded-full border transition-all shadow-lg active:scale-90 ${theme.swapBtn}`}
             >
               <ArrowRightLeft size={20} />
             </button>
          </div>

          {/* To Side */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">To</label>
            <div className={`p-1 rounded-xl border transition-all shadow-inner ${theme.resultBg}`}>
              <div className={`w-full bg-transparent border-none text-2xl p-3 font-mono flex items-center h-[56px] overflow-x-auto whitespace-nowrap scrollbar-hide ${theme.resultText}`}>
                 {result}
              </div>
              <div className={`border-t relative ${theme.resultBorder}`}>
                 <select 
                    value={toUnit}
                    onChange={(e) => setToUnit(e.target.value)}
                    className={`w-full bg-transparent border-none text-sm py-2 pl-3 pr-8 focus:ring-0 cursor-pointer hover:opacity-100 opacity-80 appearance-none ${theme.resultText}`}
                 >
                    {UNITS[category].map(u => (
                      <option key={u.id} value={u.id} className="bg-slate-800">{u.label}</option>
                    ))}
                 </select>
                 <div className={`absolute inset-y-0 right-2 flex items-center pointer-events-none opacity-50 ${theme.resultText}`}>
                    <ChevronDown size={14} />
                 </div>
              </div>
            </div>
          </div>

        </div>

        {/* Info/Footer */}
        <div className={`mt-4 p-4 rounded-lg border text-center transition-colors duration-300 ${theme.selectorBg} ${theme.headerBorder}`}>
           <div className="text-sm text-slate-400">
              <span className="font-mono text-white">{amount}</span> {UNITS[category].find(u => u.id === fromUnit)?.label} = 
              <br className="sm:hidden" />
              <span className={`font-mono text-xl mx-2 ${theme.headerText}`}>{result}</span> 
              {UNITS[category].find(u => u.id === toUnit)?.label}
           </div>
        </div>

      </div>
    </div>
  );
};
