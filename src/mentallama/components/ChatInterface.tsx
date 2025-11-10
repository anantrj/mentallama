import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChatMessage, MessageSender, Theme, ThemeMode, ConnectionState, ChatSession, Emotion, CopingStrategy } from '../types';
import useLocalStorage from '../hooks/useLocalStorage';
import useGeminiLive from '../hooks/useGeminiLive';
import useGeminiChat from '../hooks/useGeminiChat';
import { useAudioPlayer } from '../hooks/useAudioPlayer';
import { generateSpeech } from '../services/ttsService';
import { analyzeEmotion } from '../services/emotionAnalysisService';
import { getCopingStrategy } from '../services/ragService';
import { DAILY_CHECK_IN_QUESTIONS } from '../constants';
import MessageBubble from './MessageBubble';
import Controls from './Controls';
import EmotionIndicator from './EmotionIndicator';
import CopingStrategyCard from './CopingStrategyCard';
import { CheckInIcon } from './icons/Icons';

interface ChatInterfaceProps {
  session: ChatSession | null;
  onUpdateMessages: (messages: ChatMessage[]) => void;
  onNewChat: () => string;
  theme: Theme;
  themeMode: ThemeMode;
  toggleTheme: () => void;
  toggleThemeMode: () => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ session, onUpdateMessages, onNewChat, theme, themeMode, toggleTheme, toggleThemeMode }) => {
  const [voiceReplyOn, setVoiceReplyOn] = useLocalStorage<boolean>('voiceReplyOn', true);
  const [inputText, setInputText] = useState('');
  const [latestEmotion, setLatestEmotion] = useState<Emotion | null>(null);
  const [checkInStep, setCheckInStep] = useState<number | null>(null);
  const [suggestedStrategy, setSuggestedStrategy] = useState<CopingStrategy | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const messages = session?.messages || [];
  
  const { play: playAudio } = useAudioPlayer({ voiceReplyOn });
  const { sendMessage: sendTextMessage, isLoading: isSendingTextMessage, error: chatError } = useGeminiChat();

  const handlePostResponseActions = useCallback(async (responseSession: ChatSession) => {
    const lastUserMessage = [...responseSession.messages].reverse().find(m => m.sender === MessageSender.USER);
    if (lastUserMessage && !lastUserMessage.emotion) {
      setLatestEmotion(Emotion.ANALYZING);
      const detectedEmotion = await analyzeEmotion(lastUserMessage.text);
      setLatestEmotion(detectedEmotion);
      
      const updatedMessages = responseSession.messages.map(m => 
          m.id === lastUserMessage.id ? { ...m, emotion: detectedEmotion } : m
      );
      onUpdateMessages(updatedMessages);

      // RAG: Trigger coping strategy if emotion is negative
      if ([Emotion.SADNESS, Emotion.ANGER, Emotion.FEAR].includes(detectedEmotion)) {
          const strategy = await getCopingStrategy(lastUserMessage.text);
          setSuggestedStrategy(strategy);
      }
    }
    
    // Daily Check-in logic
    if (checkInStep !== null) {
      const nextStep = checkInStep + 1;
      let nextQuestion = DAILY_CHECK_IN_QUESTIONS[nextStep];
      if (!nextQuestion) {
        nextQuestion = "Thank you for sharing. I'm here if you need to talk more.";
        setCheckInStep(null);
      } else {
        setCheckInStep(nextStep);
      }
      
      const aiQuestionMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        text: nextQuestion,
        sender: MessageSender.AI,
        timestamp: new Date().toLocaleTimeString(),
      };

      setTimeout(async () => {
        onUpdateMessages([...responseSession.messages, aiQuestionMessage]);
        if (voiceReplyOn) {
            const audioBase64 = await generateSpeech(nextQuestion);
            if (audioBase64) playAudio(audioBase64);
        }
      }, 500);
    }
  }, [checkInStep, onUpdateMessages, playAudio, voiceReplyOn]);

  const onTurnComplete = (userMessage: string, aiMessage: string) => {
    if (userMessage.trim() || aiMessage.trim()) {
      const newMessages: ChatMessage[] = [];
      if (userMessage.trim()) {
        newMessages.push({
          id: `user-${Date.now()}`,
          text: userMessage,
          sender: MessageSender.USER,
          timestamp: new Date().toLocaleTimeString(),
        });
      }
       if (aiMessage.trim()) {
        newMessages.push({
          id: `ai-${Date.now() + 1}`,
          text: aiMessage,
          sender: MessageSender.AI,
          timestamp: new Date().toLocaleTimeString(),
        });
      }
      const updatedMessages = [...messages, ...newMessages]
      onUpdateMessages(updatedMessages);
      handlePostResponseActions({ ...session!, messages: updatedMessages });
    }
  };

  const {
    connectionState,
    error: liveError,
    startConversation,
    stopConversation,
    userTranscript,
    aiTranscript,
  } = useGeminiLive({ onTurnComplete, playAudio });

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, userTranscript, aiTranscript]);
  
  const handleStartCheckIn = async () => {
    stopConversation();
    setLatestEmotion(null);
    setSuggestedStrategy(null);
    
    // Start check-in in the current session - append to existing messages
    const firstQuestion = DAILY_CHECK_IN_QUESTIONS[0];
    const aiMessage: ChatMessage = {
      id: `ai-checkin-${Date.now()}`,
      text: firstQuestion,
      sender: MessageSender.AI,
      timestamp: new Date().toLocaleTimeString(),
    };
    // Append to existing messages instead of replacing them
    const updatedMessages = [...messages, aiMessage];
    onUpdateMessages(updatedMessages);
    setCheckInStep(0);

    if (voiceReplyOn) {
        const audioBase64 = await generateSpeech(firstQuestion);
        if (audioBase64) playAudio(audioBase64);
    }
  };

  const handleToggleConversation = () => {
    if (connectionState === ConnectionState.IDLE || connectionState === ConnectionState.ERROR) {
      setInputText('');
      setLatestEmotion(null); 
      setCheckInStep(null);
      setSuggestedStrategy(null);
      startConversation();
    } else {
      stopConversation();
    }
  };
  
  const handleSendTextMessage = async () => {
    if (!inputText.trim() || isSendingTextMessage || connectionState !== ConnectionState.IDLE) return;
    
    setSuggestedStrategy(null);
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      text: inputText,
      sender: MessageSender.USER,
      timestamp: new Date().toLocaleTimeString(),
    };
    
    const tempAiMessageId = `ai-${Date.now() + 1}`;
    const tempAiMessage: ChatMessage = {
      id: tempAiMessageId,
      text: '...',
      sender: MessageSender.AI,
      timestamp: new Date().toLocaleTimeString(),
    }
    
    const messagesWithUser = [...messages, userMessage];
    onUpdateMessages([...messagesWithUser, tempAiMessage]);
    const currentInput = inputText;
    setInputText('');

    const aiResponseText = await sendTextMessage(messages, currentInput);
    
    if (aiResponseText) {
      const finalAiMessage: ChatMessage = {
        id: tempAiMessageId,
        text: aiResponseText,
        sender: MessageSender.AI,
        timestamp: new Date().toLocaleTimeString(),
      };
      const finalMessages = [...messagesWithUser, finalAiMessage];
      onUpdateMessages(finalMessages);

      if (voiceReplyOn) {
        const audioBase64 = await generateSpeech(aiResponseText);
        if (audioBase64) playAudio(audioBase64);
      }
      handlePostResponseActions({ ...session!, messages: finalMessages });
    } else {
       onUpdateMessages(messagesWithUser);
    }
  };

  return (
    <div className="flex flex-col h-full bg-calm-bg dark:bg-soft-bg">
      <header className="p-4 bg-calm-secondary/50 dark:bg-soft-secondary/20 backdrop-blur-md shadow-sm z-10 flex justify-between items-center">
        <EmotionIndicator emotion={latestEmotion} />
        <div className="flex items-center space-x-2">
            <button 
              onClick={handleStartCheckIn} 
              className="p-2 rounded-full hover:bg-calm-secondary/50 transition-colors flex items-center space-x-2" 
              aria-label="Start daily check-in"
              title="Start Daily Check-In"
            >
              <CheckInIcon />
            </button>
            <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-calm-secondary/50 transition-colors" aria-label="Toggle theme color">
                🎨
            </button>
            <button onClick={toggleThemeMode} className="p-2 rounded-full hover:bg-calm-secondary/50 transition-colors" aria-label="Toggle light/dark mode">
                {themeMode === 'light' ? '🌙' : '☀️'}
            </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 pb-48">
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.map(msg => (
            <MessageBubble key={msg.id} message={msg} isTyping={msg.text === '...'} />
          ))}
          {userTranscript && (
            <MessageBubble message={{ id: 'temp-user', text: userTranscript, sender: MessageSender.USER, timestamp: '...' }} isTyping={true} />
          )}
          {aiTranscript && (
            <MessageBubble message={{ id: 'temp-ai', text: aiTranscript, sender: MessageSender.AI, timestamp: '...' }} isTyping={true} />
          )}
          <div ref={chatEndRef} />
        </div>
        {messages.length === 0 && !userTranscript && (
          <div className="text-center text-calm-text/60 dark:text-soft-text/60 absolute inset-0 flex flex-col items-center justify-center -z-10">
            <p className="text-lg">Start a conversation with MentaLLaMA</p>
            <p className="text-sm">Type a message or click the microphone to begin</p>
          </div>
        )}
      </main>

      <footer className="fixed bottom-0 left-0 md:left-64 right-0 p-4 bg-gradient-to-t from-calm-bg dark:from-soft-bg via-calm-bg dark:via-soft-bg to-transparent">
        <div className="max-w-3xl mx-auto">
            {suggestedStrategy && (
                <CopingStrategyCard 
                    strategy={suggestedStrategy} 
                    onDismiss={() => setSuggestedStrategy(null)} 
                />
            )}
            <Controls
                connectionState={connectionState}
                error={liveError || chatError}
                voiceReplyOn={voiceReplyOn}
                onToggleConversation={handleToggleConversation}
                onToggleVoiceReply={() => setVoiceReplyOn(v => !v)}
                inputText={inputText}
                onInputTextChange={(e) => setInputText(e.target.value)}
                onSendTextMessage={handleSendTextMessage}
                isSendingTextMessage={isSendingTextMessage}
            />
        </div>
      </footer>
    </div>
  );
};

export default ChatInterface;