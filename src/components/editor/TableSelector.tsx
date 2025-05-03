import React, { useState } from 'react';

interface TableSelectorProps {
  position: { x: number; y: number };
  onSelect: (rows: number, cols: number) => void;
  onClose: () => void;
}

export function TableSelector({ position, onSelect, onClose }: TableSelectorProps) {
  const [hoveredCells, setHoveredCells] = useState({ rows: 0, cols: 0 });
  const maxRows = 8;
  const maxCols = 8;

  return (
    <div
      className="absolute z-50 bg-white rounded-lg shadow-xl border p-2"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    >
      <div className="p-2 text-sm text-gray-600 mb-2">
        {hoveredCells.rows > 0 && hoveredCells.cols > 0
          ? `${hoveredCells.rows} × ${hoveredCells.cols} table`
          : 'Hover to select table size'}
      </div>
      <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${maxCols}, 1fr)` }}>
        {Array.from({ length: maxRows * maxCols }).map((_, index) => {
          const row = Math.floor(index / maxCols) + 1;
          const col = (index % maxCols) + 1;
          return (
            <div
              key={index}
              className="w-6 h-6 border rounded transition-colors"
              style={{
                backgroundColor:
                  row <= hoveredCells.rows && col <= hoveredCells.cols
                    ? '#e2e8f0'
                    : 'transparent',
              }}
              onMouseEnter={() => setHoveredCells({ rows: row, cols: col })}
              onBlur={() => {
                onSelect(row, col);
                onClose();
              }}
              onClick={() => {
                onSelect(row, col);
                onClose();
              }}
            />
          );
        })}
      </div>
    </div>
  );
}