import { useEffect, useRef } from 'react';
import { Message } from '../types';
import MessageItem from './MessageItem';
import './MessageList.css';

interface MessageListProps {
  messages: Message[];
  isGenerating: boolean;
}

export default function MessageList({ messages, isGenerating }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="message-list" role="log" aria-live="polite" aria-label="Chat messages">
      {messages.length === 0 ? (
        <div className="message-list-empty">
          <p>Start a conversation by typing a message below</p>
        </div>
      ) : (
        messages.map((message) => (
          <MessageItem key={message.id} message={message} />
        ))
      )}
      {isGenerating && messages[messages.length - 1]?.role === 'assistant' && (
        <div className="typing-indicator" aria-label="Assistant is typing">
          <span></span>
          <span></span>
          <span></span>
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  );
}
