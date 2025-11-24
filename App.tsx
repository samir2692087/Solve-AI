
import React, { useState, useRef, useEffect, useCallback, Suspense } from 'react';
import { Calculator } from './components/Calculator';
import { DrawingPad } from './components/DrawingPad';
import { MessageBubble } from './components/MessageBubble';
import { SplashScreen } from './components/SplashScreen';
import { solveMathProblem } from './services/geminiService';
import { InputMode, Message, ThemeId } from './types';
import { 
  Calculator as CalcIcon, 
  Image as ImageIcon, 
  Send, 
  Type, 
  Trash2, 
  Loader2, 
  Pencil,
  ArrowRightLeft,
  Mic,
  MicOff,
  Landmark,
  Cake,
  History,
  LayoutGrid,
  ChevronDown,
  Percent,
  Coins,
  Info,
  Shield
} from 'lucide-react';

// Lazy load tools to improve initial load time
const UnitConverter = React.lazy(() => import('./components/UnitConverter').then(m => ({ default: m.UnitConverter })));
const EMICalculator = React.lazy(() => import('./components/EMICalculator').then(m => ({ default: m.EMICalculator })));
const AgeCalculator = React.lazy(() => import('./components/AgeCalculator').then(m => ({ default: m.AgeCalculator })));
const GSTCalculator = React.lazy(() => import('./components/GSTCalculator').then(m => ({ default: m.GSTCalculator })));
const CurrencyConverter = React.lazy(() => import('./components/CurrencyConverter').then(m => ({ default: m.CurrencyConverter })));
const HistoryView = React.lazy(() => import('./components/HistoryView').then(m => ({ default: m.HistoryView })));
const AboutView = React.lazy(() => import('./components/AboutView').then(m => ({ default: m.AboutView })));
const PrivacyView = React.lazy(() => import('./components/PrivacyView').then(m => ({ default: m.PrivacyView })));

