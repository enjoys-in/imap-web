import React from 'react';
import { X } from 'lucide-react';

const specialChars = [
  '©', '®', '™', '€', '£', '¥', '¢', '§', '¶', '†', '‡', '°', '±', '¼', '½', '¾',
  '×', '÷', '≠', '≈', '≤', '≥', '∞', '∑', '∏', '∆', '√', '∫', '≡', '≪', '≫', '⌘',
  '←', '→', '↑', '↓', '↔', '↕', '⇄', '⇅', '⇆', '⇇', '⇈', '⇉', '⇊',
  'α', 'β', 'γ', 'δ', 'ε', 'ζ', 'η', 'θ', 'ι', 'κ', 'λ', 'μ', 'ν', 'ξ', 'ο', 'π',
];

interface SpecialCharactersProps {
  onClose: () => void;
  onSelect: (char: string) => void;
}

export function SpecialCharacters({ onClose, onSelect }: SpecialCharactersProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center animate-fade-in">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg m-4">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Special Characters</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4 grid grid-cols-8 gap-2">
          {specialChars.map((char) => (
            <button
              key={char}
              onClick={() => {
                onSelect(char);
                onClose();
              }}
              className="w-10 h-10 flex items-center justify-center border rounded hover:bg-gray-100 transition-colors"
            >
              {char}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}