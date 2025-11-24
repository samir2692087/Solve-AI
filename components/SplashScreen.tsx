
import React, { useState, useEffect } from 'react';
import { Calculator, Sparkles, Brain, Loader2, CheckCircle2 } from 'lucide-react';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [mounted, setMounted] = useState(false);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    setMounted(true);

    // Auto-dismiss logic
    const timer = setTimeout(() => {
      handleComplete();
    }, 1800);

    return () => clearTimeout(timer);
  }, []);

  const handleComplete = () => {
    setExiting(true);
    // Wait for exit animation to finish before unmounting
    setTimeout(() => {
      onComplete();
    }, 400);
  };

  return (
    <div 
      className={`fixed inset-0 z-50 bg-slate-950 flex flex-col items-center justify-center p-4 transition-opacity duration-500 cursor-pointer ${exiting ? 'opacity-0' : 'opacity-100'}`}
      onClick={handleComplete}
    >
      
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/10 rounded-full blur-[100px]"></div>
      </div>

      <div className={`flex flex-col items-center transition-all duration-1000 transform ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
        
        {/* Icon Container */}
        <div className="relative mb-8 group">
          <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500 to-emerald-500 rounded-3xl blur-lg opacity-40 animate-pulse"></div>
          <div className="relative bg-slate-900 p-8 rounded-3xl border border-slate-700 shadow-2xl flex items-center justify-center transform transition-transform duration-300">
             <Calculator size={80} className="text-white drop-shadow-md" />
             
             {/* Floating Elements */}
             <div className="absolute -top-3 -right-3 bg-slate-800 p-2 rounded-xl border border-slate-700 shadow-lg animate-bounce">
                <Sparkles size={24} className="text-yellow-400" />
             </div>
             <div className="absolute -bottom-2 -left-2 bg-slate-800 p-2 rounded-xl border border-slate-700 shadow-lg animate-pulse">
                <Brain size={20} className="text-emerald-400" />
             </div>
          </div>
        </div>

        {/* Branding */}
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 text-center tracking-tight">
          Solve <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-emerald-400">AI</span>
        </h1>
        <p className="text-slate-400 text-lg md:text-xl mb-12 text-center max-w-md leading-relaxed">
          Advanced AI Solver • Scientific Calculator
        </p>

        {/* Loading Indicator */}
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={32} className="text-indigo-500 animate-spin" />
          <span className="text-slate-500 text-sm font-medium tracking-wide">Initializing engine...</span>
        </div>

      </div>

      <div className="absolute bottom-6 text-slate-600 text-xs font-mono tracking-widest uppercase">
        Version 1.0.0
      </div>
    </div>
  );
};
