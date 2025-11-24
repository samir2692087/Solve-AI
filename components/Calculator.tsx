
import React, { useState, useRef, useEffect } from 'react';
import { CalculatorButton, ThemeId } from '../types';
import { MathDisplay } from './MathDisplay';
import { evaluate } from '../utils/mathEvaluator';
import { 
  ChevronDown, 
  ChevronUp, 
  Delete, 
  ArrowLeft, 
  ArrowRight, 
  Sigma,
  Grid3X3,
  MoveDiagonal,
  Eye,
  Palette,
  Settings2,
  Keyboard,
  Save,
  Play
} from 'lucide-react';

// --- Theme Definitions ---

interface ThemeConfig {
  name: string;
  container: string;
  headerText: string;
  displayBg: string;
  displayBorder: string;
  displayText: string;
  btnNumber: string;    
  btnOperator: string;  
  btnFunction: string;  
  btnControl: string;   
  btnAction: string;    
  btnEqual: string;     
  divider: string;
  toggleBtn: string;
}

const THEMES: Record<ThemeId, ThemeConfig> = {
  classic: {
    name: 'Classic Dark',
    container: 'bg-slate-900 border-slate-800 shadow-slate-900/50',
    headerText: 'text-slate-500',
    displayBg: 'bg-[#1a1f2c]',
    displayBorder: 'border-slate-800',
    displayText: 'text-indigo-100',
    btnNumber: 'bg-slate-700 text-white border-t border-slate-600 hover:bg-slate-600 active:border-transparent',
    btnOperator: 'bg-indigo-600 text-white border-t border-indigo-500 shadow-[0_2px_0_#4338ca] hover:bg-indigo-500 active:shadow-none active:translate-y-[2px]',
    btnFunction: 'bg-slate-800 text-slate-200 border-t border-slate-700 shadow-[0_2px_0_rgba(0,0,0,0.5)] hover:bg-slate-700 active:shadow-none active:translate-y-[2px]',
    btnControl: 'bg-slate-800 text-slate-400 border-t border-slate-700 hover:bg-slate-700 active:border-transparent',
    btnAction: 'bg-orange-600 text-white border-t border-orange-500 shadow-[0_2px_0_#9a3412] hover:bg-orange-500 active:shadow-none active:translate-y-[2px]',
    btnEqual: 'bg-emerald-600 text-white border-t border-emerald-500 shadow-[0_2px_0_#059669] hover:bg-emerald-500 active:shadow-none active:translate-y-[2px]',
    divider: 'border-slate-800',
    toggleBtn: 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
  },
  ocean: {
    name: 'Deep Ocean',
    container: 'bg-cyan-950 border-cyan-900 shadow-cyan-900/50',
    headerText: 'text-cyan-600',
    displayBg: 'bg-[#083344]',
    displayBorder: 'border-cyan-800',
    displayText: 'text-cyan-100',
    btnNumber: 'bg-cyan-800 text-cyan-50 border-t border-cyan-700 hover:bg-cyan-700 active:border-transparent',
    btnOperator: 'bg-cyan-600 text-white border-t border-cyan-500 shadow-[0_2px_0_#0891b2] hover:bg-cyan-500 active:shadow-none active:translate-y-[2px]',
    btnFunction: 'bg-cyan-900 text-cyan-300 border-t border-cyan-800 hover:bg-cyan-800 active:border-transparent',
    btnControl: 'bg-cyan-900 text-cyan-500 border-t border-cyan-800 hover:bg-cyan-800 active:border-transparent',
    btnAction: 'bg-rose-500 text-white border-t border-rose-400 shadow-[0_2px_0_#be123c] hover:bg-rose-400 active:shadow-none active:translate-y-[2px]',
    btnEqual: 'bg-blue-500 text-white border-t border-blue-400 shadow-[0_2px_0_#1d4ed8] hover:bg-blue-400 active:shadow-none active:translate-y-[2px]',
    divider: 'border-cyan-900',
    toggleBtn: 'bg-cyan-900 text-cyan-400 hover:text-white hover:bg-cyan-800'
  },
  forest: {
    name: 'Midnight Forest',
    container: 'bg-emerald-950 border-emerald-900 shadow-emerald-900/50',
    headerText: 'text-emerald-700',
    displayBg: 'bg-[#022c22]',
    displayBorder: 'border-emerald-900',
    displayText: 'text-emerald-100',
    btnNumber: 'bg-emerald-800 text-emerald-50 border-t border-emerald-700 hover:bg-emerald-700 active:border-transparent',
    btnOperator: 'bg-lime-700 text-white border-t border-lime-600 shadow-[0_2px_0_#4d7c0f] hover:bg-lime-600 active:shadow-none active:translate-y-[2px]',
    btnFunction: 'bg-emerald-900 text-emerald-300 border-t border-emerald-800 hover:bg-emerald-800 active:border-transparent',
    btnControl: 'bg-emerald-900 text-emerald-500 border-t border-emerald-800 hover:bg-emerald-800 active:border-transparent',
    btnAction: 'bg-red-600 text-white border-t border-red-500 shadow-[0_2px_0_#991b1b] hover:bg-red-500 active:shadow-none active:translate-y-[2px]',
    btnEqual: 'bg-teal-500 text-white border-t border-teal-400 shadow-[0_2px_0_#0f766e] hover:bg-teal-400 active:shadow-none active:translate-y-[2px]',
    divider: 'border-emerald-900',
    toggleBtn: 'bg-emerald-900 text-emerald-400 hover:text-white hover:bg-emerald-800'
  },
  sunset: {
    name: 'Cyber Sunset',
    container: 'bg-indigo-950 border-purple-900 shadow-purple-900/50',
    headerText: 'text-purple-500',
    displayBg: 'bg-[#2e1065]',
    displayBorder: 'border-purple-900',
    displayText: 'text-purple-100',
    btnNumber: 'bg-indigo-900 text-indigo-100 border-t border-indigo-800 hover:bg-indigo-800 active:border-transparent',
    btnOperator: 'bg-pink-600 text-white border-t border-pink-500 shadow-[0_2px_0_#be185d] hover:bg-pink-500 active:shadow-none active:translate-y-[2px]',
    btnFunction: 'bg-purple-900/50 text-pink-300 border-t border-purple-800 hover:bg-purple-900 active:border-transparent',
    btnControl: 'bg-purple-900/50 text-purple-400 border-t border-purple-800 hover:bg-purple-900 active:border-transparent',
    btnAction: 'bg-orange-600 text-white border-t border-orange-500 shadow-[0_2px_0_#c2410c] hover:bg-orange-500 active:shadow-none active:translate-y-[2px]',
    btnEqual: 'bg-violet-600 text-white border-t border-violet-500 shadow-[0_2px_0_#6d28d9] hover:bg-violet-500 active:shadow-none active:translate-y-[2px]',
    divider: 'border-purple-900',
    toggleBtn: 'bg-purple-900 text-purple-400 hover:text-white hover:bg-purple-800'
  },
  monochrome: {
    name: 'Monochrome',
    container: 'bg-zinc-950 border-zinc-800 shadow-zinc-900/50',
    headerText: 'text-zinc-500',
    displayBg: 'bg-zinc-900',
    displayBorder: 'border-zinc-800',
    displayText: 'text-zinc-100',
    btnNumber: 'bg-zinc-800 text-zinc-100 border-t border-zinc-700 hover:bg-zinc-700 active:border-transparent',
    btnOperator: 'bg-zinc-200 text-zinc-900 border-t border-white shadow-[0_2px_0_#a1a1aa] hover:bg-white active:shadow-none active:translate-y-[2px]',
    btnFunction: 'bg-zinc-900 text-zinc-400 border-t border-zinc-800 hover:bg-zinc-800 active:border-transparent',
    btnControl: 'bg-zinc-900 text-zinc-500 border-t border-zinc-800 hover:bg-zinc-800 active:border-transparent',
    btnAction: 'bg-zinc-600 text-white border-t border-zinc-500 shadow-[0_2px_0_#3f3f46] hover:bg-zinc-500 active:shadow-none active:translate-y-[2px]',
    btnEqual: 'bg-zinc-100 text-black border-t border-white shadow-[0_2px_0_#a1a1aa] hover:bg-white active:shadow-none active:translate-y-[2px]',
    divider: 'border-zinc-800',
    toggleBtn: 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800'
  }
};