// Import html2canvas and jspdf from window (loaded via CDN in index.html)
declare global {
  interface Window {
    html2canvas: any;
    jspdf: any;
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

const App: React.FC = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [inputMode, setInputMode] = useState<InputMode>(InputMode.CALCULATOR);
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [isToolsOpen, setIsToolsOpen] = useState(false);
  
  // Theme State
  const [currentTheme, setCurrentTheme] = useState<ThemeId>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('app-theme') as ThemeId) || 'classic';
    }
    return 'classic';
  });

  const handleThemeChange = (newTheme: ThemeId) => {
    setCurrentTheme(newTheme);
    localStorage.setItem('app-theme', newTheme);
  };

  // Ref for auto-scrolling
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  // Ref for file input
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Ref for dropdown
  const toolsRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (toolsRef.current && !toolsRef.current.contains(event.target as Node)) {
        setIsToolsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handlers
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setInputMode(InputMode.IMAGE);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleModeChange = (mode: InputMode) => {
    setInputMode(mode);
  };

  const handleSwitchToText = () => {
    setInputMode(InputMode.TEXT);
  };

  const handleToolSelect = (mode: InputMode) => {
    setInputMode(mode);
    setIsToolsOpen(false);
  };

  // --- Voice Input Logic ---
  const toggleVoiceInput = () => {
    if (isListening) {
      setIsListening(false);
      return;
    }

    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert("Voice recognition is not supported in this browser.");
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      const cleaned = transcript
        .replace(/into/gi, '*')
        .replace(/times/gi, '*')
        .replace(/plus/gi, '+')
        .replace(/minus/gi, '-')
        .replace(/divided by/gi, '/');
      
      setInputText(prev => prev ? `${prev} ${cleaned}` : cleaned);
      setIsListening(false);
      setInputMode(InputMode.TEXT); 
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const handleSolve = useCallback(async (overrideText?: string, overrideImage?: string) => {
    const textToUse = overrideText !== undefined ? overrideText : inputText;
    const imageToUse = overrideImage !== undefined ? overrideImage : selectedImage;

    if ((!textToUse?.trim() && !imageToUse) || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: textToUse || (imageToUse ? 'Solve this problem' : ''),
      image: imageToUse || undefined,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);
    
    // Reset inputs
    setInputText('');
    setSelectedImage(null);

    try {
      const { text, graphData } = await solveMathProblem(textToUse || '', imageToUse || undefined);
      
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: text,
        graphData: graphData,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (error: any) {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: `Error: ${error.message}`,
        timestamp: Date.now(),
        isError: true
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  }, [inputText, selectedImage, isLoading]);

  const NavButton = ({ mode, icon: Icon, label }: { mode: InputMode, icon: any, label: string }) => (
    <button 
      onClick={() => handleModeChange(mode)}
      className={`flex items-center gap-3 p-3 rounded-lg transition-colors w-full text-left ${inputMode === mode ? 'bg-slate-800 text-white border border-slate-700' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}`}
    >
      <Icon size={18} className={inputMode === mode ? 'text-indigo-400' : ''} />
      <span className="font-medium">{label}</span>
    </button>
  );

  const ToolsDropdown = () => (
    <div className="relative" ref={toolsRef}>
      <button 
        onClick={() => setIsToolsOpen(!isToolsOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-slate-800 text-slate-200 rounded-lg hover:bg-slate-700 hover:text-white transition-all border border-slate-700 shadow-sm"
      >
        <LayoutGrid size={18} />
        <span className="hidden sm:inline font-medium text-sm">Apps</span>
        <ChevronDown size={14} className={`transition-transform duration-200 ${isToolsOpen ? 'rotate-180' : ''}`} />
      </button>

      {isToolsOpen && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-[60] overflow-hidden animate-fade-in py-2 ring-1 ring-white/10">
          <div className="px-4 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider">Calculators & Tools</div>
          
          <button onClick={() => handleToolSelect(InputMode.UNIT_CONVERTER)} className="w-full text-left px-4 py-3 hover:bg-slate-800 flex items-center gap-3 transition-colors text-slate-300 hover:text-white">
            <ArrowRightLeft size={18} className="text-indigo-400" /> 
            <div className="flex flex-col">
              <span className="font-medium text-sm">Unit Converter</span>
              <span className="text-[10px] text-slate-500">Length, Mass, Speed...</span>
            </div>
          </button>
          
          <button onClick={() => handleToolSelect(InputMode.CURRENCY_CONVERTER)} className="w-full text-left px-4 py-3 hover:bg-slate-800 flex items-center gap-3 transition-colors text-slate-300 hover:text-white">
            <Coins size={18} className="text-yellow-500" /> 
            <div className="flex flex-col">
              <span className="font-medium text-sm">Currency Converter</span>
              <span className="text-[10px] text-slate-500">Real-time Rates</span>
            </div>
          </button>

          <button onClick={() => handleToolSelect(InputMode.EMI_CALCULATOR)} className="w-full text-left px-4 py-3 hover:bg-slate-800 flex items-center gap-3 transition-colors text-slate-300 hover:text-white">
            <Landmark size={18} className="text-emerald-400" /> 
            <div className="flex flex-col">
              <span className="font-medium text-sm">EMI Calculator</span>
              <span className="text-[10px] text-slate-500">Loan & Finance</span>
            </div>
          </button>
          
          <button onClick={() => handleToolSelect(InputMode.GST_CALCULATOR)} className="w-full text-left px-4 py-3 hover:bg-slate-800 flex items-center gap-3 transition-colors text-slate-300 hover:text-white">
            <Percent size={18} className="text-pink-400" /> 
            <div className="flex flex-col">
              <span className="font-medium text-sm">GST Calculator</span>
              <span className="text-[10px] text-slate-500">Tax inclusive/exclusive</span>
            </div>
          </button>
          
          <button onClick={() => handleToolSelect(InputMode.AGE_CALCULATOR)} className="w-full text-left px-4 py-3 hover:bg-slate-800 flex items-center gap-3 transition-colors text-slate-300 hover:text-white">
            <Cake size={18} className="text-rose-400" /> 
            <div className="flex flex-col">
              <span className="font-medium text-sm">Age Calculator</span>
              <span className="text-[10px] text-slate-500">Exact Date Diff</span>
            </div>
          </button>
          
          <div className="my-2 border-t border-slate-800 mx-2"></div>
          
          <button onClick={() => handleToolSelect(InputMode.HISTORY)} className="w-full text-left px-4 py-3 hover:bg-slate-800 flex items-center gap-3 transition-colors text-slate-300 hover:text-white">
            <History size={18} className="text-orange-400" /> 
            <div className="flex flex-col">
              <span className="font-medium text-sm">History & PDF</span>
              <span className="text-[10px] text-slate-500">Export Reports</span>
            </div>
          </button>

          <div className="my-2 border-t border-slate-800 mx-2"></div>
          
          <div className="px-4 py-2 text-xs text-slate-500 font-mono opacity-60">
             Version 1.0.0
          </div>
          
          <button onClick={() => handleToolSelect(InputMode.ABOUT)} className="w-full text-left px-4 py-3 hover:bg-slate-800 flex items-center gap-3 transition-colors text-slate-300 hover:text-white">
            <Info size={18} className="text-blue-400" /> 
            <span className="font-medium text-sm">About Calculator</span>
          </button>
          
          <button onClick={() => handleToolSelect(InputMode.PRIVACY)} className="w-full text-left px-4 py-3 hover:bg-slate-800 flex items-center gap-3 transition-colors text-slate-300 hover:text-white">
            <Shield size={18} className="text-emerald-500" /> 
            <span className="font-medium text-sm">Privacy</span>
          </button>
        </div>
      )}
    </div>
  );

  // --- Render Splash Screen if active ---
  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col md:flex-row overflow-hidden font-sans">
      
      {/* Left Sidebar (Desktop) */}
      <div className="hidden md:flex flex-col w-64 bg-slate-900 border-r border-slate-800 p-6 relative z-10 shrink-0">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/20">
            <CalcIcon className="text-white" size={24} />
          </div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">Solve AI</h1>
        </div>
        
        <div className="flex-1 overflow-y-auto scrollbar-hide">
           <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 pl-2">Input Modes</div>
           <div className="flex flex-col gap-1.5">
             <NavButton mode={InputMode.CALCULATOR} icon={CalcIcon} label="Calculator" />
             <NavButton mode={InputMode.TEXT} icon={Type} label="Text Editor" />
             <NavButton mode={InputMode.DRAW} icon={Pencil} label="Draw Problem" />
             
             <button 
                onClick={() => fileInputRef.current?.click()}
                className={`flex items-center gap-3 p-3 rounded-lg transition-colors w-full text-left ${inputMode === InputMode.IMAGE ? 'bg-slate-800 text-white border border-slate-700' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}`}
             >
                <ImageIcon size={18} className={inputMode === InputMode.IMAGE ? 'text-indigo-400' : ''} />
                <span className="font-medium">Image Upload</span>
             </button>
             <input 
               type="file" 
               ref={fileInputRef} 
               className="hidden" 
               accept="image/*"
               onChange={handleImageUpload}
             />
           </div>
        </div>
        
        <div className="pt-6 border-t border-slate-800 text-center text-slate-600 text-sm">
          Powered by Gemini 2.5 Flash
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen bg-slate-950 overflow-hidden relative">
        
        {/* Top Right Dropdown (Desktop) */}
        <div className="hidden md:block absolute top-4 right-4 z-50">
          <ToolsDropdown />
        </div>

        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between p-4 bg-slate-900 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <CalcIcon className="text-white" size={18} />
            </div>
            <span className="font-bold text-lg text-white">Solve AI</span>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Mobile Dropdown */}
            <ToolsDropdown />
          </div>
        </div>

        <Suspense fallback={
          <div className="flex-1 flex items-center justify-center bg-slate-950">
             <Loader2 className="animate-spin text-indigo-500" size={32} />
          </div>
        }>
          {/* Main View Logic */}
          {inputMode === InputMode.UNIT_CONVERTER ? (
            <div className="flex-1 h-full p-4 md:p-8 flex flex-col overflow-hidden animate-fade-in bg-slate-950 z-30">
               <UnitConverter 
                  currentTheme={currentTheme}
                  onThemeChange={handleThemeChange}
                  onBack={() => setInputMode(InputMode.CALCULATOR)} 
                />
            </div>
          ) : inputMode === InputMode.EMI_CALCULATOR ? (
             <div className="flex-1 h-full p-4 md:p-8 flex flex-col overflow-hidden animate-fade-in bg-slate-950 z-30">
                <EMICalculator currentTheme={currentTheme} onBack={() => setInputMode(InputMode.CALCULATOR)} />
             </div>
          ) : inputMode === InputMode.GST_CALCULATOR ? (
              <div className="flex-1 h-full p-4 md:p-8 flex flex-col overflow-hidden animate-fade-in bg-slate-950 z-30">
                 <GSTCalculator currentTheme={currentTheme} onBack={() => setInputMode(InputMode.CALCULATOR)} />
              </div>
          ) : inputMode === InputMode.CURRENCY_CONVERTER ? (
              <div className="flex-1 h-full p-4 md:p-8 flex flex-col overflow-hidden animate-fade-in bg-slate-950 z-30">
                 <CurrencyConverter currentTheme={currentTheme} onBack={() => setInputMode(InputMode.CALCULATOR)} />
              </div>
          ) : inputMode === InputMode.AGE_CALCULATOR ? (
              <div className="flex-1 h-full p-4 md:p-8 flex flex-col overflow-hidden animate-fade-in bg-slate-950 z-30">
                 <AgeCalculator currentTheme={currentTheme} onBack={() => setInputMode(InputMode.CALCULATOR)} />
              </div>
          ) : inputMode === InputMode.HISTORY ? (
              <div className="flex-1 h-full flex flex-col overflow-hidden animate-fade-in bg-slate-950 z-30">
                 <HistoryView 
                    messages={messages} 
                    onBack={() => setInputMode(InputMode.CALCULATOR)} 
                    onClear={() => setMessages([])}
                    currentTheme={currentTheme}
                 />
              </div>
          ) : inputMode === InputMode.ABOUT ? (
              <div className="flex-1 h-full p-4 md:p-8 flex flex-col overflow-hidden animate-fade-in bg-slate-950 z-30">
                 <AboutView onBack={() => setInputMode(InputMode.CALCULATOR)} />
              </div>
          ) : inputMode === InputMode.PRIVACY ? (
              <div className="flex-1 h-full p-4 md:p-8 flex flex-col overflow-hidden animate-fade-in bg-slate-950 z-30">
                 <PrivacyView onBack={() => setInputMode(InputMode.CALCULATOR)} />
              </div>
          ) : (
            // === Standard Math/Calculator Interface ===
            <>
              {/* Chat Area */}
              <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-2 scrollbar-hide" ref={chatContainerRef}>
                
                {messages.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-4 min-h-[40vh]">
                    <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-2 shadow-inner">
                      <CalcIcon size={32} className="text-indigo-500" />
                    </div>
                    <h2 className="text-2xl font-semibold text-slate-300">How can I help you today?</h2>
                    <p className="max-w-md text-center text-slate-400">
                      Use the calculator, voice input, or upload a problem. I'll solve it step-by-step.
                    </p>
                    <div className="flex gap-2">
                       <button onClick={() => setInputMode(InputMode.EMI_CALCULATOR)} className="px-4 py-2 bg-slate-800 rounded-full text-xs hover:bg-slate-700 transition-colors">Loan Calculator</button>
                       <button onClick={() => setInputMode(InputMode.CURRENCY_CONVERTER)} className="px-4 py-2 bg-slate-800 rounded-full text-xs hover:bg-slate-700 transition-colors">Currency</button>
                    </div>
                  </div>
                )}
                
                {messages.map(msg => (
                  <MessageBubble key={msg.id} message={msg} />
                ))}
                
                {isLoading && (
                  <div className="flex justify-start animate-pulse">
                    <div className="flex items-center gap-3 bg-slate-800 px-4 py-3 rounded-2xl rounded-tl-none">
                      <Loader2 className="animate-spin text-indigo-400" size={20} />
                      <span className="text-slate-400 text-sm">Reasoning...</span>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area (Calculator / Text) */}
              <div className="bg-slate-950/95 backdrop-blur-md border-t border-slate-800 p-4 z-20 shrink-0 transition-all duration-300 ease-in-out">
                <div className="max-w-4xl mx-auto flex flex-col gap-4">
                  
                  {/* Mode Tabs (Mobile Only) */}
                  <div className="flex md:hidden gap-2 overflow-x-auto pb-2 scrollbar-hide mask-linear-fade">
                    <button onClick={() => setInputMode(InputMode.CALCULATOR)} className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap ${inputMode === InputMode.CALCULATOR ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300'}`}>Calculator</button>
                    <button onClick={() => setInputMode(InputMode.TEXT)} className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap ${inputMode === InputMode.TEXT ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300'}`}>Text</button>
                    <button onClick={() => setInputMode(InputMode.DRAW)} className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap ${inputMode === InputMode.DRAW ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300'}`}>Draw</button>
                  </div>

                  {/* Image Preview Bubble */}
                  {selectedImage && inputMode !== InputMode.DRAW && (
                    <div className="relative inline-block w-fit animate-fade-in">
                      <img src={selectedImage} alt="Preview" className="h-20 rounded-lg border border-indigo-500/50" />
                      <button 
                        onClick={() => setSelectedImage(null)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 shadow-md"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  )}

                  {/* Calculator Interface */}
                  {inputMode === InputMode.CALCULATOR && (
                    <div className="w-full">
                      <Calculator 
                        value={inputText}
                        onChange={setInputText}
                        onSolve={() => handleSolve()}
                        currentTheme={currentTheme}
                        onThemeChange={handleThemeChange}
                        onSwitchToText={handleSwitchToText}
                      />
                    </div>
                  )}

                  {/* Drawing Interface */}
                  {inputMode === InputMode.DRAW && (
                    <div className="w-full h-64 sm:h-80">
                      <DrawingPad onSolve={(img) => handleSolve(undefined, img)} />
                    </div>
                  )}

                  {/* Text / General Input Interface */}
                  {(inputMode === InputMode.TEXT || inputMode === InputMode.IMAGE) && (
                    <div className="flex items-end gap-2 w-full">
                      <div className="flex-1 bg-slate-800 rounded-2xl border border-slate-700 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition-all flex items-center p-2 relative">
                          <button 
                            onClick={() => fileInputRef.current?.click()}
                            className="p-2 text-slate-400 hover:text-indigo-400 transition-colors"
                            title="Upload Image"
                          >
                            <ImageIcon size={20} />
                          </button>
                          <textarea
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            onKeyDown={(e) => {
                              if(e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSolve();
                              }
                            }}
                            placeholder={inputMode === InputMode.IMAGE ? "Optional: Add a question..." : isListening ? "Listening..." : "Type math or say '25 into 5'..."}
                            className="flex-1 bg-transparent border-none focus:ring-0 text-slate-100 placeholder-slate-500 resize-none max-h-32 py-2 px-2"
                            rows={1}
                            autoFocus
                          />
                          {/* Voice Button */}
                          <button
                            onClick={toggleVoiceInput}
                            className={`p-2 rounded-full transition-all ${isListening ? 'bg-red-500/20 text-red-500 animate-pulse' : 'text-slate-400 hover:text-white'}`}
                            title="Voice Input"
                          >
                             {isListening ? <MicOff size={20} /> : <Mic size={20} />}
                          </button>
                      </div>
                      <div className="flex flex-col gap-2">
                        <button 
                          onClick={() => handleSolve()}
                          disabled={isLoading || (!inputText && !selectedImage)}
                          className="p-3 rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-indigo-600/20"
                        >
                          {isLoading ? <Loader2 className="animate-spin" size={24} /> : <Send size={24} />}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </Suspense>
      </div>
    </div>
  );
}
export default App;
