import React, { useState } from 'react';
import { X } from 'lucide-react';

interface LinkDialogProps {
  position: { x: number; y: number };
  onSubmit: (url: string) => void;
  onClose: () => void;
}

export function LinkDialog({ position, onSubmit, onClose }: LinkDialogProps) {
  const [url, setUrl] = useState('');

  return (
    <div
      className="absolute z-50 bg-white rounded-lg shadow-xl border p-4 min-w-[300px]"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Insert Link</h3>
        <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
          <X className="w-5 h-5" />
        </button>
      </div>
      <input
        type="url"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="Enter URL"
        className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        autoFocus
      />
      <div className="flex justify-end mt-4 gap-2">
        <button
          onClick={onClose}
          className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
        >
          Cancel
        </button>
        <button
          onClick={() => {
            if (url.trim()) {
              onSubmit(url);
              onClose();
            }
          }}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Insert
        </button>
      </div>
    </div>
  );
}