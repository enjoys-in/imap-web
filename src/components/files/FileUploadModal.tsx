'use client';

import React, { useState } from 'react';
import { X, UploadCloud, File, CheckCircle2 } from 'lucide-react';
import { StorageFile } from './useFilesState';

interface FileUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (name: string, type: StorageFile['type'], size: string) => void;
}

export function FileUploadModal({ isOpen, onClose, onUpload }: FileUploadModalProps) {
  const [selectedFileName, setSelectedFileName] = useState('');
  const [fileType, setFileType] = useState<StorageFile['type']>('pdf');
  const [fileSize, setFileSize] = useState('1.5 MB');
  const [isUploading, setIsUploading] = useState(false);

  if (!isOpen) return null;

  const handleSimulatedUpload = (e: React.FormEvent) => {
    e.preventDefault();
    const name = selectedFileName.trim() || 'Uploaded_Document.pdf';
    setIsUploading(true);
    setTimeout(() => {
      onUpload(name, fileType, fileSize);
      setIsUploading(false);
      setSelectedFileName('');
    }, 400);
  };

  const handlePreset = (name: string, type: StorageFile['type'], size: string) => {
    setSelectedFileName(name);
    setFileType(type);
    setFileSize(size);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs select-none">
      <div className="w-full max-w-md bg-white dark:bg-[#202020] rounded-2xl shadow-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[#0078d4]/10 text-[#0078d4]">
              <UploadCloud className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-neutral-900 dark:text-white">Upload to Cloud Storage</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSimulatedUpload} className="p-5 space-y-4">
          <div className="border-2 border-dashed border-neutral-300 dark:border-neutral-700 rounded-xl p-6 text-center hover:border-[#0078d4] dark:hover:border-[#0078d4] transition-colors bg-neutral-50/50 dark:bg-[#1a1a1a]">
            <UploadCloud className="w-10 h-10 mx-auto text-[#0078d4] mb-2" />
            <p className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
              Drag and drop files here, or browse
            </p>
            <p className="text-[11px] text-neutral-400 mt-1">
              Supports PDF, Office documents, Images, and Archives up to 50MB
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
              File Name
            </label>
            <input
              type="text"
              value={selectedFileName}
              onChange={(e) => setSelectedFileName(e.target.value)}
              placeholder="e.g. Q4_Strategy_Presentation.pdf"
              className="w-full text-xs px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-[#1a1a1a] text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0078d4]"
            />
          </div>

          {/* Quick presets */}
          <div>
            <span className="text-[11px] font-semibold text-neutral-400 block mb-1.5">Quick Samples:</span>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => handlePreset('Client_Proposal_2026.pdf', 'pdf', '3.2 MB')}
                className="px-2 py-1 rounded bg-neutral-100 dark:bg-neutral-800 text-[10px] text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 cursor-pointer"
              >
                + Client Proposal (PDF)
              </button>
              <button
                type="button"
                onClick={() => handlePreset('Monthly_Revenue_Sheet.xlsx', 'spreadsheet', '840 KB')}
                className="px-2 py-1 rounded bg-neutral-100 dark:bg-neutral-800 text-[10px] text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 cursor-pointer"
              >
                + Revenue Sheet (Excel)
              </button>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-200 dark:border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUploading}
              className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-[#0078d4] text-white hover:bg-[#106ebe] transition-colors shadow-xs cursor-pointer"
            >
              {isUploading ? 'Uploading...' : 'Upload Now'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
