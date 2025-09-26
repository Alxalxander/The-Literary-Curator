import React, { useEffect, useRef } from 'react';
import { ChatMessage } from '../types';
import Message from './Message';
import ChatInput from './ChatInput';
import Loader from './Loader';

interface ChatInterfaceProps {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  onSendMessage: (text: string) => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ messages, isLoading, error, onSendMessage }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  return (
    <div className="flex flex-col h-full max-w-3xl mx-auto px-4">
      <div className="flex-grow overflow-y-auto chat-container pr-2">
        <div className="space-y-6 py-8">
          {messages.map((msg, index) => (
            <Message key={index} message={msg} />
          ))}
          {isLoading && (
            <div className="flex justify-start animate-slide-in-left">
                <div className="bg-[#EAE1D9] text-[#402E26] rounded-lg py-3 px-4 max-w-lg inline-block">
                    <Loader />
                </div>
            </div>
          )}
        </div>
        <div ref={messagesEndRef} />
      </div>
      <div className="py-4 bg-[#FDFBF7]">
        <ChatInput onSendMessage={onSendMessage} disabled={isLoading} />
        {error && <p className="text-sm text-red-600 mt-2 text-center">{error}</p>}
      </div>
    </div>
  );
};

export default ChatInterface;