import React from 'react';
import { ConnectionState } from '../types';
import { MicIcon, MicOffIcon, SoundOnIcon, SoundOffIcon, SendIcon } from './icons/Icons';

interface ControlsProps {
  connectionState: ConnectionState;
  error: string | null;
  voiceReplyOn: boolean;
  onToggleConversation: () => void;
  onToggleVoiceReply: () => void;
  inputText: string;
  onInputTextChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSendTextMessage: () => void;
  isSendingTextMessage: boolean;
}

const Controls: React.FC<ControlsProps> = ({
  connectionState,
  error,
  voiceReplyOn,
  onToggleConversation,
  onToggleVoiceReply,
  inputText,
  onInputTextChange,
  onSendTextMessage,
  isSendingTextMessage,
}) => {
  const isVoiceSessionActive = connectionState !== ConnectionState.IDLE && connectionState !== ConnectionState.ERROR;

  const getMicButtonState = () => {
    switch (connectionState) {
      case ConnectionState.IDLE:
        return { text: 'Tap to Speak' };
      case ConnectionState.CONNECTING:
        return { text: 'Connecting...' };
      case ConnectionState.CONNECTED:
      case ConnectionState.LISTENING:
        return { text: 'Listening...' };
      case ConnectionState.ERROR:
        return { text: 'Retry Voice' };
    }
  };

  const micState = getMicButtonState();
  
  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSendTextMessage();
    }
  };

  return (
    <div className="max-w-3xl mx-auto flex flex-col items-center">
      {error && <p className="text-red-500 mb-2 text-center">{error}</p>}
      <div className="flex items-center justify-center w-full space-x-2 sm:space-x-4">
        <button
          onClick={onToggleVoiceReply}
          className="p-3 rounded-full bg-calm-secondary/80 dark:bg-soft-secondary/80 text-calm-text dark:text-soft-text hover:bg-calm-secondary dark:hover:bg-soft-secondary transition-all flex-shrink-0"
          aria-label={voiceReplyOn ? "Disable voice reply" : "Enable voice reply"}
        >
          {voiceReplyOn ? <SoundOnIcon /> : <SoundOffIcon />}
        </button>

        <div className="flex-grow flex items-center relative">
          {isVoiceSessionActive ? (
            <div className="w-full h-12 flex items-center justify-center bg-calm-secondary/50 dark:bg-soft-secondary/50 rounded-full text-calm-text/80 dark:text-soft-text/80 italic">
              {micState.text}
            </div>
          ) : (
            <>
              <input
                type="text"
                value={inputText}
                onChange={onInputTextChange}
                onKeyDown={handleInputKeyDown}
                placeholder="Type a message..."
                disabled={isSendingTextMessage}
                className="w-full h-12 px-4 pr-12 rounded-full border-2 border-calm-secondary dark:border-soft-secondary bg-calm-bg dark:bg-soft-bg text-calm-text dark:text-soft-text focus:outline-none focus:ring-2 focus:ring-calm-primary dark:focus:ring-soft-primary transition-all"
              />
              <button
                onClick={onSendTextMessage}
                disabled={!inputText.trim() || isSendingTextMessage}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-calm-primary dark:bg-soft-primary text-white disabled:bg-gray-400 dark:disabled:bg-gray-600 hover:bg-calm-accent dark:hover:bg-soft-accent transition-all"
                aria-label="Send message"
              >
                {isSendingTextMessage ? (
                  <div className="w-6 h-6 border-2 border-white rounded-full border-t-transparent animate-spin" />
                ) : (
                  <SendIcon />
                )}
              </button>
            </>
          )}
        </div>
        
        <button
          onClick={onToggleConversation}
          className={`w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg transition-all duration-300 transform hover:scale-105 flex-shrink-0
            ${connectionState === ConnectionState.LISTENING ? 'bg-red-500 hover:bg-red-600 animate-pulse' : ''}
            ${connectionState === ConnectionState.CONNECTING ? 'bg-yellow-500' : ''}
            ${connectionState === ConnectionState.IDLE || connectionState === ConnectionState.ERROR ? 'bg-calm-primary dark:bg-soft-primary hover:bg-calm-accent dark:hover:bg-soft-accent' : ''}
          `}
          aria-label={isVoiceSessionActive ? 'Stop Listening' : 'Start Listening'}
        >
          {connectionState === ConnectionState.CONNECTING ? <div className="w-6 h-6 border-2 border-white rounded-full border-t-transparent animate-spin" /> : (isVoiceSessionActive ? <MicOffIcon /> : <MicIcon />) }
        </button>
      </div>
    </div>
  );
};

export default Controls;
