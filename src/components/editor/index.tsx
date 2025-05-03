"use client"
import React, { useCallback, useRef, useState } from 'react';
import { useEditor } from '@/hooks/useEditor';
import { Toolbar } from './Toolbar';
import { AIPrompt } from './AIPrompt';
import { SpecialCharacters } from './SpecialCharacters';
import { ColorPicker } from './ColorPicker';
import { TableSelector } from './TableSelector';
import { ContextMenu } from './ContextMenu';
import { LinkDialog } from './LinkDialog';
import { Languages, Redo, Undo } from 'lucide-react';
import { FaFileWord, FaMarkdown } from 'react-icons/fa';
import { AIAssistant } from './AIAssistant';
import { Command } from '@/lib/types/editor';

import {
    File, FileText,
    FileImage,
    FileIcon as FilePdf,
    Trash2, Image, Video, Paperclip,
} from 'lucide-react';
import { formatBytes } from '@/lib/utils';


export function RichTextEditor() {
    const editorRef = useRef<HTMLDivElement>(null);
    const {
        execCommand,
        updateContent,
        showAIPrompt,
        html,
        markdown,
        canUndo,
        canRedo,
        charCount,
        showSpecialChars,
        showMarkdown,
        showHtml,
        showColorPicker,
        showTableSelector,
        showContextMenu,
        showLinkDialog,
        showAIAssistant,
        attachments,
        setDialogs
    } = useEditor();


    const [isLoading, setIsLoading] = useState(false)
    const handleMediaUpload = (files: FileList) => {
        Array.from(files).forEach(file => {
            const uploadId = Math.random().toString(36).substring(7);

            setDialogs({ attachments: [...attachments, { id: uploadId, name: file.name, progress: 0, type: file.type, size: file.size }] });
            // upload progress
            let progress = 0;

        });
    };
    const handleCommand = (command: Command, value?: string, event?: React.MouseEvent) => {
        switch (command) {
            case 'link':
                if (event) {
                    const rect = (event.target as HTMLElement).getBoundingClientRect();
                    setDialogs({ showLinkDialog: { x: rect.left, y: rect.bottom + window.scrollY } });
                }
                break;
            case 'table':
                if (event) {
                    const rect = (event.target as HTMLElement).getBoundingClientRect();
                    setDialogs({ showTableSelector: { x: rect.left, y: rect.bottom + window.scrollY } });
                }
                break;
            case 'foreColor':
            case 'backColor':
                if (event) {
                    const rect = (event.target as HTMLElement).getBoundingClientRect();
                    setDialogs({
                        showColorPicker: {
                            type: command === 'foreColor' ? 'fore' : 'back',
                            position: {
                                x: rect.left,
                                y: rect.bottom + window.scrollY
                            }
                        }
                    });
                }
                break;
            case 'bulletList':
                execCommand('insertUnorderedList');
                break;
            case 'numberList':
                execCommand('insertOrderedList');
                break;
            case 'alignLeft':
                execCommand('justifyLeft');
                break;
            case 'alignCenter':
                execCommand('justifyCenter');
                break;
            case 'alignRight':
                execCommand('justifyRight');
                break;
            case 'indent':
                execCommand('indent');
                break;
            case 'outdent':
                execCommand('outdent');
                break;
            case 'code':
                wrapSelection('code');
                break;
            case 'blockquote':
                wrapSelection('blockquote');
                break;
            case 'removeFormat':
                execCommand('removeFormat');
                break;
            default:
                execCommand(command, value);
        }
    };

    const wrapSelection = (tag: string) => {
        const selection = window.getSelection();
        if (!selection?.rangeCount) return;

        const range = selection.getRangeAt(0);
        const content = range.extractContents();
        const wrapper = document.createElement(tag);
        wrapper.appendChild(content);
        range.insertNode(wrapper);
    };

    const insertTable = (rows: number, cols: number) => {
        let table = '<table border="1" style="border-collapse: collapse;">';
        for (let i = 0; i < rows; i++) {
            table += '<tr>';
            for (let j = 0; j < cols; j++) {
                table += '<td style="padding: 8px;">Cell</td>';
            }
            table += '</tr>';
        }
        table += '</table>';
        execCommand('insertHTML', table);
    };

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleMediaUpload(files);
        }
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
    }, []);

    const handleContextMenu = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        setDialogs({ showContextMenu: { x: e.clientX, y: e.clientY } });

    }, [showContextMenu]);

    const handleInput = useCallback(() => {
        if (editorRef.current) {
            updateContent(editorRef.current.innerHTML);
        }
    }, [updateContent]);



    const handleAIRewrite = () => {
        const prompt = window.prompt("How would you like to rewrite this email?")
        if (prompt) {
            setIsLoading(true)
        }
    }

    const toggleMarkdownView = () => {
        setDialogs({ showMarkdown: !showMarkdown, showHtml: false });

    }
    const toggleHTMLView = () => {
        setDialogs({ showMarkdown: false, showHtml: !showHtml });

    }

    const removeAttachment = (id: string) => {
        setDialogs({ attachments: attachments.filter((att) => att.id !== id) });
    }
    const exportHTML = () => {
        if (editorRef.current) {
            console.log('Editor HTML Content:', editorRef.current.innerHTML);
        }
    };

    return (
        <div className="w-full dark:bg-neutral-800 bg-neutral-100">
            <div className="shadow-lg relative">
                <Toolbar onCommand={handleCommand} />
                <div className="flex">
                    <div className="flex-1 p-4">
                        <div
                            ref={editorRef}
                            className="min-h-[300px] prose  focus:outline-none"
                            style={{ whiteSpace: 'pre-wrap' }}
                            onContextMenu={handleContextMenu}
                            onInput={handleInput}
                            onDrop={handleDrop}
                            onDragOver={handleDragOver}
                            contentEditable
                        />
                    </div>
                    {
                        (showMarkdown || showHtml) && (
                            <div className="w-1/2 border-l p-4 dark:bg-neutral-900 bg-neutral-200 font-mono text-sm">
                                <div className="flex gap-2 mb-2">
                                    <button
                                    type='button'
                                        onClick={toggleMarkdownView}
                                        className={`px-2 py-1 rounded ${showMarkdown ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-neutral-800 text-neutral-500'
                                            }`}
                                    >
                                        Markdown
                                    </button>
                                    <button
                                    type='button'

                                        onClick={toggleHTMLView}
                                        className={`px-2 py-1 rounded ${showHtml ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-neutral-800 text-neutral-500'
                                            }`}
                                    >
                                        HTML
                                    </button>
                                </div>
                                <pre className="whitespace-pre-wrap">
                                    {showMarkdown ? markdown : html}
                                </pre>
                            </div>
                        )
                    }
                </div>

                {attachments.length > 0 && (
                    <div className="pt-4 border-t border-gray-700">
                        <div className="space-y-2">
                            {attachments.map((attachment) => (
                                <div key={attachment.id} className="flex items-center dark:bg-neutral-900 bg-neutral-200 p-2 rounded">
                                    <div className="flex items-center gap-2 flex-1">
                                        <GetFileIcon type={attachment.type} />
                                        <span className="text-sm truncate">{attachment.name}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="text-xs text-gray-400">{formatBytes(+attachment.size)}</div>
                                        <div className="w-24 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-blue-500 rounded-full"
                                                style={{ width: `${attachment.progress}%` }}
                                            ></div>
                                        </div>
                                        <button
                                            className="text-gray-400 hover:text-white"
                                            onClick={() => removeAttachment(attachment.id)}
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>)}
                <div className="border-tflex items-center justify-between text-sm">

                    <div className="bottom-0 border-t w-full flex items-center justify-between shadow-xl gap-2 dark:bg-neutral-900 bg-neutral-100">
                        <div className="flex items-center gap-2">
                            <button
                                className="text-purple-500 hover:text-purple-400 dark:hover:bg-neutral-800 dark:text-neutral-500 dark:hover:text-neutral-100  hover:bg-neutral-300
                              flex items-center gap-1 p-2 rounded transition-colors"
                                onClick={handleAIRewrite}
                                disabled={isLoading}
                                type='button'

                            >
                                {isLoading ? (
                                    <svg
                                        className="animate-spin h-5 w-5 text-purple-500"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        ></path>
                                    </svg>
                                ) : (
                                    <>
                                        <span className="text-xs font-medium">AI</span>
                                    </>
                                )}
                            </button>
                            <button
                                onClick={toggleMarkdownView}
                                type='button'

                                className="p-2 rounded  dark:hover:bg-neutral-800 dark:text-neutral-500 dark:hover:text-neutral-100 hover:text-neutral-900 hover:bg-neutral-300 transition-colors"
                            >
                                <FaMarkdown className="w-5 h-5" />
                            </button>
                            <span
                                onClick={toggleHTMLView}
                                className='p-2 rounded dark:hover:bg-neutral-800 dark:text-neutral-500 dark:hover:text-neutral-100 hover:text-neutral-900 hover:bg-neutral-300 transition-colors cursor-pointer'>
                                <svg
                                    className="w-5 h-5"
                                    aria-hidden="true"
                                    xmlns="http://www.w3.org/2000/svg"
                                    width={24}
                                    height={24}
                                    fill="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path d="m3 2 1.578 17.824L12 22l7.467-2.175L21 2H3Zm14.049 6.048H9.075l.172 2.016h7.697l-.626 6.565-4.246 1.381-4.281-1.455-.288-2.932h2.024l.16 1.411 2.4.815 2.346-.763.297-3.005H7.416l-.562-6.05h10.412l-.217 2.017Z" />
                                </svg>

                            </span>
                            <label className="p-2 rounded dark:hover:bg-neutral-800 dark:text-neutral-500 dark:hover:text-neutral-100 hover:text-neutral-900 hover:bg-neutral-300 transition-colors cursor-pointer">
                                <input
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={(e) => e.target.files && handleMediaUpload(e.target.files)}
                                />
                                <Image className="w-5 h-5" />
                            </label>
                            <label className="p-2 rounded  dark:hover:bg-neutral-800 dark:text-neutral-500 dark:hover:text-neutral-100 hover:text-neutral-900 hover:bg-neutral-300 transition-colors cursor-pointer">
                                <input
                                    type="file"
                                    className="hidden"
                                    accept="video/*"
                                    onChange={(e) => e.target.files && handleMediaUpload(e.target.files)}
                                />
                                <Video className="w-5 h-5" />
                            </label>
                            <span
                                className="p-2 rounded  dark:hover:bg-neutral-800 dark:text-neutral-500 dark:hover:text-neutral-100 hover:text-neutral-900 hover:bg-neutral-300 transition-colors"

                                onClick={() => setDialogs({ showSpecialChars: true })}
                                title="Special Characters"
                            >
                                <Languages className="w-5 h-5" />
                            </span>
                            <label className="p-2 rounded  dark:hover:bg-neutral-800 dark:text-neutral-500 dark:hover:text-neutral-100 hover:text-neutral-900 hover:bg-neutral-300 transition-colors cursor-pointer">
                                <input
                                    type="file"
                                    className="hidden"
                                    multiple
                                    onChange={(e) => e.target.files && handleMediaUpload(e.target.files)}
                                />
                                <Paperclip className="w-5 h-5" />
                            </label>
                            <button
                                onClick={() => exportHTML()}
                                type='button'
                                className="p-2 rounded  dark:hover:bg-neutral-800 dark:text-neutral-500 dark:hover:text-neutral-100 hover:text-neutral-900 hover:bg-neutral-300 transition-colors"
                                title="Export HTML"
                            >
                                <FileText className="w-5 h-5" />

                            </button>
                            <div className="h-4 w-px bg-gray-200 mx-2" />
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => execCommand('undo')}
                                    disabled={!canUndo}
                                    type='button'
                                    className="p-2 rounded dark:hover:bg-neutral-800 hover:bg-gray-100 transition-colors disabled:opacity-50"
                                    title="Undo (Ctrl+Z)"
                                >
                                    <Undo className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => execCommand('redo')}
                                    disabled={!canRedo}
                                    type='button'

                                    className="p-2 rounded dark:hover:bg-neutral-800 hover:bg-gray-100 transition-colors disabled:opacity-50"
                                    title="Redo (Ctrl+Y)"
                                >
                                    <Redo className="w-5 h-5" />
                                </button>
                            </div>
                            {/* <div className="relative">
                              <button
                                type='button'
                                onClick={() => setShowSignatures(!showSignatures)}
                                className="p-2 rounded  dark:hover:bg-neutral-800 dark:text-neutral-500 dark:hover:text-neutral-100 hover:text-neutral-900 hover:bg-neutral-300 transition-colors"
                                title="Insert Signature"
                              >
                                <Pen className="w-5 h-5" />
                              </button>
                              {showSignatures && (
                                <div className="absolute bottom-full right-0 mb-2 w-48 bg-white rounded-lg shadow-xl border p-2">
                                  {signatures.map((sig, index) => (
                                    <span
                                      key={index}
                                      onClick={() => {
                                        document.execCommand('insertText', false, `\n\n${sig}`);
                                        setShowSignatures(false);
                                      }}
                                      className="w-full text-left p-2 hover:bg-gray-100 rounded whitespace-pre-line"
                                    >
                                      {sig}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div> */}
                        </div>
                        <div className={`${charCount > 10000 ? 'text-red-500' : 'text-gray-500'}`}>
                            {charCount} characters
                        </div>
                    </div>

                </div>

                {showAIPrompt && (
                    <AIPrompt
                        onClose={() => setDialogs({ showAIPrompt: false })}
                        onSubmit={(prompt) => setDialogs({ showAIPrompt: false })}
                    />
                )}

                {showSpecialChars && (
                    <SpecialCharacters
                        onClose={() => setDialogs({ showSpecialChars: false })}
                        onSelect={(char) => execCommand('insertText', char)}
                    />
                )}

                {showColorPicker && (
                    <ColorPicker
                        position={{ x: showColorPicker?.position.x, y: showColorPicker?.position.y }}
                        onSelect={(color) => {
                            execCommand(showColorPicker?.type === 'fore' ? 'foreColor' : 'backColor', color);
                            setDialogs({ showColorPicker: null })
                        }}
                        onClose={() => setDialogs({ showColorPicker: null })}
                    />
                )}

                {showTableSelector && (
                    <TableSelector
                        position={showTableSelector}
                        onSelect={insertTable}
                        onClose={() => setDialogs({ showTableSelector: null })}
                    />
                )}

                {/* {showContextMenu && (
                    <ContextMenu
                        position={showContextMenu}
                        onCommand={handleCommand}
                        onClose={() => setDialogs({ showContextMenu: null })}
                    />
                )} */}

                {showLinkDialog && (
                    <LinkDialog
                        position={showLinkDialog}
                        onSubmit={(url) => {
                            execCommand('createLink', url);
                            setDialogs({ showLinkDialog: null });

                        }}
                        onClose={() => setDialogs({ showLinkDialog: null })}
                    />
                )}

                {showAIAssistant && (
                    <AIAssistant
                        position={showAIAssistant}
                        onPrompt={() => setDialogs({ showAIAssistant: null })}
                    />
                )}
            </div>

        </div>
    );
}
const GetFileIcon = ({ type }: { type: string }) => {

    switch (type) {
        case 'pdf':
            return <FilePdf size={16} className="text-red-500" />;
        case 'docx':
            return <FileText size={16} className="text-blue-500" />;
        case 'text':
            return <FaFileWord size={16} className="text-blue-500" />;
        case 'image':
            return <FileImage size={16} className="text-green-500" />;
        default:
            return <File size={16} className="text-gray-500" />

    }
}
