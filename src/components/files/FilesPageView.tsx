'use client';

import React from 'react';
import { useFilesState } from './useFilesState';
import { FilesSidebar } from './FilesSidebar';
import { FilesToolbar } from './FilesToolbar';
import { FilesFolderGrid } from './FilesFolderGrid';
import { FilesItemGrid } from './FilesItemGrid';
import { FilesItemList } from './FilesItemList';
import { FileUploadModal } from './FileUploadModal';
import { NewFolderModal } from './NewFolderModal';
import { FilePreviewModal } from './FilePreviewModal';

export function FilesPageView() {
  const {
    folders,
    files,
    totalFilesCount,
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
  } = useFilesState();

  return (
    <div className="flex-1 flex h-full overflow-hidden bg-white dark:bg-[#181818] select-none">
      {/* Category Sidebar */}
      <FilesSidebar
        activeCategory={activeCategory}
        onSelectCategory={setActiveCategory}
        onUpload={() => setIsUploadOpen(true)}
        onNewFolder={() => setIsNewFolderOpen(true)}
      />

      {/* Main Files View */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-neutral-50/40 dark:bg-[#181818]">
        <FilesToolbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedType={selectedType}
          onSelectType={setSelectedType}
          viewMode={viewMode}
          onToggleViewMode={setViewMode}
          filesCount={files.length}
        />

        {/* Scrollable files grid/list */}
        <div className="flex-1 overflow-y-auto p-5">
          {/* Top Folder Cards */}
          <FilesFolderGrid
            folders={folders}
            onSelectFolder={(fldId) => {
              // Quick filter by folder
            }}
          />

          {/* Files List/Grid */}
          <div className="mb-2">
            <h3 className="text-xs font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider mb-3 px-1">
              {activeCategory === 'attachments' ? 'Email Attachments' : 'Files'} ({files.length})
            </h3>

            {viewMode === 'grid' ? (
              <FilesItemGrid
                files={files}
                onPreview={setPreviewFile}
                onToggleStar={toggleStar}
                onDelete={deleteFile}
              />
            ) : (
              <FilesItemList
                files={files}
                onPreview={setPreviewFile}
                onToggleStar={toggleStar}
                onDelete={deleteFile}
              />
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <FileUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUpload={uploadFile}
      />

      <NewFolderModal
        isOpen={isNewFolderOpen}
        onClose={() => setIsNewFolderOpen(false)}
        onCreate={createFolder}
      />

      <FilePreviewModal
        file={previewFile}
        onClose={() => setPreviewFile(null)}
        onToggleStar={toggleStar}
        onDelete={deleteFile}
      />
    </div>
  );
}