interface CalculatorProps {
  value: string;
  onChange: (value: string) => void;
  onSolve: () => void;
  currentTheme: ThemeId;
  onThemeChange: (theme: ThemeId) => void;
  onSwitchToText: () => void;
}

export const Calculator: React.FC<CalculatorProps> = ({ 
  value, 
  onChange, 
  onSolve, 
  currentTheme, 
  onThemeChange,
  onSwitchToText
}) => {
  const [isShift, setIsShift] = useState(false);
  const [isAlpha, setIsAlpha] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [memory, setMemory] = useState<number>(0);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [value]);

  const cycleTheme = () => {
    const themes: ThemeId[] = ['classic', 'ocean', 'forest', 'sunset', 'monochrome'];
    const nextIdx = (themes.indexOf(currentTheme) + 1) % themes.length;
    const newTheme = themes[nextIdx];
    onThemeChange(newTheme);
  };

  const theme = THEMES[currentTheme];

  // --- Memory Functions ---
  const handleMemory = (op: 'M+' | 'M-' | 'MR' | 'MC') => {
    // Use the robust evaluator instead of eval
    // Defaults to Degrees (true) as typical for calculators
    const currentVal = evaluate(value, true); 
    
    if (isNaN(currentVal)) return;

    if (op === 'M+') {
      setMemory(prev => prev + currentVal);
      // Optional: Flash visual feedback
    } else if (op === 'M-') {
      setMemory(prev => prev - currentVal);
    } else if (op === 'MR') {
      onChange(value + memory.toString());
    } else if (op === 'MC') {
      setMemory(0);
    }
  };

  // --- Icon Components ---

  const EmptyBox = ({ className = "w-2.5 h-2.5" }: { className?: string }) => (
    <div className={`border border-current/60 border-dashed rounded-[1px] ${className}`}></div>
  );

  const FractionIcon = () => (
    <div className="flex flex-col items-center justify-center leading-none scale-110">
      <EmptyBox />
      <div className="border-b border-current w-5 h-[1px] my-[2px]"></div>
      <EmptyBox />
    </div>
  );

  const MixedFractionIcon = () => (
    <div className="flex items-center gap-[2px] scale-75">
      <EmptyBox className="w-2 h-3 border-solid" />
      <div className="flex flex-col items-center leading-none">
        <EmptyBox className="w-2 h-2" />
        <div className="border-b border-current w-3 h-[1px] my-[1px]"></div>
        <EmptyBox className="w-2 h-2" />
      </div>
    </div>
  );

  const DerivativeIcon = () => (
    <div className="flex flex-col items-center leading-none scale-100 font-serif italic">
      <div className="flex items-center text-[10px] mb-[1px]">d</div>
      <div className="border-b border-current w-5 h-[1px] mb-[1px]"></div>
      <div className="flex items-center text-[10px]">dx</div>
    </div>
  );

  const SecondDerivativeIcon = () => (
    <div className="flex flex-col items-center leading-none scale-75 font-serif italic">
      <div className="flex items-center text-[10px] mb-[1px]">d<sup className="not-italic text-[8px] -mt-1">2</sup></div>
      <div className="border-b border-current w-5 h-[1px] mb-[1px]"></div>
      <div className="flex items-center text-[10px]">dx<sup className="not-italic text-[8px] -mt-1">2</sup></div>
    </div>
  );

  const IntegralIcon = ({ definite = false }) => (
    <div className="relative flex items-center justify-center h-full">
      <span className="italic font-serif text-2xl font-light leading-none -ml-1">∫</span>
      <EmptyBox className={`absolute top-0 right-0 w-2 h-2 ${definite ? 'opacity-100' : 'opacity-0'}`} />
      <span className={`absolute top-1/2 -translate-y-1/2 right-0 w-2 h-3 border border-dashed border-current/50 rounded-[1px] flex items-center justify-center text-[6px] ${definite ? 'hidden' : 'flex'}`}>dx</span>
      <EmptyBox className={`absolute bottom-0 right-0 w-2 h-2 ${definite ? 'opacity-100' : 'opacity-0'}`} />
    </div>
  );

  const LogBaseIcon = () => (
    <div className="flex items-end leading-none">
      <span className="text-sm font-medium mr-0.5">log</span>
      <EmptyBox className="w-2 h-2 mb-0.5" />
    </div>
  );

  const SqrtIcon = ({ root = false }) => (
    <div className="relative flex items-end leading-none ml-1">
       {root && <EmptyBox className="absolute -top-1 -left-2 w-1.5 h-1.5 border-solid scale-75" />}
       <span className="text-xl -mr-1 leading-none">√</span>
       <span className="border-t border-current h-4 w-3 mt-1"></span>
       <EmptyBox className="absolute left-3 bottom-0.5 scale-90" />
    </div>
  );

  const PowerIcon = ({ label = "x", inverse = false }) => (
    <div className="flex items-start leading-none font-serif italic font-bold">
      <span className="text-lg">{label}</span>
      <div className="ml-[1px] -mt-0.5">
        {inverse ? <span className="text-[9px] not-italic font-normal">-1</span> : <EmptyBox className="w-2 h-2" />}
      </div>
    </div>
  );

  const AbsIcon = () => (
    <div className="flex items-center justify-center gap-0.5 font-bold">
      <span className="text-sm">|</span>
      <EmptyBox />
      <span className="text-sm">|</span>
    </div>
  );

  const SCIENTIFIC_KEYS: CalculatorButton[] = [
    // Row 1: Navigation & Control
    { label: 'SHIFT', value: 'SHIFT', type: 'control' },
    { label: 'ALPHA', value: 'ALPHA', type: 'control' },
    { label: <ArrowLeft size={18} />, value: 'LEFT', type: 'control' },
    { label: <ArrowRight size={18} />, value: 'RIGHT', type: 'control' },
    { label: <div className="flex items-center gap-1 font-bold text-xs">ON</div>, value: 'CLEAR', type: 'action' },

    // Row 2: Calculus & Logic
    { label: 'CALC', value: 'CALC', type: 'function', shiftLabel: 'SOLVE', shiftValue: 'SOLVE' },
    { label: <IntegralIcon definite={true} />, value: '∫(', type: 'function', shiftLabel: <IntegralIcon />, shiftValue: '∫(,,)' },
    { label: <DerivativeIcon />, value: 'd/dx(', type: 'function', shiftLabel: <SecondDerivativeIcon />, shiftValue: 'd^2/dx^2(' },
    { label: <PowerIcon label="x" inverse />, value: '^(-1)', type: 'function', shiftLabel: 'x!', shiftValue: '!' },
    { label: <LogBaseIcon />, value: 'log_b(', type: 'function', shiftLabel: <div className="flex items-center gap-0.5 scale-75"><Sigma size={12}/></div>, shiftValue: 'sum(' },

    // Row 3: Roots & Fractions
    { label: <FractionIcon />, value: '/', type: 'operator', shiftLabel: <MixedFractionIcon />, shiftValue: 'mixed(' },
    { label: <SqrtIcon />, value: '√(', type: 'function', shiftLabel: <SqrtIcon root />, shiftValue: '³√(' },
    { label: <div className="font-serif italic font-bold">x<sup className="not-italic text-xs font-normal">2</sup></div>, value: '^2', type: 'function', shiftLabel: <div className="font-serif italic font-bold">x<sup className="not-italic text-xs font-normal">3</sup></div>, shiftValue: '^3' },
    { label: <PowerIcon />, value: '^', type: 'operator', shiftLabel: <span className="text-[9px] font-bold"><sup className="italic">x</sup>√</span>, shiftValue: 'root(' },
    { label: 'log', value: 'log(', type: 'function', shiftLabel: <span className="text-[9px] font-bold">10<sup className="font-normal">x</sup></span>, shiftValue: '10^' },

    // Row 4: Trig & Logs
    { label: 'ln', value: 'ln(', type: 'function', shiftLabel: <span className="text-[9px] font-bold italic font-serif">e<sup className="font-normal not-italic">x</sup></span>, shiftValue: 'e^', alphaLabel: 'C', alphaValue: 'C' },
    { label: <span className="text-lg">(-)</span>, value: '-', type: 'function', shiftLabel: <div className="scale-75"><AbsIcon /></div>, shiftValue: 'abs(', alphaLabel: 'A', alphaValue: 'A' },
    { label: '° ′ ″', value: 'deg', type: 'function', shiftLabel: 'FACT', shiftValue: 'fact', alphaLabel: 'B', alphaValue: 'B' },
    { label: 'sin', value: 'sin(', type: 'function', shiftLabel: <span className="text-[8px] font-bold">sin⁻¹</span>, shiftValue: 'sin⁻¹(', alphaLabel: 'D', alphaValue: 'D' },
    { label: 'cos', value: 'cos(', type: 'function', shiftLabel: <span className="text-[8px] font-bold">cos⁻¹</span>, shiftValue: 'cos⁻¹(', alphaLabel: 'E', alphaValue: 'E' },

    // Row 5: Variables & Parens
    { label: 'tan', value: 'tan(', type: 'function', shiftLabel: <span className="text-[8px] font-bold">tan⁻¹</span>, shiftValue: 'tan⁻¹(', alphaLabel: 'F', alphaValue: 'F' },
    { label: <span className="font-serif italic font-bold">x</span>, value: 'x', type: 'function', shiftLabel: 'STO', shiftValue: 'STO' },
    { label: <span className="font-serif italic font-bold">y</span>, value: 'y', type: 'function', shiftLabel: 'ENG', shiftValue: 'ENG' },
    { label: '(', value: '(', type: 'function', shiftLabel: ';', shiftValue: ';', alphaLabel: ':', alphaValue: ':' },
    { label: ')', value: ')', type: 'function', shiftLabel: ',', shiftValue: ',', alphaLabel: 'M', alphaValue: 'M' },
  ];

  const BASIC_KEYS: CalculatorButton[] = [
    // Row 6
    { label: '7', value: '7', type: 'number', shiftLabel: 'Det', shiftValue: 'det(' },
    { label: '8', value: '8', type: 'number', shiftLabel: 'Trn', shiftValue: 'transpose(' },
    { label: '9', value: '9', type: 'number', shiftLabel: 'Inv', shiftValue: 'inverse(' },
    { label: <Delete size={20} />, value: 'DELETE', type: 'action', shiftLabel: 'INS', shiftValue: 'INS' },
    { label: <span className="text-xs font-bold">AC</span>, value: 'CLEAR', type: 'action', shiftLabel: 'OFF', shiftValue: 'OFF' },

    // Row 7
    { label: '4', value: '4', type: 'number', shiftLabel: <Grid3X3 size={10} />, shiftValue: 'matrix(' },
    { label: '5', value: '5', type: 'number', shiftLabel: <MoveDiagonal size={10} />, shiftValue: 'vector(' },
    { label: '6', value: '6', type: 'number', shiftLabel: 'Mean', shiftValue: 'mean(' },
    { label: '×', value: '×', type: 'operator', shiftLabel: 'nPr', shiftValue: 'nPr(', alphaLabel: 'Dot', alphaValue: 'dot(' },
    { label: '÷', value: '÷', type: 'operator', shiftLabel: 'nCr', shiftValue: 'nCr(', alphaLabel: 'Cross', alphaValue: 'cross(' },

    // Row 8
    { label: '1', value: '1', type: 'number', shiftLabel: 'StDev', shiftValue: 'stdev(' },
    { label: '2', value: '2', type: 'number', shiftLabel: 'Cmplx', shiftValue: 'complex(' },
    { label: '3', value: '3', type: 'number', shiftLabel: 'Var', shiftValue: 'variance(' },
    { label: '+', value: '+', type: 'operator', shiftLabel: 'Pol', shiftValue: 'Pol(' },
    { label: '−', value: '-', type: 'operator', shiftLabel: 'Rec', shiftValue: 'Rec(' },

    // Row 9
    { label: '0', value: '0', type: 'number', shiftLabel: 'Rnd', shiftValue: 'rnd', alphaLabel: 'e', alphaValue: 'e' },
    { label: '.', value: '.', type: 'number', shiftLabel: 'Ran#', shiftValue: 'ran', alphaLabel: 'π', alphaValue: 'π' },
    { label: '=', value: '=', type: 'operator', shiftLabel: '×10ˣ', shiftValue: '*10^' },
    { label: 'Ans', value: 'Ans', type: 'number', shiftLabel: 'Pre', shiftValue: 'preAns' },
    { label: <div className="flex items-center gap-1 font-bold text-xs sm:text-sm"><Play size={12} fill="currentColor"/> SOLVE</div>, value: 'SOLVE_ACTION', type: 'action', shiftLabel: '≈', shiftValue: 'approx', alphaLabel: '%', alphaValue: '%' },
  ];

  const handlePress = (btn: CalculatorButton) => {
    if (btn.value === 'SHIFT') {
      setIsShift(!isShift);
      setIsAlpha(false);
      return;
    }
    if (btn.value === 'ALPHA') {
      setIsAlpha(!isAlpha);
      setIsShift(false);
      return;
    }

    // Determine which value to send based on state
    let valToSend = btn.value;
    
    if (isShift && btn.shiftValue) {
      valToSend = btn.shiftValue;
    } else if (isAlpha && btn.alphaValue) {
      valToSend = btn.alphaValue;
    }

    // Handle Actions
    if (valToSend === 'CLEAR') {
      onChange('');
    } else if (valToSend === 'DELETE') {
      onChange(value.slice(0, -1));
    } else if (valToSend === 'SOLVE_ACTION') {
      onSolve(); 
    } else if (valToSend === 'LEFT' || valToSend === 'RIGHT') {
      textareaRef.current?.focus();
    } else {
      onChange(value + valToSend);
    }

    // Reset modifiers after a press (unless it's a control key)
    if (btn.type !== 'control') {
        setIsShift(false);
        setIsAlpha(false);
    }
  };

  const getBtnClasses = (btn: CalculatorButton) => {
    const base = "relative rounded-md flex items-center justify-center transition-all duration-75 select-none active:scale-[0.98]";
    const height = "h-12 sm:h-14";
    
    let colors = theme.btnNumber; // Default

    if (btn.type === 'operator') colors = theme.btnOperator;
    if (btn.type === 'function') colors = theme.btnFunction;
    if (btn.type === 'control') colors = theme.btnControl;
    if (btn.type === 'action') colors = theme.btnAction;
    
    // Specific Overrides
    if (btn.value === 'SOLVE_ACTION') colors = `${theme.btnEqual} text-lg font-bold tracking-wide`; // Main action
    if (btn.value === 'SHIFT') colors = isShift ? "bg-yellow-500 text-slate-900 shadow-inner" : theme.btnControl;
    if (btn.value === 'ALPHA') colors = isAlpha ? "bg-purple-500 text-white shadow-inner" : theme.btnControl;

    return `${base} ${height} ${colors}`;
  };

  return (
    <div className={`p-4 sm:p-6 rounded-2xl border select-none max-w-2xl mx-auto transition-colors duration-300 ${theme.container}`}>
      
      {/* --- Integrated LCD Display --- */}
      <div className={`mb-6 rounded-xl border-4 shadow-inner overflow-hidden relative transition-colors duration-300 ${theme.displayBg} ${theme.displayBorder}`}>
        
        {/* Status Bar */}
        <div className={`h-7 bg-black/20 flex items-center justify-between px-3 text-[10px] font-bold tracking-widest uppercase border-b ${theme.displayBorder} ${theme.headerText}`}>
          <div className="flex items-center gap-2">
             <button 
                onClick={cycleTheme} 
                className="hover:text-white transition-colors flex items-center gap-1 group px-1.5 py-0.5 rounded hover:bg-white/10 mr-2"
                title={`Current Theme: ${theme.name}`}
             >
                <Palette size={12} className="group-hover:rotate-12 transition-transform" />
             </button>
             <span className={`transition-colors ${isShift ? "text-yellow-500" : "opacity-40"}`}>S</span>
             <span className={`transition-colors ${isAlpha ? "text-purple-400" : "opacity-40"}`}>A</span>
             <span className={`transition-colors ${memory !== 0 ? "text-white" : "opacity-40"}`}>M</span>
             <span className="opacity-80">DEG</span>
          </div>
          
          {/* Top Right Controls */}
          <div className="flex items-center gap-2">
             <button
              onClick={onSwitchToText}
              className="flex items-center gap-1 hover:text-white transition-colors px-1.5 py-0.5 rounded hover:bg-white/10"
              title="Switch to Text Input"
             >
                <Keyboard size={12} />
                <span className="hidden sm:inline">Text Mode</span>
             </button>
             <div className="opacity-50 text-[9px] pl-2 border-l border-white/10">
               SCIENTIFIC
             </div>
          </div>
        </div>

        {/* Main Display Area */}
        <div className="relative min-h-[5rem] p-3 sm:p-4 flex flex-col justify-end">
          {/* Rendered Preview (Background/Visual) */}
          <div className="text-right text-white/40 text-sm mb-1 pointer-events-none font-medium flex justify-end items-center gap-2 opacity-70">
             {value && <Eye size={12} />}
             <MathDisplay text={value} className={theme.displayText} />
          </div>

          {/* Raw Input (Editable) */}
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="0"
            className="w-full bg-transparent border-none text-right text-2xl sm:text-3xl font-mono text-white placeholder-white/20 focus:ring-0 p-0 resize-none overflow-hidden leading-tight drop-shadow-sm"
            rows={1}
            spellCheck={false}
            autoCapitalize="off"
          />
        </div>
      </div>
      
      {/* --- Collapsible Scientific Drawer & Memory --- */}
      <div className="relative mb-4">
        <div className={`
            flex items-center justify-between rounded-lg overflow-hidden
            ${theme.toggleBtn}
            ${isExpanded ? 'mb-2 shadow-inner' : ''}
          `}
        >
          {/* Memory Controls (Integrated into Drawer Bar) */}
          <div className="flex items-center">
             <button onClick={() => handleMemory('MR')} className="px-3 py-2 text-xs font-bold hover:bg-white/10 transition-colors border-r border-white/5 active:bg-white/20">MR</button>
             <button onClick={() => handleMemory('M+')} className="px-3 py-2 text-xs font-bold hover:bg-white/10 transition-colors border-r border-white/5 active:bg-white/20">M+</button>
             <button onClick={() => handleMemory('M-')} className="px-3 py-2 text-xs font-bold hover:bg-white/10 transition-colors border-r border-white/5 active:bg-white/20">M-</button>
             <button onClick={() => handleMemory('MC')} className="px-2 py-2 text-[10px] opacity-60 hover:opacity-100 hover:bg-white/10 transition-colors active:bg-white/20">MC</button>
          </div>

          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex-1 flex items-center justify-end gap-2 px-4 py-2 text-xs font-bold tracking-widest uppercase hover:bg-white/5 transition-all"
          >
            <span>Scientific</span>
            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>

        <div className={`
          grid grid-cols-5 gap-2 sm:gap-3 overflow-hidden transition-all duration-500 ease-in-out origin-top
          ${isExpanded ? 'max-h-[500px] opacity-100 py-2' : 'max-h-0 opacity-0 py-0'}
        `}>
          {SCIENTIFIC_KEYS.map((btn, idx) => (
            <button key={`sci-${idx}`} onClick={() => handlePress(btn)} className={getBtnClasses(btn)}>
               {/* Shift/Alpha labels */}
               {btn.shiftLabel && <span className={`absolute top-0.5 left-1 text-[7px] sm:text-[8px] font-bold leading-tight ${isShift ? 'text-slate-900' : 'text-yellow-500'}`}>{btn.shiftLabel}</span>}
               {btn.alphaLabel && <span className={`absolute top-0.5 right-1 text-[7px] sm:text-[8px] font-bold leading-tight ${isAlpha ? 'text-white' : 'text-purple-400'}`}>{btn.alphaLabel}</span>}
               <span className={`font-medium flex items-center justify-center transition-transform ${typeof btn.label === 'string' && btn.label.length > 3 ? 'text-xs sm:text-sm' : 'text-base sm:text-xl'}`}>{btn.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* --- Basic Keys Section --- */}
      <div className="grid grid-cols-5 gap-2 sm:gap-3">
        {BASIC_KEYS.map((btn, idx) => (
          <button key={`basic-${idx}`} onClick={() => handlePress(btn)} className={getBtnClasses(btn)}>
            {/* Shift/Alpha labels */}
             {btn.shiftLabel && <span className={`absolute top-0.5 left-1 text-[7px] sm:text-[8px] font-bold leading-tight ${isShift ? 'text-slate-900' : 'text-yellow-500'}`}>{btn.shiftLabel}</span>}
             {btn.alphaLabel && <span className={`absolute top-0.5 right-1 text-[7px] sm:text-[8px] font-bold leading-tight ${isAlpha ? 'text-white' : 'text-purple-400'}`}>{btn.alphaLabel}</span>}
             <span className={`font-medium flex items-center justify-center transition-transform ${typeof btn.label === 'string' && btn.label.length > 3 ? 'text-xs sm:text-sm' : 'text-base sm:text-xl'}`}>{btn.label}</span>
          </button>
        ))}
      </div>
      
      {/* --- Footer Branding --- */}
      <div className="text-center mt-4 opacity-30 text-[10px] font-mono tracking-widest">
        SOLVE AI SERIES X-300
      </div>
    </div>
  );
};
