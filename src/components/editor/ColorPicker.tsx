import React, { useEffect, useRef } from 'react';

const colors = [
  // Grayscale
  '#000000', '#333333', '#666666', '#999999', '#CCCCCC', '#FFFFFF',
  // Primary Colors
  '#FF0000', '#00FF00', '#0000FF',
  // Secondary Colors
  '#FFFF00', '#FF00FF', '#00FFFF',
  // Common Web Colors
  '#FF4444', '#44FF44', '#4444FF',
  '#FFFF44', '#FF44FF', '#44FFFF',
  // Pastels
  '#FFB6C1', '#98FB98', '#87CEEB',
  '#DDA0DD', '#F0E68C', '#E6E6FA',
  // Rich Colors
  '#800000', '#008000', '#000080',
  '#808000', '#800080', '#008080',
  // Modern Web Colors
  '#1abc9c', '#2ecc71', '#3498db',
  '#9b59b6', '#34495e', '#16a085',
  '#27ae60', '#2980b9', '#8e44ad',
  '#2c3e50', '#f1c40f', '#e67e22',
  '#e74c3c', '#ecf0f1', '#95a5a6',
  '#f39c12', '#d35400', '#c0392b',
  '#bdc3c7', '#7f8c8d'
];

interface ColorPickerProps {
  position: { x: number; y: number };
  onSelect: (color: string) => void;
  onClose: () => void;
}

export function ColorPicker({ position, onSelect, onClose }: ColorPickerProps) {
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return (
    <div
      ref={pickerRef}
      className="absolute z-50 bg-white rounded-lg shadow-xl border p-2"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    >
      <div className="grid grid-cols-6 gap-1">
        {colors.map((color) => (
          <button
            key={color}
            onClick={() => onSelect(color)}
            className="w-6 h-6 rounded hover:scale-110 transition-transform"
            style={{ backgroundColor: color }}
            title={color}
          />
        ))}
      </div>
    </div>
  );
}