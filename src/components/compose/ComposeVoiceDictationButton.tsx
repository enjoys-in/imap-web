'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { useComposeStore } from '@/stores';
import { useToastStore } from '@/stores/useToastStore';
import { cn } from '@/lib/utils';

export function ComposeVoiceDictationButton() {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const recognitionRef = useRef<any>(null);
  const body = useComposeStore((s) => s.body);
  const updateFields = useComposeStore((s) => s.updateFields);
  const addToast = useToastStore((s) => s.addToast);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        setIsSupported(false);
      }
    }
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
    }
    setIsListening(false);
  }, []);

  const startListening = () => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      addToast({
        title: 'Voice dictation unavailable',
        description: 'Speech recognition is not supported in your current browser.',
        type: 'warning',
      });
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        addToast({
          title: 'Voice dictation started',
          description: 'Speak clearly into your microphone...',
          type: 'info',
          duration: 3000,
        });
      };

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            transcript += event.results[i][0].transcript;
          }
        }

        if (transcript.trim()) {
          const currentBody = useComposeStore.getState().body;
          const trailingSpace = currentBody.length > 0 && !currentBody.endsWith(' ') && !currentBody.endsWith('\n');
          const appended = currentBody + (trailingSpace ? ' ' : '') + transcript.trim();
          updateFields({ body: appended });
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('[SpeechRecognition error]', event.error);
        if (event.error !== 'no-speech') {
          addToast({
            title: 'Dictation error',
            description: `Speech recognition: ${event.error}`,
            type: 'error',
          });
        }
        stopListening();
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      addToast({
        title: 'Could not start microphone',
        description: err?.message || 'Permission denied or microphone error.',
        type: 'error',
      });
      setIsListening(false);
    }
  };

  const handleToggle = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      title={isListening ? 'Stop voice dictation' : 'Dictate email with voice'}
      className={cn(
        'h-7 px-2.5 rounded text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer',
        isListening
          ? 'bg-rose-500 hover:bg-rose-600 text-white animate-pulse shadow-md ring-2 ring-rose-300 dark:ring-rose-900'
          : 'bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300'
      )}
    >
      {isListening ? (
        <>
          <Mic className="w-3.5 h-3.5 animate-bounce" />
          <span>Listening...</span>
        </>
      ) : (
        <>
          <Mic className="w-3.5 h-3.5 text-neutral-500" />
          <span className="hidden sm:inline">Dictate</span>
        </>
      )}
    </button>
  );
}
