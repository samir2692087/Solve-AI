import React from 'react';

interface MathDisplayProps {
  text: string;
  className?: string;
}

export const MathDisplay: React.FC<MathDisplayProps> = ({ text, className = "" }) => {
  if (!text) return null;

  const parts: React.ReactNode[] = [];
  let i = 0;
  
  while (i < text.length) {
    // Superscript detection: ^2, ^(3), ^x
    if (text[i] === '^') {
      i++;
      let content = "";
      if (i < text.length && text[i] === '(') {
        // Grouped superscript: ^(x+1)
        let depth = 1;
        let j = i + 1;
        while (j < text.length && depth > 0) {
          if (text[j] === '(') depth++;
          if (text[j] === ')') depth--;
          if (depth === 0) break;
          j++;
        }
        content = text.slice(i+1, j);
        i = j + 1;
      } else {
         // Simple superscript: ^2, ^x, ^-1
         let j = i;
         if (text[j] === '-') j++; // handle negative exponent start
         while (j < text.length && /[a-zA-Z0-9.]/.test(text[j])) j++;
         content = text.slice(i, j);
         i = j;
      }
      parts.push(<sup key={`sup-${i}`} className="text-[0.6em] text-indigo-300 align-top mx-[0.5px]">{content}</sup>);
      continue;
    }
    
    // Subscript detection: log_b, _x
    if (text[i] === '_') {
       i++;
       let content = "";
       if (i < text.length && text[i] === '{') {
          // Grouped subscript: _{10}
          let j = i + 1;
          while (j < text.length && text[j] !== '}') j++;
          content = text.slice(i+1, j);
          i = j + 1;
       } else {
          let j = i;
          while (j < text.length && /[a-zA-Z0-9]/.test(text[j])) j++;
          content = text.slice(i, j);
          i = j;
       }
       parts.push(<sub key={`sub-${i}`} className="text-[0.6em] text-slate-400 align-baseline mx-[0.5px]">{content}</sub>);
       continue;
    }

    // Special symbol styling
    if (/[xyz]/.test(text[i])) {
        parts.push(<span key={i} className="font-serif italic font-bold mx-[1px]">{text[i]}</span>);
        i++;
        continue;
    }
    
    if (['√', '∫', 'π', '∞', 'Σ'].includes(text[i])) {
        parts.push(<span key={i} className="font-serif text-indigo-200 mx-[1px]">{text[i]}</span>);
        i++;
        continue;
    }

    parts.push(<span key={i}>{text[i]}</span>);
    i++;
  }
  return <span className={`inline-block whitespace-pre-wrap break-words break-all ${className}`}>{parts}</span>;
};