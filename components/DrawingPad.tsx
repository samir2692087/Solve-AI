import React, { useRef, useState, useEffect } from 'react';
import { Eraser, Pen, RotateCcw, Trash2, Check } from 'lucide-react';

interface DrawingPadProps {
  onSolve: (imageData: string) => void;
}

type Tool = 'pen' | 'eraser';

interface Point {
  x: number;
  y: number;
}

interface Stroke {
  points: Point[];
  tool: Tool;
  color: string;
  size: number;
}

export const DrawingPad: React.FC<DrawingPadProps> = ({ onSolve }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<Tool>('pen');
  const [history, setHistory] = useState<Stroke[]>([]);
  const [currentStroke, setCurrentStroke] = useState<Stroke | null>(null);

  // Configuration
  const strokeColor = '#ffffff';
  const penSize = 3;
  const eraserSize = 20;
  const bgColor = '#0f172a'; // slate-900

  // Initialize Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const resizeCanvas = () => {
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      redraw(history);
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    return () => window.removeEventListener('resize', resizeCanvas);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Redraw function for history/undo
  const redraw = (strokes: Stroke[]) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    // Clear and Fill Background
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw Grid Lines (Chalkboard effect)
    drawGrid(ctx, canvas.width, canvas.height);

    strokes.forEach(stroke => {
      drawStroke(ctx, stroke);
    });
  };

  const drawGrid = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
    ctx.strokeStyle = '#1e293b'; // slate-800
    ctx.lineWidth = 1;
    ctx.beginPath();
    const gridSize = 40;
    for (let x = 0; x <= w; x += gridSize) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
    }
    for (let y = 0; y <= h; y += gridSize) {
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
    }
    ctx.stroke();
  };

  const drawStroke = (ctx: CanvasRenderingContext2D, stroke: Stroke) => {
    if (stroke.points.length < 2) return;

    ctx.beginPath();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = stroke.size;
    ctx.strokeStyle = stroke.tool === 'eraser' ? bgColor : stroke.color;

    ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
    for (let i = 1; i < stroke.points.length; i++) {
      ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
    }
    ctx.stroke();
  };

  const getCoordinates = (event: React.MouseEvent | React.TouchEvent): Point | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    
    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;

    if ('touches' in event) {
      clientX = event.touches[0].clientX;
      clientY = event.touches[0].clientY;
    } else {
      clientX = (event as React.MouseEvent).clientX;
      clientY = (event as React.MouseEvent).clientY;
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault(); // Prevent scrolling on touch
    const coords = getCoordinates(e);
    if (!coords) return;

    setIsDrawing(true);
    const newStroke: Stroke = {
      points: [coords],
      tool: tool,
      color: strokeColor,
      size: tool === 'eraser' ? eraserSize : penSize
    };
    setCurrentStroke(newStroke);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!isDrawing || !currentStroke) return;

    const coords = getCoordinates(e);
    if (!coords) return;

    const updatedStroke = {
      ...currentStroke,
      points: [...currentStroke.points, coords]
    };
    setCurrentStroke(updatedStroke);

    // Direct draw for performance (instead of full redraw)
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (ctx) {
       drawStroke(ctx, { ...updatedStroke, points: updatedStroke.points.slice(-2) });
    }
  };

  const stopDrawing = () => {
    if (!isDrawing || !currentStroke) return;
    
    setIsDrawing(false);
    const newHistory = [...history, currentStroke];
    setHistory(newHistory);
    setCurrentStroke(null);
    redraw(newHistory); // Ensure clean render
  };

  const handleUndo = () => {
    const newHistory = history.slice(0, -1);
    setHistory(newHistory);
    redraw(newHistory);
  };

  const handleClear = () => {
    setHistory([]);
    redraw([]);
  };

  const handleSubmit = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
      onSolve(dataUrl);
    }
  };

  // Initial render
  useEffect(() => {
      redraw([]);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden">
      {/* Toolbar */}
      <div className="bg-[#1a1f2c] p-3 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex bg-slate-800 p-1 rounded-lg border border-slate-700">
            <button
              onClick={() => setTool('pen')}
              className={`p-2 rounded-md transition-all ${tool === 'pen' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
              title="Pen"
            >
              <Pen size={18} />
            </button>
            <button
              onClick={() => setTool('eraser')}
              className={`p-2 rounded-md transition-all ${tool === 'eraser' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
              title="Eraser"
            >
              <Eraser size={18} />
            </button>
          </div>
          
          <div className="w-[1px] h-8 bg-slate-700 mx-2"></div>

          <button
            onClick={handleUndo}
            className="p-2 text-slate-400 hover:text-white bg-slate-800 rounded-lg border border-slate-700 hover:bg-slate-700 transition-colors"
            title="Undo"
          >
            <RotateCcw size={18} />
          </button>
          <button
            onClick={handleClear}
            className="p-2 text-red-400 hover:text-red-200 bg-slate-800 rounded-lg border border-slate-700 hover:bg-red-900/30 transition-colors"
            title="Clear All"
          >
            <Trash2 size={18} />
          </button>
        </div>

        <div className="flex items-center gap-2">
           <div className="hidden sm:block text-xs text-slate-500 font-medium uppercase tracking-widest mr-2">
              Drawing Mode
           </div>
           <button 
             onClick={handleSubmit}
             disabled={history.length === 0}
             className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-lg shadow-lg shadow-indigo-600/20 transition-all active:scale-95"
           >
             <Check size={18} />
             <span>SOLVE</span>
           </button>
        </div>
      </div>

      {/* Canvas Area */}
      <div 
        ref={containerRef} 
        className="flex-1 relative bg-slate-950 touch-none cursor-crosshair overflow-hidden"
      >
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="absolute top-0 left-0 w-full h-full"
        />
        
        {history.length === 0 && !isDrawing && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-30">
            <div className="text-center">
               <Pen size={48} className="mx-auto mb-2 text-slate-500" />
               <p className="text-slate-500 font-handwriting text-lg">Draw your math problem here</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};