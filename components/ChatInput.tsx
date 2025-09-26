import React, { useState, useEffect, useRef } from 'react';
import { SendIcon, MicrophoneIcon } from './Icons';

// Gracefully handle server-side rendering or older browsers.
// FIX: Cast window to `any` to access non-standard `SpeechRecognition` properties.
// FIX: Rename variable to avoid conflict with the `SpeechRecognition` type.
const SpeechRecognitionAPI =
  typeof window !== 'undefined'
    ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    : null;
const isSpeechRecognitionSupported = !!SpeechRecognitionAPI;


interface ChatInputProps {
  onSendMessage: (text: string) => void;
  disabled: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, disabled }) => {
  const [text, setText] = useState('');
  const [isListening, setIsListening] = useState(false);
  // FIX: The `SpeechRecognition` type is not available in this context. Using `any` to avoid a compilation error.
  const recognitionRef = useRef<any | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!isSpeechRecognitionSupported) {
      console.warn("Speech recognition is not supported by this browser.");
      return;
    }

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };

    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0])
        .map((result: any) => result.transcript)
        .join('');
      setText(transcript);
    };
    
    recognitionRef.current = recognition;

    // Cleanup: stop recognition if component unmounts
    return () => {
      recognition.stop();
    };
  }, []);

  // Auto-resize textarea height based on content
  useEffect(() => {
    if (textareaRef.current) {
      const textarea = textareaRef.current;
      textarea.style.height = 'auto'; // Reset height to recalculate
      const scrollHeight = textarea.scrollHeight;
      const maxHeight = 200; // Approx 10 lines
      if (scrollHeight > maxHeight) {
        textarea.style.height = `${maxHeight}px`;
        textarea.style.overflowY = 'auto';
      } else {
        textarea.style.height = `${scrollHeight}px`;
        textarea.style.overflowY = 'hidden';
      }
    }
  }, [text]);


  const handleToggleListening = () => {
    if (disabled || !recognitionRef.current) return;
    
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      setText(''); // Clear text before starting a new recording
      recognitionRef.current.start();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim() && !disabled) {
      onSendMessage(text);
      setText('');
      if (isListening) {
        recognitionRef.current?.stop();
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Enter, new line on Shift+Enter
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-start space-x-3">
      <textarea
        ref={textareaRef}
        rows={1}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={isListening ? "Listening..." : "Tell me what you'd like to read..."}
        disabled={disabled}
        className="flex-grow w-full bg-white border border-[#D5C6B8] rounded-xl py-2 px-4 sm:py-3 sm:px-5 text-[#402E26] placeholder-[#BFAD9F] focus:ring-2 focus:ring-[#8C5A3A]/50 focus:border-[#8C5A3A] outline-none transition duration-200 disabled:opacity-60 resize-none"
        aria-label="Chat message input"
      />
      {isSpeechRecognitionSupported && (
        <button
          type="button"
          onClick={handleToggleListening}
          disabled={disabled}
          className={`flex-shrink-0 bg-white text-[#6B4E3F] rounded-full h-10 w-10 sm:h-12 sm:w-12 flex items-center justify-center border border-[#D5C6B8] hover:bg-[#F6F1EB] disabled:opacity-60 disabled:cursor-not-allowed transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8C5A3A] focus:ring-offset-[#FDFBF7] ${isListening ? 'bg-[#EAE1D9] ring-2 ring-[#8C5A3A]/50' : ''}`}
          aria-label={isListening ? 'Stop listening' : 'Start voice input'}
        >
          <MicrophoneIcon className={`h-5 w-5 transition-colors ${isListening ? 'text-[#8C5A3A]' : ''}`} />
        </button>
      )}
      <button
        type="submit"
        disabled={disabled}
        className="flex-shrink-0 bg-[#8C5A3A] text-white rounded-full h-10 w-10 sm:h-12 sm:w-12 flex items-center justify-center hover:bg-[#6B4E3F] disabled:bg-[#BFAD9F] disabled:cursor-not-allowed transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8C5A3A] focus:ring-offset-[#FDFBF7]"
        aria-label="Send message"
      >
        <SendIcon className="h-5 w-5" />
      </button>
    </form>
  );
};

export default ChatInput;