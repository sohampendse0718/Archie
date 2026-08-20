"use client";

import { SendHorizontal } from 'lucide-react';
import { useRef, useEffect } from 'react';

export default function CommandBar() {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      // Restrict max height to 200px, otherwise allow scroll
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  };

  useEffect(() => {
    adjustHeight();
  }, []);

  return (
    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-full max-w-2xl z-20 px-4">
      <div className="bg-zinc-900/80 backdrop-blur-md border border-zinc-800 rounded-2xl p-2 shadow-2xl flex items-end gap-2 focus-within:border-zinc-700/80 transition-colors">
        <textarea
          ref={textareaRef}
          onChange={adjustHeight}
          placeholder="Design a microservices backend..."
          className="w-full bg-transparent text-zinc-100 placeholder:text-zinc-500 resize-none outline-none py-3 px-4 min-h-[48px] max-h-[200px] overflow-y-auto leading-relaxed [&::-webkit-scrollbar]:hidden"
          rows={1}
          style={{ scrollbarWidth: 'none' }}
        />
        <button 
          className="p-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-lg hover:shadow-[0_0_15px_rgba(79,70,229,0.5)] transition-all shrink-0 flex items-center justify-center mb-0.5 mr-0.5 group"
          title="Generate"
        >
          <SendHorizontal className="w-5 h-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </button>
      </div>
    </div>
  );
}
