
import React, { Suspense } from 'react';
import { Message } from '../types';
import { User, Bot, AlertCircle, Sparkles, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import remarkGfm from 'remark-gfm';
import { MathDisplay } from './MathDisplay';

// Lazy load graph because function-plot is a heavy library
const Graph = React.lazy(() => import('./Graph').then(module => ({ default: module.Graph })));

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === 'user';

  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} mb-6 animate-fade-in-up`}>
      <div className={`flex max-w-[95%] md:max-w-[85%] gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        
        {/* Avatar */}
        <div className={`
          flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-1 shadow-lg
          ${isUser ? 'bg-indigo-600' : message.isError ? 'bg-red-500' : 'bg-gradient-to-br from-emerald-500 to-emerald-700'}
        `}>
          {isUser ? <User size={16} className="text-white" /> : message.isError ? <AlertCircle size={16} className="text-white"/> : <Bot size={16} className="text-white" />}
        </div>

        {/* Content */}
        <div className={`
          flex flex-col gap-2 rounded-2xl p-5 shadow-xl overflow-hidden w-full
          ${isUser 
            ? 'bg-indigo-900/40 border border-indigo-500/30 text-indigo-50 rounded-tr-none backdrop-blur-sm' 
            : message.isError 
              ? 'bg-red-900/20 border border-red-500/30 text-red-100 rounded-tl-none'
              : 'bg-slate-800/90 border border-slate-700 text-slate-100 rounded-tl-none backdrop-blur-sm'}
        `}>
          {/* Image Preview for User */}
          {message.image && (
            <div className="mb-3 rounded-lg overflow-hidden border border-slate-600/50 bg-black/50">
              <img src={message.image} alt="Problem input" className="max-w-full h-auto max-h-64 object-contain mx-auto" />
            </div>
          )}
          
          {/* Message Content */}
          <div className={`
            prose prose-invert prose-sm sm:prose-base max-w-none 
            prose-p:leading-relaxed prose-strong:text-indigo-300 
            prose-a:text-indigo-400 
            ${!isUser ? 'math-response' : ''}
          `}>
            {isUser ? (
              <div className="text-lg md:text-xl font-medium tracking-wide">
                 <MathDisplay text={message.content} />
              </div>
            ) : (
              <>
                <ReactMarkdown
                  remarkPlugins={[remarkMath, remarkGfm]}
                  rehypePlugins={[rehypeKatex]}
                  components={{
                    p: ({node, ...props}) => <p className={`mb-3 last:mb-0 text-slate-200`} {...props} />,
                    h3: ({node, ...props}) => (
                      <h3 className="text-lg font-semibold text-emerald-400 mt-6 mb-3 flex items-center gap-2 border-b border-emerald-900/50 pb-1" {...props}>
                        <Sparkles size={16} className="text-emerald-500" />
                        {props.children}
                      </h3>
                    ),
                    blockquote: ({node, ...props}) => (
                      <blockquote className="border-l-4 border-indigo-500 bg-slate-900/50 rounded-r-lg py-2 px-4 my-4 text-slate-300 not-italic" {...props} />
                    ),
                    ul: ({node, ...props}) => <ul className="list-disc pl-5 space-y-1 my-2 text-slate-300" {...props} />,
                    ol: ({node, ...props}) => <ol className="list-decimal pl-5 space-y-1 my-2 text-slate-300" {...props} />,
                  }}
                >
                  {message.content}
                </ReactMarkdown>

                {/* Render Graph if data is present */}
                {message.graphData && (
                  <Suspense fallback={
                    <div className="w-full h-48 bg-slate-900/50 flex items-center justify-center rounded-xl border border-slate-800">
                      <Loader2 className="animate-spin text-indigo-500" />
                    </div>
                  }>
                    <Graph data={message.graphData} />
                  </Suspense>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
