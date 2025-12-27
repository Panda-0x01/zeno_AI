import { useState, useRef, KeyboardEvent, useEffect } from 'react';
import { useAppStore } from '../store/appStore';
import { voiceService } from '../services/voiceService';
import { FileService } from '../services/fileService';
import { Mic, MicOff, Send, Square, Paperclip, X, Image, FileText } from 'lucide-react';
import './ChatInput.css';

interface ChatInputProps {
  onSend: (message: string, attachments?: File[]) => void;
  onStop: () => void;
  isGenerating: boolean;
  disabled: boolean;
}

export default function ChatInput({ onSend, onStop, isGenerating, disabled }: ChatInputProps) {
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isAutoSending, setIsAutoSending] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { settings } = useAppStore();
  const maxRetries = 3;

  const checkNetworkConnectivity = async (): Promise<boolean> => {
    // Use the browser's online status as primary indicator
    return navigator.onLine && isOnline;
  };

  // Check voice support on component mount
  useEffect(() => {
    if (!voiceService.isRecognitionSupported()) {
      const recommendations = voiceService.getRecommendations();
      setVoiceError(`Voice input not supported. ${recommendations.join('. ')}`);
    }

    // Listen for online/offline events
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleSend = () => {
    if ((input.trim() || attachments.length > 0) && !isGenerating) {
      onSend(input.trim(), attachments.length > 0 ? attachments : undefined);
      setInput('');
      setAttachments([]);
      
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

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      const validFiles: File[] = [];
      const errors: string[] = [];

      files.forEach(file => {
        const validation = FileService.validateFile(file);
        if (validation.valid) {
          validFiles.push(file);
        } else {
          errors.push(`${file.name}: ${validation.error}`);
        }
      });

      if (errors.length > 0) {
        alert(`Some files were not added:\n${errors.join('\n')}`);
      }

      if (validFiles.length > 0) {
        setAttachments(prev => [...prev, ...validFiles]);
      }
    }
    
    // Reset file input
    if (e.target) {
      e.target.value = '';
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number): string => {
    return FileService.formatFileSize(bytes);
  };

  const getFileIcon = (file: File) => {
    if (FileService.isImageFile(file)) {
      return <Image size={16} />;
    }
    return <FileText size={16} />;
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      const validFiles: File[] = [];
      const errors: string[] = [];

      files.forEach(file => {
        const validation = FileService.validateFile(file);
        if (validation.valid) {
          validFiles.push(file);
        } else {
          errors.push(`${file.name}: ${validation.error}`);
        }
      });

      if (errors.length > 0) {
        alert(`Some files were not added:\n${errors.join('\n')}`);
      }

      if (validFiles.length > 0) {
        setAttachments(prev => [...prev, ...validFiles]);
      }
    }
  };

  const toggleVoiceInput = () => {
    console.log('[Voice] Toggle voice input, currently recording:', isRecording);
    
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const startRecording = async () => {
    console.log('[Voice] Starting voice recording...');
    setVoiceError(null);
    
    if (!voiceService.isRecognitionSupported()) {
      const recommendations = voiceService.getRecommendations();
      const errorMsg = `Voice recognition not supported. ${recommendations.join('. ')}`;
      setVoiceError(errorMsg);
      alert(errorMsg);
      return;
    }

    // Check network connectivity first
    const isOnline = await checkNetworkConnectivity();
    if (!isOnline) {
      setVoiceError('No internet connection. Voice recognition requires internet access to Google\'s speech servers.');
      alert('No internet connection detected. Voice recognition requires internet access.');
      return;
    }

    // Request permission first
    try {
      const hasPermission = await voiceService.requestPermission();
      if (!hasPermission) {
        const errorMsg = 'Microphone permission denied. Please allow microphone access and try again.';
        setVoiceError(errorMsg);
        alert(errorMsg);
        return;
      }
    } catch (error) {
      const errorMsg = `Permission error: ${error}`;
      setVoiceError(errorMsg);
      alert(errorMsg);
      return;
    }

    try {
      recognitionRef.current = voiceService.createRecognition({
        continuous: false, // Set to false for auto-send - stops after user finishes speaking
        interimResults: true, // Show interim results for better UX
        lang: 'en-US',
        maxAlternatives: 1
      });

      console.log('[Voice] Recognition configured:', {
        continuous: recognitionRef.current.continuous,
        interimResults: recognitionRef.current.interimResults,
        lang: recognitionRef.current.lang
      });

      recognitionRef.current.onstart = () => {
        console.log('[Voice] Recording started');
        setIsRecording(true);
        setVoiceError(null);
      };

      recognitionRef.current.onresult = (event: any) => {
        console.log('[Voice] Recognition result:', event);
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join('');
        
        console.log('[Voice] Transcript:', transcript);
        setInput(transcript);
        
        // If this is a final result (not interim), auto-send the message
        const lastResult = event.results[event.results.length - 1];
        if (lastResult && lastResult.isFinal && transcript.trim()) {
          console.log('[Voice] Final result detected, auto-sending message');
          setIsAutoSending(true);
          // Small delay to ensure the input is updated
          setTimeout(() => {
            if (transcript.trim() && !isGenerating) {
              onSend(transcript.trim(), attachments.length > 0 ? attachments : undefined);
              setInput('');
              setAttachments([]);
              setIsAutoSending(false);
              
              // Reset textarea height
              if (textareaRef.current) {
                textareaRef.current.style.height = 'auto';
              }
            } else {
              setIsAutoSending(false);
            }
          }, 100);
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('[Voice] Speech recognition error:', event.error);
        setIsRecording(false);
        
        // Handle network errors - these are very common and expected
        if (event.error === 'network') {
          // Don't spam console with warnings for network errors
          console.log('[Voice] Network error occurred - this is normal when Google\'s speech servers are unreachable');
          
          // Stop any further retries to prevent infinite loops
          setRetryCount(maxRetries);
          
          // Show a helpful message without being annoying
          setVoiceError('Voice recognition is currently unavailable. This usually means Google\'s speech servers are unreachable. You can still type your message normally.');
          
          // Don't show alert or retry for network errors
          return;
        }
        
        // Handle other types of errors with appropriate responses
        let errorMessage = 'Voice recognition failed. ';
        let suggestions = '';
        let showAlert = true;
        
        switch (event.error) {
          case 'not-allowed':
            errorMessage += 'Microphone access denied.';
            suggestions = 'Please allow microphone access in your browser settings and try again.';
            break;
          case 'no-speech':
            errorMessage += 'No speech detected.';
            suggestions = 'Please speak clearly into your microphone and try again.';
            showAlert = false; // Don't show alert for no-speech, it's not critical
            break;
          case 'audio-capture':
            errorMessage += 'No microphone found.';
            suggestions = 'Please check that your microphone is connected and enabled.';
            break;
          case 'service-not-allowed':
            errorMessage += 'Speech service not allowed.';
            suggestions = 'Voice recognition requires HTTPS. Please use a secure connection.';
            break;
          case 'bad-grammar':
            errorMessage += 'Configuration error.';
            suggestions = 'Please refresh the page and try again.';
            break;
          case 'language-not-supported':
            errorMessage += 'Language not supported.';
            suggestions = 'Please ensure English is selected in your settings.';
            break;
          default:
            errorMessage += `Unexpected error: ${event.error}`;
            suggestions = 'Please refresh the page or try using a different browser.';
        }
        
        const fullMessage = `${errorMessage} ${suggestions}`;
        setVoiceError(fullMessage);
        
        // Only show alerts for critical errors
        if (showAlert) {
          alert(fullMessage);
        }
      };

      recognitionRef.current.onend = () => {
        console.log('[Voice] Recording ended');
        setIsRecording(false);
        
        // Auto-send the message when recording ends (if there's content and not already sending)
        const currentInput = input.trim();
        if (currentInput && !isGenerating && !isAutoSending) {
          console.log('[Voice] Auto-sending message on recording end:', currentInput);
          setIsAutoSending(true);
          setTimeout(() => {
            onSend(currentInput, attachments.length > 0 ? attachments : undefined);
            setInput('');
            setAttachments([]);
            setIsAutoSending(false);
            
            // Reset textarea height
            if (textareaRef.current) {
              textareaRef.current.style.height = 'auto';
            }
          }, 200);
        }
      };

      console.log('[Voice] Starting recognition...');
      recognitionRef.current.start();
      
    } catch (error) {
      console.error('[Voice] Failed to start recognition:', error);
      setIsRecording(false);
      const errorMsg = 'Failed to start voice recognition. Please try again.';
      setVoiceError(errorMsg);
      alert(errorMsg);
    }
  };

  const stopRecording = () => {
    console.log('[Voice] Stopping voice recording...');
    
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
        console.log('[Voice] Recognition stopped');
      } catch (error) {
        console.error('[Voice] Error stopping recognition:', error);
      }
      setIsRecording(false);
    }
  };

  return (
    <div 
      className={`chat-input-container ${isDragOver ? 'drag-over' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {isDragOver && (
        <div className="drag-overlay">
          <div className="drag-message">
            <Paperclip size={32} />
            <span>Drop files here to attach</span>
          </div>
        </div>
      )}
      
      {voiceError && (
        <div className="voice-error-banner">
          <span>ℹ️ {voiceError}</span>
          <button onClick={() => setVoiceError(null)}>×</button>
        </div>
      )}
      {isAutoSending && (
        <div className="auto-send-indicator">
          <span>🚀 Sending voice message...</span>
        </div>
      )}
      
      {/* File attachments preview */}
      {attachments.length > 0 && (
        <div className="attachments-preview">
          {attachments.map((file, index) => (
            <div key={index} className="attachment-item">
              <div className="attachment-info">
                <div className="attachment-icon">
                  {getFileIcon(file)}
                </div>
                <div className="attachment-details">
                  <span className="attachment-name">{file.name}</span>
                  <span className="attachment-size">{formatFileSize(file.size)}</span>
                </div>
              </div>
              <button
                className="attachment-remove"
                onClick={() => removeAttachment(index)}
                aria-label={`Remove ${file.name}`}
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="chat-input-wrapper">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,.txt,.md,.js,.ts,.jsx,.tsx,.py,.java,.cpp,.c,.html,.css,.json,.pdf"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
        
        <button
          className="icon-button attach"
          onClick={handleFileSelect}
          disabled={disabled || isGenerating || isAutoSending}
          aria-label="Attach files"
          title="Attach images or text files"
        >
          <Paperclip size={20} />
        </button>

        <textarea
          ref={textareaRef}
          data-chat-input
          className={`chat-input ${isAutoSending ? 'auto-sending' : ''}`}
          placeholder={
            voiceError && voiceError.includes('Voice recognition is currently unavailable')
              ? "Voice is temporarily unavailable - type your message here..."
              : "Type a message, attach files, or use voice input... (Shift+Enter for new line)"
          }
          value={input}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          disabled={disabled || isGenerating || isAutoSending}
          rows={1}
          aria-label="Chat message input"
        />
        <div className="chat-input-actions">
          <button
            className={`icon-button ${isRecording ? 'recording' : ''} ${voiceError ? 'error' : ''} ${isAutoSending ? 'auto-sending' : ''}`}
            onClick={toggleVoiceInput}
            disabled={disabled || isGenerating || isAutoSending}
            aria-label={isRecording ? 'Stop recording' : 'Start voice input'}
            title={
              isAutoSending
                ? 'Sending voice message...'
                : voiceError 
                  ? 'Voice input temporarily unavailable - click to try again' 
                  : !isOnline
                    ? 'Voice input requires internet connection'
                    : isRecording 
                      ? 'Stop recording and send message' 
                      : 'Voice input (speak and auto-send)'
            }
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
              disabled={disabled || (!input.trim() && attachments.length === 0) || isAutoSending}
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
