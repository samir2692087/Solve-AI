
import React, { useState, useRef, useEffect } from 'react';
import { MathDisplay } from './MathDisplay';
import { 
  Layout, 
  Sigma, 
  FunctionSquare, 
  Binary, 
  Triangle, 
  Delete, 
  ArrowLeft, 
  ArrowRight, 
  Eye
} from 'lucide-react';

interface VisualEquationEditorProps {
  value: string;
  onChange: (value: string) => void;
  onSolve: () => void;
}

type Category = 'ESSENTIALS' | 'CALCULUS' | 'ALGEBRA' | 'TRIG' | 'SYMBOLS';

interface PaletteItem {
  label: React.ReactNode;
  insert: string;
  description: string;
}

export const VisualEquationEditor: React.FC<VisualEquationEditorProps> = ({ value, onChange, onSolve }) => {
  const [activeCategory, setActiveCategory] = useState<Category>('ESSENTIALS');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [value]);

  const handleInsert = (text: string) => {
    // Simple insertion at end for now, could be improved to insert at cursor
    onChange(value + text);
    textareaRef.current?.focus();
  };

  const handleClear = () => onChange('');
  const handleDelete = () => onChange(value.slice(0, -1));

  // --- Icons / Visuals ---
  const EmptyBox = ({ className = "w-3 h-3 border border-dashed border-current opacity-60 rounded-[1px]" }: { className?: string }) => (
    <div className={className}></div>
  );

  const categories: { id: Category; label: string; icon: React.ReactNode }[] = [
    { id: 'ESSENTIALS', label: 'Essentials', icon: <Layout size={16}/> },
    { id: 'CALCULUS', label: 'Calculus', icon: <Sigma size={16}/> },
    { id: 'ALGEBRA', label: 'Algebra', icon: <Binary size={16}/> },
    { id: 'TRIG', label: 'Trigonometry', icon: <Triangle size={16}/> },
    { id: 'SYMBOLS', label: 'Symbols', icon: <FunctionSquare size={16}/> },
  ];

  const paletteData: Record<Category, PaletteItem[]> = {
    ESSENTIALS: [
      { 
        label: <div className="flex flex-col items-center scale-110"><EmptyBox /><div className="w-4 h-[1px] bg-current my-0.5"></div><EmptyBox /></div>, 
        insert: '/', 
        description: 'Fraction' 
      },
      { 
        label: <div className="flex items-start"><span className="text-lg leading-none">√</span><EmptyBox className="mt-1"/></div>, 
        insert: 'sqrt(', 
        description: 'Square Root' 
      },
      { 
        label: <div className="flex items-start"><span className="text-[10px] mr-0.5 mt-0.5">3</span><span className="text-lg leading-none">√</span><EmptyBox className="mt-1"/></div>, 
        insert: 'cbrt(', 
        description: 'Cube Root' 
      },
      { 
        label: <div className="flex items-start"><EmptyBox /><span className="text-[10px] -mt-1 ml-0.5">n</span></div>, 
        insert: '^', 
        description: 'Power' 
      },
      { 
        label: <div className="flex items-end"><EmptyBox /><span className="text-[10px] -mb-1 ml-0.5">n</span></div>, 
        insert: '_', 
        description: 'Subscript' 
      },
      { 
        label: <div className="flex items-center gap-0.5 text-sm font-bold">| <EmptyBox /> |</div>, 
        insert: 'abs(', 
        description: 'Absolute Value' 
      },
      { 
        label: <span className="font-bold text-lg">( )</span>, 
        insert: '()', 
        description: 'Parentheses' 
      },
      { 
        label: <span className="font-bold text-lg">[ ]</span>, 
        insert: '[]', 
        description: 'Brackets' 
      },
    ],
    CALCULUS: [
      { 
        label: <div className="italic font-serif text-xl">∫</div>, 
        insert: '∫(', 
        description: 'Indefinite Integral' 
      },
      { 
        label: <div className="flex flex-col items-center justify-center h-8 relative"><span className="text-[9px] absolute top-0 right-0">b</span><span className="italic font-serif text-xl leading-none">∫</span><span className="text-[9px] absolute bottom-0 right-0">a</span></div>, 
        insert: '∫(f(x), a, b)', 
        description: 'Definite Integral' 
      },
      { 
        label: <div className="flex flex-col items-center leading-none scale-90 font-serif italic"><div className="text-[10px] border-b border-current mb-[1px]">d</div><div className="text-[10px]">dx</div></div>, 
        insert: 'd/dx(', 
        description: 'Derivative' 
      },
      { 
        label: <div className="flex items-center gap-1 text-xs font-bold">lim<div className="flex flex-col text-[8px] leading-none"><span>x→∞</span></div></div>, 
        insert: 'lim(f(x), x, inf)', 
        description: 'Limit' 
      },
      { 
        label: <div className="flex flex-col items-center leading-none"><span className="text-[8px]">n</span><span className="text-lg">Σ</span><span className="text-[8px]">i=0</span></div>, 
        insert: 'sum(expression, i, 0, n)', 
        description: 'Summation' 
      },
      { 
        label: <div className="flex flex-col items-center leading-none"><span className="text-[8px]">n</span><span className="text-lg">Π</span><span className="text-[8px]">i=0</span></div>, 
        insert: 'product(expression, i, 0, n)', 
        description: 'Product' 
      },
    ],
    ALGEBRA: [
      {
        label: <div className="text-xs font-mono">[2x2]</div>,
        insert: 'matrix([[1,0],[0,1]])',
        description: '2x2 Matrix'
      },
      {
        label: <div className="text-xs font-mono">[3x3]</div>,
        insert: 'matrix([[1,0,0],[0,1,0],[0,0,1]])',
        description: '3x3 Matrix'
      },
      {
        label: <div className="text-xs font-mono">[v]</div>,
        insert: 'vector(x, y, z)',
        description: 'Vector'
      },
      {
        label: <span className="font-bold text-sm">log</span>,
        insert: 'log(',
        description: 'Logarithm'
      },
      {
        label: <span className="font-bold text-sm">ln</span>,
        insert: 'ln(',
        description: 'Natural Log'
      },
      {
        label: <span className="font-bold text-sm">n!</span>,
        insert: '!',
        description: 'Factorial'
      }
    ],
    TRIG: [
      { label: 'sin', insert: 'sin(', description: 'Sine' },
      { label: 'cos', insert: 'cos(', description: 'Cosine' },
      { label: 'tan', insert: 'tan(', description: 'Tangent' },
      { label: 'csc', insert: 'csc(', description: 'Cosecant' },
      { label: 'sec', insert: 'sec(', description: 'Secant' },
      { label: 'cot', insert: 'cot(', description: 'Cotangent' },
      { label: <span className="text-xs">sin⁻¹</span>, insert: 'asin(', description: 'Arc Sine' },
      { label: <span className="text-xs">cos⁻¹</span>, insert: 'acos(', description: 'Arc Cosine' },
      { label: <span className="text-xs">tan⁻¹</span>, insert: 'atan(', description: 'Arc Tangent' },
      { label: 'sinh', insert: 'sinh(', description: 'Hyperbolic Sine' },
    ],
    SYMBOLS: [
      { label: 'π', insert: 'pi', description: 'Pi' },
      { label: 'e', insert: 'e', description: 'Euler Number' },
      { label: '∞', insert: 'infinity', description: 'Infinity' },
      { label: 'θ', insert: 'theta', description: 'Theta' },
      { label: 'λ', insert: 'lambda', description: 'Lambda' },
      { label: 'Δ', insert: 'delta', description: 'Delta' },
      { label: '≤', insert: '<=', description: 'Less or Equal' },
      { label: '≥', insert: '>=', description: 'Greater or Equal' },
      { label: '≠', insert: '!=', description: 'Not Equal' },
    ]
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden">
      
      {/* --- Unified Display Section (Same as Calculator) --- */}
      <div className="p-4 pb-0">
        <div className="bg-[#1a1f2c] rounded-xl border-4 border-slate-800 shadow-inner overflow-hidden relative">
          <div className="h-6 bg-[#151922] flex items-center justify-between px-3 text-[10px] font-bold text-slate-500 tracking-widest uppercase border-b border-slate-800">
            <div className="flex gap-2 items-center">
               <Layout size={10} />
               <span>Visual Editor</span>
            </div>
            <div>Solve AI</div>
          </div>

          <div className="relative min-h-[6rem] p-4 flex flex-col">
            {/* Rendered Preview */}
            <div className="text-right text-slate-400/60 text-sm mb-2 min-h-[1.5rem] pointer-events-none font-medium flex justify-end items-center gap-2">
               {value && <Eye size={14} className="opacity-50"/>}
               <MathDisplay text={value} className="text-indigo-400/80 text-lg" />
            </div>

            {/* Raw Input */}
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="Build your equation..."
              className="w-full bg-transparent border-none text-right text-2xl sm:text-3xl font-mono text-white placeholder-slate-700 focus:ring-0 p-0 resize-none overflow-hidden leading-tight"
              rows={1}
              spellCheck={false}
              autoCapitalize="off"
            />
          </div>
        </div>
      </div>

      {/* --- Control Bar --- */}
      <div className="px-4 py-2 flex justify-end gap-2">
         <button onClick={() => textareaRef.current?.focus()} className="p-2 text-slate-400 hover:text-white bg-slate-800 rounded hover:bg-slate-700 transition-colors"><ArrowLeft size={18}/></button>
         <button onClick={() => textareaRef.current?.focus()} className="p-2 text-slate-400 hover:text-white bg-slate-800 rounded hover:bg-slate-700 transition-colors"><ArrowRight size={18}/></button>
         <button onClick={handleDelete} className="p-2 text-red-400 hover:text-red-200 bg-slate-800 rounded hover:bg-red-900/30 transition-colors"><Delete size={18}/></button>
         <button onClick={onSolve} className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded shadow-lg shadow-indigo-600/20 transition-all active:scale-95">
           SOLVE
         </button>
      </div>

      {/* --- Palette Section --- */}
      <div className="flex-1 flex flex-col bg-slate-950/50 border-t border-slate-800">
        
        {/* Tabs */}
        <div className="flex overflow-x-auto border-b border-slate-800 scrollbar-hide">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`
                flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-bold tracking-wide whitespace-nowrap transition-colors
                ${activeCategory === cat.id 
                  ? 'text-indigo-400 bg-slate-800/50 border-b-2 border-indigo-500' 
                  : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/30'}
              `}
            >
              {cat.icon}
              {cat.label}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
            {paletteData[activeCategory].map((item, idx) => (
              <button
                key={idx}
                onClick={() => handleInsert(item.insert)}
                title={item.description}
                className="
                  flex flex-col items-center justify-center gap-2 aspect-square p-2 rounded-xl
                  bg-slate-800 border border-slate-700 shadow-sm
                  hover:bg-slate-700 hover:border-indigo-500/50 hover:shadow-indigo-500/10 hover:scale-105
                  active:scale-95 transition-all duration-150 group
                "
              >
                <div className="text-slate-200 group-hover:text-white transition-colors flex items-center justify-center h-8">
                  {item.label}
                </div>
                <span className="text-[10px] text-slate-500 font-medium uppercase tracking-tighter truncate w-full text-center group-hover:text-indigo-300">
                  {typeof item.label === 'string' ? item.description : item.description}
                </span>
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
