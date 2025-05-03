import React from 'react';
import { Bot } from 'lucide-react';

interface AIAssistantProps {
  position: { x: number; y: number };
  onPrompt: () => void;
}

export function AIAssistant({ position, onPrompt }: AIAssistantProps) {
  return (
    <div
      className="absolute z-40 opacity-50 hover:opacity-100 transition-opacity"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    >
      <button
        onClick={onPrompt}
        className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-50 transition-colors"
        title="Get AI assistance"
      >
        <Bot className="w-5 h-5" />
      </button>
    </div>
  );
}