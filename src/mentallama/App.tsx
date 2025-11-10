import React, { useState, useEffect, useCallback } from 'react';
import ChatInterface from './components/ChatInterface';
import ChatHistoryPanel from './components/ChatHistoryPanel';
import { Theme, ThemeMode, ChatSession, ChatMessage } from './types';
import useLocalStorage from './hooks/useLocalStorage';
import { generateChatTitle } from './services/titleGenerator';
import { MenuIcon } from './components/icons/Icons';

const App: React.FC = () => {
  const [theme, setTheme] = useLocalStorage<Theme>('theme', Theme.CALM);
  const [themeMode, setThemeMode] = useLocalStorage<ThemeMode>('themeMode', ThemeMode.LIGHT);
  const [sessions, setSessions] = useLocalStorage<ChatSession[]>('chatSessions', []);
  const [activeSessionId, setActiveSessionId] = useLocalStorage<string | null>('activeSessionId', null);
  const [isHistoryPanelOpen, setIsHistoryPanelOpen] = useState(false);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('theme-calm-light', 'theme-calm-dark', 'theme-soft-light', 'theme-soft-dark');
    root.classList.add(`theme-${theme}-${themeMode}`);
    document.body.className = `bg-calm-bg text-calm-text transition-colors duration-500`;
    if (themeMode === ThemeMode.DARK) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme, themeMode]);
  
  // Create a default session if none exist
  useEffect(() => {
    if (sessions.length === 0) {
      const newSessionId = `session-${Date.now()}`;
      const newSession: ChatSession = {
        id: newSessionId,
        title: 'New Chat',
        messages: [],
        createdAt: new Date().toISOString(),
      };
      setSessions([newSession]);
      setActiveSessionId(newSessionId);
    } else if (!activeSessionId || !sessions.find(s => s.id === activeSessionId)) {
        setActiveSessionId(sessions[0]?.id || null);
    }
  }, [sessions, setSessions, activeSessionId, setActiveSessionId]);

  const activeSession = sessions.find(s => s.id === activeSessionId) || null;

  const toggleTheme = () => setTheme(current => (current === Theme.CALM ? Theme.SOFT : Theme.CALM));
  const toggleThemeMode = () => setThemeMode(current => (current === ThemeMode.LIGHT ? ThemeMode.DARK : ThemeMode.LIGHT));
  
  const handleNewChat = useCallback(() => {
    const newSessionId = `session-${Date.now()}`;
    const newSession: ChatSession = {
      id: newSessionId,
      title: 'New Chat',
      messages: [],
      createdAt: new Date().toISOString(),
    };
    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newSessionId);
    setIsHistoryPanelOpen(false);
    return newSessionId;
  }, [setSessions, setActiveSessionId]);

  const handleDeleteChat = useCallback((sessionId: string) => {
    setSessions(prevSessions => {
      const remainingSessions = prevSessions.filter(s => s.id !== sessionId);
      if (activeSessionId === sessionId) {
        setActiveSessionId(remainingSessions[0]?.id || null);
      }
      return remainingSessions;
    });
  }, [activeSessionId, setSessions, setActiveSessionId]);

  const handleSelectChat = (sessionId: string) => {
    setActiveSessionId(sessionId);
    setIsHistoryPanelOpen(false);
  };
  
  const generateAndSetTitleIfNeeded = async (sessionId: string, messages: ChatMessage[]) => {
      const session = sessions.find(s => s.id === sessionId);
      if(session && session.title === 'New Chat' && messages.length >= 2) {
          const newTitle = await generateChatTitle(messages);
          setSessions(prev => prev.map(s => s.id === sessionId ? {...s, title: newTitle} : s));
      }
  }

  const handleUpdateMessages = (newMessages: ChatMessage[]) => {
    if (!activeSessionId) return;
    setSessions(prev =>
      prev.map(s =>
        s.id === activeSessionId
          ? { ...s, messages: newMessages }
          : s
      )
    );
    generateAndSetTitleIfNeeded(activeSessionId, newMessages);
  };

  if (!process.env.API_KEY) {
    return (
      <div className="flex items-center justify-center h-screen bg-red-100 text-red-800">
        <div className="text-center p-8 bg-white rounded-lg shadow-md">
          <h1 className="text-2xl font-bold mb-4">API Key Not Found</h1>
          <p>Please make sure the Gemini API key is set in your environment variables.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex overflow-hidden">
        <ChatHistoryPanel 
            sessions={sessions}
            activeSessionId={activeSessionId}
            onNewChat={handleNewChat}
            onSelectChat={handleSelectChat}
            onDeleteChat={handleDeleteChat}
            isOpen={isHistoryPanelOpen}
            setIsOpen={setIsHistoryPanelOpen}
        />
        <div className="flex-1 flex flex-col relative">
            <button 
                onClick={() => setIsHistoryPanelOpen(true)}
                className="md:hidden absolute top-4 left-4 z-20 p-2 rounded-full bg-calm-secondary/50 hover:bg-calm-secondary/80"
                aria-label="Open chat history"
            >
                <MenuIcon />
            </button>
            <ChatInterface
                session={activeSession}
                onUpdateMessages={handleUpdateMessages}
                onNewChat={handleNewChat}
                theme={theme}
                themeMode={themeMode}
                toggleTheme={toggleTheme}
                toggleThemeMode={toggleThemeMode}
            />
        </div>
    </div>
  );
};

export default App;