import React, { createContext, useContext, useState, useCallback } from "react";
import DOMPurify from "dompurify";
import { html2markdown } from "@/lib/utils";
import { EditorAttachments } from "@/lib/types/editor";

interface DialogPosition {
  x: number;
  y: number;
}

interface ColorPickerState {
  type: "fore" | "back";
  position: DialogPosition;
}
 

interface EditorState {
  html: string;
  markdown: string;
  charCount: number;
  canUndo: boolean;
  canRedo: boolean;
  activeStyles: Set<string>;
}

interface DialogState {
  showAIPrompt: boolean;
  showSpecialChars: boolean;
  showMarkdown: boolean;
  showHtml: boolean;
  showColorPicker: ColorPickerState | null;
  showTableSelector: DialogPosition | null;
  showContextMenu: DialogPosition | null;
  showLinkDialog: DialogPosition | null;
  showAIAssistant: DialogPosition | null;
  attachments: EditorAttachments[];
}

interface EditorContextType extends EditorState, DialogState {
  updateContent: (content: string) => void;
  setActiveStyles: (styles: Set<string>) => void;
  execCommand: (command: string, value?: string) => void;
  setDialogs: (update: Partial<DialogState>) => void;
}

export const EditorContext = createContext<EditorContextType | null>(null);


export function EditorContextProvider({ children }: { children: React.ReactNode }) {
  // Content and Dialog State
  const [editorState, setEditorState] = useState<EditorState>({
    html: "",
    markdown: "",
    charCount: 0,
    canUndo: false,
    canRedo: false,
    activeStyles: new Set<string>(),
  });

  const [dialogState, setDialogState] = useState<DialogState>({
    showAIPrompt: false,
    showSpecialChars: false,
    showMarkdown: false,
    showHtml: false,
    showColorPicker: null,
    showTableSelector: null,
    showContextMenu: null,
    showLinkDialog: null,
    showAIAssistant: null,
    attachments: [],
  });

  const updateContent = useCallback((content: string) => {
    const sanitizedHtml = DOMPurify.sanitize(content);
    setEditorState((prev) => ({
      ...prev,
      html: sanitizedHtml,
      markdown: html2markdown(sanitizedHtml),
      charCount: content.length,
      canUndo: document.queryCommandEnabled("undo"),
      canRedo: document.queryCommandEnabled("redo"),
    }));
  }, []);

  const execCommand = useCallback((command: string, value?: string) => {
    document.execCommand(command, false, value);
    const selection = document.getSelection();
    if (selection) {
      const parentElement = selection.anchorNode?.parentElement;
      if (parentElement) {
        const styles = new Set<string>();
        if (document.queryCommandState("bold")) styles.add("bold");
        if (document.queryCommandState("italic")) styles.add("italic");
        if (document.queryCommandState("strikethrough")) styles.add("strikethrough");
        if (parentElement.closest("code")) styles.add("code");
        if (parentElement.closest("blockquote")) styles.add("blockquote");
        if (parentElement.closest("ul")) styles.add("bulletList");
        if (parentElement.closest("ol")) styles.add("numberList");
        setEditorState((prev) => ({ ...prev, activeStyles: styles }));
      }
    }
  }, []);

  const setDialogs = useCallback((update: Partial<DialogState>) => {
    setDialogState((prev) => ({ ...prev, ...update }));
  }, []);

  return (
    <EditorContext.Provider
      value={{
        ...editorState,
        ...dialogState,
        updateContent,
        setActiveStyles: (styles) => setEditorState((prev) => ({ ...prev, activeStyles: styles })),
        execCommand,
        setDialogs,
      }}
    >
      {children}
    </EditorContext.Provider>
  );
}
