
import React, { useRef } from 'react';
import { Message, ThemeId } from '../types';
import { ArrowLeft, Download, Trash2, FileText, Calendar } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

interface HistoryViewProps {
  messages: Message[];
  onBack: () => void;
  onClear: () => void;
  currentTheme: ThemeId;
}

export const HistoryView: React.FC<HistoryViewProps> = ({ messages, onBack, onClear }) => {
  const reportRef = useRef<HTMLDivElement>(null);

  const handleExportPDF = async () => {
    if (!reportRef.current || !window.html2canvas || !window.jspdf) {
        alert("PDF tools are initializing. Please try again in a moment.");
        return;
    }

    try {
        const { jsPDF } = window.jspdf;
        // High scale for better quality
        const canvas = await window.html2canvas(reportRef.current, {
            scale: 2,
            backgroundColor: '#ffffff', // Force white background for PDF
            useCORS: true
        });

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;
        const ratio = pdfWidth / imgWidth;
        const printHeight = imgHeight * ratio;

        let heightLeft = printHeight;
        let position = 0;

        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, printHeight);
        heightLeft -= pdfHeight;

        while (heightLeft >= 0) {
            position = heightLeft - printHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, printHeight);
            heightLeft -= pdfHeight;
        }

        pdf.save(`solve-ai-report-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
        console.error("PDF Export Error:", error);
        alert("Failed to generate PDF.");
    }
  };

  // Filter out non-content messages or just group them?
  // We want User Question followed by Model Answer.
  const historyItems = [];
  for (let i = 0; i < messages.length; i++) {
    if (messages[i].role === 'user') {
      const question = messages[i];
      const answer = messages[i+1]?.role === 'model' ? messages[i+1] : null;
      historyItems.push({ question, answer });
    }
  }

  return (
    <div className="flex flex-col h-full bg-slate-950">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-900 pr-24 md:pr-32 transition-all">
        <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors border border-slate-700">
                <ArrowLeft size={20} className="text-slate-400" />
            </button>
            <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <FileText className="text-indigo-400" />
                    Calculation History
                </h2>
                <p className="text-slate-400 text-sm">Review and export your past calculations</p>
            </div>
        </div>
        <div className="flex gap-2">
            {messages.length > 0 && (
                <>
                    <button 
                        onClick={onClear} 
                        className="flex items-center gap-2 px-3 py-2 bg-red-900/20 text-red-400 hover:bg-red-900/40 rounded-lg transition-colors border border-red-900/50"
                        title="Clear History"
                    >
                        <Trash2 size={16} />
                        <span className="hidden sm:inline">Clear</span>
                    </button>
                    <button 
                        onClick={handleExportPDF} 
                        className="flex items-center gap-2 px-3 py-2 bg-indigo-600 text-white hover:bg-indigo-500 rounded-lg transition-colors shadow-lg shadow-indigo-600/20"
                        title="Export PDF"
                    >
                        <Download size={16} />
                        <span className="hidden sm:inline">PDF</span>
                    </button>
                </>
            )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-950">
        {historyItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 opacity-50">
                <FileText size={48} className="mb-4" />
                <p>No calculations history found.</p>
            </div>
        ) : (
            <>
                {/* Visual List for UI */}
                <div className="max-w-4xl mx-auto space-y-6">
                    {historyItems.map((item, idx) => (
                        <div key={idx} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
                            {/* Question Header */}
                            <div className="bg-slate-800/50 p-4 border-b border-slate-800 flex justify-between items-start">
                                <div>
                                    <div className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-1">Question</div>
                                    <div className="text-white font-medium text-lg">{item.question.content}</div>
                                    {item.question.image && (
                                        <img src={item.question.image} alt="Input" className="mt-2 h-16 rounded border border-slate-700" />
                                    )}
                                </div>
                                <div className="text-slate-500 text-xs flex items-center gap-1">
                                    <Calendar size={12} />
                                    {new Date(item.question.timestamp).toLocaleDateString()}
                                </div>
                            </div>
                            
                            {/* Answer Body */}
                            <div className="p-4 bg-slate-900/50">
                                <div className="text-xs font-bold text-emerald-500 uppercase tracking-wider mb-2">Solution</div>
                                <div className="prose prose-invert prose-sm max-w-none text-slate-300">
                                    {item.answer ? (
                                        <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                                            {item.answer.content}
                                        </ReactMarkdown>
                                    ) : (
                                        <span className="italic text-slate-600">No solution generated.</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* HIDDEN PRINT CONTAINER (Optimized for PDF) */}
                <div className="absolute top-0 left-[-9999px] w-[800px]" ref={reportRef}>
                    <div className="bg-white text-black p-10 font-sans">
                        <div className="border-b-2 border-indigo-600 pb-6 mb-8 flex justify-between items-center">
                            <div>
                                <h1 className="text-3xl font-bold text-slate-900">Solve AI Report</h1>
                                <p className="text-slate-500 mt-1">Generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}</p>
                            </div>
                            <div className="text-right">
                                <div className="bg-indigo-600 text-white px-3 py-1 rounded text-sm font-bold">AI SOLVER</div>
                            </div>
                        </div>

                        <div className="space-y-8">
                            {historyItems.map((item, idx) => (
                                <div key={idx} className="border border-slate-200 rounded-lg p-6 bg-slate-50 break-inside-avoid">
                                    <div className="mb-4 pb-4 border-b border-slate-200">
                                        <div className="text-xs font-bold text-indigo-600 uppercase mb-1">Problem</div>
                                        <div className="text-lg font-medium text-slate-900">{item.question.content}</div>
                                        {item.question.image && (
                                            <div className="mt-2 p-2 border border-slate-200 inline-block bg-white rounded">
                                                <img src={item.question.image} alt="Problem Reference" className="h-32 object-contain" />
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <div className="text-xs font-bold text-emerald-600 uppercase mb-2">Solution</div>
                                        <div className="text-slate-800 text-sm leading-relaxed prose prose-slate max-w-none">
                                            {/* Render simplified content for PDF to avoid complex layout issues */}
                                            <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]} 
                                              components={{
                                                p: ({node, ...props}) => <p className="mb-2" {...props} />,
                                                h3: ({node, ...props}) => <h3 className="text-base font-bold mt-4 mb-2 text-slate-900" {...props} />,
                                                code: ({node, ...props}) => <code className="bg-slate-100 px-1 py-0.5 rounded text-indigo-700 font-mono text-xs" {...props} />
                                              }}
                                            >
                                                {item.answer?.content || "No solution."}
                                            </ReactMarkdown>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-12 pt-6 border-t border-slate-200 text-center text-slate-400 text-xs">
                            <p>Generated by Solve AI • www.solve-ai.app</p>
                        </div>
                    </div>
                </div>
            </>
        )}
      </div>
    </div>
  );
};
