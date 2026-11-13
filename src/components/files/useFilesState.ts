'use client';

import { useState } from 'react';

export type FileCategory = 'all' | 'attachments' | 'recent' | 'shared' | 'starred' | 'trash';
export type FileType = 'all' | 'pdf' | 'doc' | 'spreadsheet' | 'image' | 'archive';

export interface StorageFolder {
  id: string;
  name: string;
  fileCount: number;
  updatedAt: string;
  isFavorite?: boolean;
}

export interface StorageFile {
  id: string;
  name: string;
  folderId?: string;
  type: 'pdf' | 'doc' | 'spreadsheet' | 'image' | 'archive';
  size: string;
  sizeBytes: number;
  updatedAt: string;
  isStarred: boolean;
  isEmailAttachment?: boolean;
  emailSubject?: string;
  sender?: string;
}

const INITIAL_FOLDERS: StorageFolder[] = [
  { id: 'fld-design', name: 'Design Assets & UI', fileCount: 18, updatedAt: '2 hours ago', isFavorite: true },
  { id: 'fld-specs', name: 'Architecture Specs', fileCount: 7, updatedAt: 'Yesterday', isFavorite: true },
  { id: 'fld-invoices', name: 'Billing & Invoices', fileCount: 24, updatedAt: 'Nov 10' },
  { id: 'fld-mail-att', name: 'Mail Attachments', fileCount: 42, updatedAt: 'Just now', isFavorite: true },
];

const INITIAL_FILES: StorageFile[] = [
  { id: 'file-1', name: 'IMAP_RFC3501_Specification.pdf', folderId: 'fld-specs', type: 'pdf', size: '2.4 MB', sizeBytes: 2516582, updatedAt: 'Today, 10:15 AM', isStarred: true, isEmailAttachment: true, emailSubject: 'IMAP Protocol Reference update', sender: 'alex.rivera@airsend.in' },
  { id: 'file-2', name: 'Q4_Product_Roadmap.xlsx', folderId: 'fld-specs', type: 'spreadsheet', size: '1.1 MB', sizeBytes: 1153433, updatedAt: 'Today, 09:30 AM', isStarred: true },
  { id: 'file-3', name: 'Calendar_Pastel_Design_System.png', folderId: 'fld-design', type: 'image', size: '3.8 MB', sizeBytes: 3984588, updatedAt: 'Yesterday', isStarred: false, isEmailAttachment: true, emailSubject: 'Calendar UI screenshot', sender: 'sarah.connor@airsend.in' },
  { id: 'file-4', name: 'Release_Notes_v2.4.docx', folderId: 'fld-specs', type: 'doc', size: '840 KB', sizeBytes: 860160, updatedAt: 'Nov 12, 2026', isStarred: false },
  { id: 'file-5', name: 'AirSend_Icons_Master.zip', folderId: 'fld-design', type: 'archive', size: '14.2 MB', sizeBytes: 14889779, updatedAt: 'Nov 11, 2026', isStarred: true },
  { id: 'file-6', name: 'Invoice_INV-2026-1049.pdf', folderId: 'fld-invoices', type: 'pdf', size: '320 KB', sizeBytes: 327680, updatedAt: 'Nov 10, 2026', isStarred: false, isEmailAttachment: true, emailSubject: 'Your Monthly Invoice', sender: 'billing@aws.amazon.com' },
  { id: 'file-7', name: 'Audit_Log_Export.csv', folderId: 'fld-specs', type: 'spreadsheet', size: '640 KB', sizeBytes: 655360, updatedAt: 'Nov 08, 2026', isStarred: false },
  { id: 'file-8', name: 'Hero_Banner_Retina.jpg', folderId: 'fld-design', type: 'image', size: '4.5 MB', sizeBytes: 4718592, updatedAt: 'Nov 06, 2026', isStarred: false },
];

export function useFilesState() {
  const [folders, setFolders] = useState<StorageFolder[]>(INITIAL_FOLDERS);
  const [files, setFiles] = useState<StorageFile[]>(INITIAL_FILES);
  const [activeCategory, setActiveCategory] = useState<FileCategory>('all');
  const [selectedType, setSelectedType] = useState<FileType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [previewFile, setPreviewFile] = useState<StorageFile | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isNewFolderOpen, setIsNewFolderOpen] = useState(false);

  const filteredFiles = files.filter((f) => {
    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = f.name.toLowerCase().includes(q);
      const matchSender = f.sender?.toLowerCase().includes(q);
      const matchSubj = f.emailSubject?.toLowerCase().includes(q);
      if (!matchName && !matchSender && !matchSubj) return false;
    }
    // Category filter
    if (activeCategory === 'attachments' && !f.isEmailAttachment) return false;
    if (activeCategory === 'starred' && !f.isStarred) return false;
    if (activeCategory === 'recent') {
      const isRecent = f.updatedAt.includes('Today') || f.updatedAt.includes('Yesterday');
      if (!isRecent) return false;
    }
    // Type filter
    if (selectedType !== 'all' && f.type !== selectedType) return false;
    return true;
  });

  const toggleStar = (fileId: string) => {
    setFiles((prev) => prev.map((f) => (f.id === fileId ? { ...f, isStarred: !f.isStarred } : f)));
  };

  const deleteFile = (fileId: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== fileId));
    if (previewFile?.id === fileId) setPreviewFile(null);
  };

  const createFolder = (name: string) => {
    const newFld: StorageFolder = {
      id: `fld-${Date.now()}`,
      name,
      fileCount: 0,
      updatedAt: 'Just now',
    };
    setFolders((prev) => [newFld, ...prev]);
    setIsNewFolderOpen(false);
  };

  const uploadFile = (name: string, type: StorageFile['type'], size: string) => {
    const newFile: StorageFile = {
      id: `file-${Date.now()}`,
      name,
      type,
      size,
      sizeBytes: 1024 * 1024 * 2,
      updatedAt: 'Just now',
      isStarred: false,
    };
    setFiles((prev) => [newFile, ...prev]);
    setIsUploadOpen(false);
  };

  return {
    folders,
    files: filteredFiles,
    totalFilesCount: files.length,
    activeCategory,
    setActiveCategory,
    selectedType,
    setSelectedType,
    searchQuery,
    setSearchQuery,
    viewMode,
    setViewMode,
    previewFile,
    setPreviewFile,
    isUploadOpen,
    setIsUploadOpen,
    isNewFolderOpen,
    setIsNewFolderOpen,
    toggleStar,
    deleteFile,
    createFolder,
    uploadFile,
  };
}
