import { useState, useRef, KeyboardEvent } from 'react';
import { useAppStore } from '../store/appStore';
import { Mic, MicOff, Send, Square } from 'lucide-react';
import './ChatInput.css';

interface ChatInputProps {
  onSend: (message: string) => void;
  onStop: () => void;
  isGenerating: boolean;
  disabled: boolean;
}

export default function ChatInput({ onSend, onStop, isGenerating, disabled }: ChatInputProps) {
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);
  
  const { settings } = useAppStore();

  const handleSend = () => {
    if (input.trim() && !isGenerating) {
      onSend(input.trim());
      setInput('');
      
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    
    // Auto-resize textarea
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`;
  };

  const toggleVoiceInput = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const startRecording = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser');
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    
    recognitionRef.current.continuous = !settings.pushToTalk;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = 'en-US';

    recognitionRef.current.onstart = () => {
      setIsRecording(true);
    };

    recognitionRef.current.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0].transcript)
        .join('');
      
      setInput(transcript);
    };

    recognitionRef.current.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsRecording(false);
    };

    recognitionRef.current.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current.start();
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
  };

  return (
    <div className="chat-input-container">
      <div className="chat-input-wrapper">
        <textarea
          ref={textareaRef}
          data-chat-input
          className="chat-input"
          placeholder="Type a message... (Shift+Enter for new line)"
          value={input}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          disabled={disabled || isGenerating}
          rows={1}
          aria-label="Chat message input"
        />
        <div className="chat-input-actions">
          <button
            className={`icon-button ${isRecording ? 'recording' : ''}`}
            onClick={toggleVoiceInput}
            disabled={disabled || isGenerating}
            aria-label={isRecording ? 'Stop recording' : 'Start voice input'}
            title={isRecording ? 'Stop recording' : 'Voice input'}
          >
            {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
          </button>
          {isGenerating ? (
            <button
              className="icon-button stop"
              onClick={onStop}
              aria-label="Stop generation"
              title="Stop generation"
            >
              <Square size={20} />
            </button>
          ) : (
            <button
              className="icon-button send"
              onClick={handleSend}
              disabled={disabled || !input.trim()}
              aria-label="Send message"
              title="Send message (Enter)"
            >
              <Send size={20} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
