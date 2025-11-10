import React from 'react';
import { ChatMessage, MessageSender } from '../types';

interface MessageBubbleProps {
  message: ChatMessage;
  isTyping?: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isTyping = false }) => {
  const isUser = message.sender === MessageSender.USER;

  const bubbleClasses = isUser
    ? 'bg-calm-primary text-white dark:bg-soft-primary dark:text-soft-bg'
    : 'bg-calm-secondary text-calm-text dark:bg-soft-secondary dark:text-soft-text';
  
  const alignmentClasses = isUser ? 'justify-end' : 'justify-start';

  return (
    <div className={`flex ${alignmentClasses} animate-fadeIn`}>
      <div className={`max-w-md lg:max-w-lg px-4 py-3 rounded-2xl shadow-md ${bubbleClasses}`}>
        <p className={`whitespace-pre-wrap ${isTyping ? 'italic opacity-80' : ''}`}>{message.text}{isTyping ? '...' : ''}</p>
        {!isTyping && (
          <p className={`text-xs mt-1 ${isUser ? 'text-gray-200/70' : 'text-calm-text/60 dark:text-soft-text/60'} text-right`}>
            {message.timestamp}
          </p>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;
