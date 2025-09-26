import React from 'react';
import { ChatMessage } from '../types';
import RecommendationCard from './RecommendationCard';
import MultiRecommendation from './MultiRecommendation';

interface MessageProps {
  message: ChatMessage;
}

const Message: React.FC<MessageProps> = ({ message }) => {
  const isUser = message.role === 'user';
  const animationClass = isUser ? 'animate-slide-in-right' : 'animate-slide-in-left';
  
  const baseClasses = 'px-4 py-3 rounded-lg inline-block max-w-lg';
  const userClasses = `bg-[#8C5A3A] text-white ${baseClasses}`;
  const botClasses = `bg-[#EAE1D9] text-[#402E26] ${baseClasses}`;

  const hasRecommendations = message.recommendations && message.recommendations.length > 0;

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      {hasRecommendations ? (
        <div className={animationClass}>
          {message.recommendations!.length > 1 ? (
              <MultiRecommendation recommendations={message.recommendations!} />
          ) : (
              <RecommendationCard recommendation={message.recommendations![0]} />
          )}
        </div>
      ) : (
        <div className={`${isUser ? userClasses : botClasses} ${animationClass}`} style={{ whiteSpace: 'pre-wrap' }}>
          {message.text}
        </div>
      )}
    </div>
  );
};

export default Message;