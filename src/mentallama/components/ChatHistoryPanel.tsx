import * as React from 'react';
import { ChatSession } from '../types';
import { PlusIcon, TrashIcon, CloseIcon } from './icons/Icons';

interface ChatHistoryPanelProps {
  sessions: ChatSession[];
  activeSessionId: string | null;
  onNewChat: () => void;
  onSelectChat: (sessionId: string) => void;
  onDeleteChat: (sessionId: string) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const ChatHistoryPanel = ({
  sessions,
  activeSessionId,
  onNewChat,
  onSelectChat,
  onDeleteChat,
  isOpen,
  setIsOpen,
}: ChatHistoryPanelProps) => {
  
  const handleDelete = (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation(); // Prevent onSelectChat from firing
    if(window.confirm('Are you sure you want to delete this chat?')) {
        onDeleteChat(sessionId);
    }
  }

  const panelClasses = `
    w-64 flex-shrink-0 bg-calm-secondary/30 dark:bg-soft-secondary/10 flex flex-col
    transition-transform duration-300 ease-in-out
    absolute md:static inset-y-0 left-0 z-30
    ${isOpen ? 'translate-x-0' : '-translate-x-full'}
    md:translate-x-0
  `;
  
  return (
    <>
      {isOpen && (
        <div 
            onClick={() => setIsOpen(false)} 
            className="md:hidden fixed inset-0 bg-black/50 z-20"
            aria-hidden="true"
        />
      )}
      <aside className={panelClasses}>
        <div className="p-2 flex items-center justify-between border-b border-calm-secondary/50 dark:border-soft-secondary/20">
            <h2 className="text-lg font-semibold text-calm-primary dark:text-soft-primary px-2">History</h2>
            <div className="flex items-center">
                 <button onClick={onNewChat} className="p-2 rounded-md hover:bg-calm-secondary dark:hover:bg-soft-secondary" aria-label="New Chat">
                    <PlusIcon />
                </button>
                <button onClick={() => setIsOpen(false)} className="md:hidden p-2 rounded-md hover:bg-calm-secondary dark:hover:bg-soft-secondary" aria-label="Close history panel">
                    <CloseIcon />
                </button>
            </div>
        </div>
        <nav className="flex-1 overflow-y-auto">
            <ul className="p-2 space-y-1">
                {sessions.map((session: ChatSession) => (
                    <li key={session.id}>
                        <a
                            href="#"
                            onClick={(e) => { e.preventDefault(); onSelectChat(session.id); }}
                            className={`
                                group w-full text-left p-2 rounded-md flex items-center justify-between
                                ${activeSessionId === session.id 
                                    ? 'bg-calm-primary/30 dark:bg-soft-primary/30' 
                                    : 'hover:bg-calm-secondary/80 dark:hover:bg-soft-secondary/50'}
                            `}
                        >
                            <span className="truncate text-sm flex-1 pr-2">{session.title}</span>
                             <button 
                                onClick={(e) => handleDelete(e, session.id)} 
                                className="opacity-0 group-hover:opacity-100 text-calm-text/50 dark:text-soft-text/50 hover:text-red-500 transition-opacity p-1"
                                aria-label={`Delete chat: ${session.title}`}
                            >
                                <TrashIcon />
                            </button>
                        </a>
                    </li>
                ))}
            </ul>
        </nav>
      </aside>
    </>
  );
};

export default ChatHistoryPanel;
