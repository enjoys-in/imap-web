import React, { useState } from 'react';
import { X } from 'lucide-react';

interface AIPromptProps {
  onClose: () => void;
  onSubmit: (prompt: string) => void;
}

export function AIPrompt({ onClose, onSubmit }: AIPromptProps) {
  const [prompt, setPrompt] = useState('');

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center animate-fade-in">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg m-4 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">AI Assistant</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Enter your prompt here..."
            className="w-full h-32 p-2 border rounded resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex justify-end mt-4">
            <button
              onClick={() => onSubmit(prompt)}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Generate
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}