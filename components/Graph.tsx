
import React, { useEffect, useRef } from 'react';
import functionPlot from 'function-plot';
import { GraphData } from '../types';

interface GraphProps {
  data: GraphData;
}

// Helper to clean LaTeX style formatting and enforce explicit JS math syntax
const cleanEquation = (eq: string): string => {
  if (!eq) return '';
  
  let cleaned = eq;

  // 1. Remove specific LaTeX commands mapping to JS Math
  cleaned = cleaned
    .replace(/\\sin/g, 'sin')
    .replace(/\\cos/g, 'cos')
    .replace(/\\tan/g, 'tan')
    .replace(/\\sec/g, 'sec')
    .replace(/\\csc/g, 'csc')
    .replace(/\\cot/g, 'cot')
    .replace(/\\ln/g, 'ln')
    .replace(/\\log/g, 'log')
    .replace(/\\exp/g, 'exp')
    .replace(/\\sqrt/g, 'sqrt')
    .replace(/\\pi/g, 'PI')
    .replace(/\\theta/g, 'theta');

  // 2. Remove LaTeX formatting characters
  cleaned = cleaned
    .replace(/\\left/g, '')
    .replace(/\\right/g, '')
    .replace(/\\cdot/g, '*')
    .replace(/\\/g, '') // Remove remaining backslashes
    .replace(/\^\{([0-9.]+)\}/g, '^$1') // Simple powers: x^{2} -> x^2
    .replace(/\^\{([^}]+)\}/g, '^($1)') // Complex powers: x^{2y} -> x^(2y)
    .replace(/\{/g, '(') // converting any remaining curly braces to parens
    .replace(/\}/g, ')')
    .replace(/\s/g, ''); // Remove all spaces

  // 3. Enforce Explicit Multiplication (Critical for parsers)
  // Case: Number followed by variable or open paren: 2x -> 2*x, 2( -> 2*(
  cleaned = cleaned.replace(/(\d)([a-zA-Z(])/g, '$1*$2');
  
  // Case: Closed paren followed by number or variable or open paren: )x -> )*x, )2 -> )*2, )( -> )*(
  cleaned = cleaned.replace(/\)([\w(])/g, ')*$1');

  // Case: Variable followed by number (unlikely in math but safe to handle): x2 -> x*2
  // Note: we avoid replacing inside words, but single char vars are common.
  // Use caution with this one.

  // Case: Specific variable multiplication
  // xy -> x*y, yx -> y*x. 
  // We only do this for isolated x and y to avoid breaking function names like 'exp' or 'max'
  // However, function-plot is smart enough for 'x' and 'y'. 
  // We will assume the AI sends explicit * for complex variable interactions as per instructions.

  return cleaned;
};

export const Graph: React.FC<GraphProps> = ({ data }) => {
  const rootEl = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<any>(null);

  useEffect(() => {
    if (!rootEl.current || !data) return;

    try {
      const width = rootEl.current.clientWidth || 350; // Fallback width
      const height = Math.min(width * 0.85, 450);

      // Clean up previous instance
      rootEl.current.innerHTML = '';

      // Prepare function definitions
      const functionData = data.functions.map((fn, index) => {
        const cleanedFn = cleanEquation(fn);
        // Detect if the function is implicit (contains '=' or '<', '>')
        const isImplicit = /[=<>]=?/.test(cleanedFn);
        
        // Construct the datum object dynamically
        const datum: any = {
          fn: cleanedFn, 
          // For implicit equations, use 'implicit'. For standard y=... use 'linear'
          fnType: isImplicit ? 'implicit' : 'linear',
          color: index === 0 ? '#818cf8' : index === 1 ? '#34d399' : '#f472b6', // Indigo-400, Emerald-400, Pink-400
          nSamples: 1500, // High resolution
          closed: false, // Important for some implicit shapes
          skipTip: false 
        };

        // Explicitly set graphType to avoid undefined access errors in library
        if (isImplicit) {
            datum.graphType = 'interval';
        } else {
            datum.graphType = 'polyline';
        }

        return datum;
      });

      // Prepare point definitions (intersections, etc)
      if (data.points && data.points.length > 0) {
        functionData.push({
          points: data.points.map(p => [p.x, p.y]),
          fnType: 'points',
          graphType: 'scatter',
          color: '#fb7185', // Rose-400
          attr: {
            r: 5,
            fill: '#fb7185'
          }
        } as any);
      }

      chartInstance.current = functionPlot({
        target: rootEl.current,
        width,
        height,
        grid: true,
        data: functionData,
        xAxis: { 
          domain: data.xDomain || [-10, 10],
          label: 'x'
        },
        yAxis: { 
          domain: data.yDomain || [-10, 10],
          label: 'y'
        },
        tip: {
          xLine: true,
          yLine: true,
          renderer: (x: number, y: number) => {
             return `(${x.toFixed(2)}, ${y.toFixed(2)})`
          }
        }
      });

    } catch (e) {
      console.error("Failed to render graph", e);
      if (rootEl.current) {
        rootEl.current.innerHTML = `<div class="text-red-400 text-xs p-4 text-center">Error rendering graph: ${(e as Error).message}</div>`;
      }
    }
  }, [data]);

  return (
    <div className="w-full p-4 bg-slate-900 rounded-xl border border-slate-800 my-4 flex flex-col items-center shadow-inner relative overflow-hidden">
      
      {/* CSS Override for Dark Mode Graph */}
      <style>{`
        .function-plot text {
          fill: #cbd5e1 !important; /* slate-300 */
          font-family: 'Inter', sans-serif !important;
          font-size: 10px !important;
        }
        .function-plot .domain {
          stroke: #64748b !important; /* slate-500 */
          stroke-width: 2px !important;
        }
        .function-plot .tick line {
          stroke: #334155 !important; /* slate-700 */
        }
        .function-plot .origin {
          stroke: #94a3b8 !important; /* slate-400 */
          opacity: 0.8 !important;
        }
        .function-plot .gridline {
          stroke: #1e293b !important; /* slate-800 */
          opacity: 0.5 !important;
        }
        .function-plot path {
           stroke-width: 2px;
           opacity: 0.9;
        }
        .function-plot .tip {
           background: #0f172a !important;
           border: 1px solid #334155 !important;
           color: #f1f5f9 !important;
           padding: 4px 8px !important;
           border-radius: 4px !important;
           font-size: 10px !important;
        }
      `}</style>

      <h4 className="text-slate-400 text-xs font-bold mb-4 self-start uppercase tracking-widest flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
        Visual Representation
      </h4>
      
      <div ref={rootEl} className="w-full flex justify-center graph-container" />
      
      {/* Legend / Points */}
      {data.points && data.points.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-4 w-full border-t border-slate-800 pt-3">
          {data.points.map((p, i) => (
            <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/50 border border-slate-700/50 rounded-lg text-xs">
               <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
               <span className="text-slate-400 font-medium">{p.label || 'Point'}:</span>
               <span className="text-slate-200 font-mono">({p.x.toFixed(2)}, {p.y.toFixed(2)})</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
