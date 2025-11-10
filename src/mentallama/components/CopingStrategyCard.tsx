import React from 'react';
import { CopingStrategy } from '../types';
import { LightbulbIcon, CloseIcon } from './icons/Icons';

interface CopingStrategyCardProps {
  strategy: CopingStrategy;
  onDismiss: () => void;
}

const CopingStrategyCard: React.FC<CopingStrategyCardProps> = ({ strategy, onDismiss }) => {
  return (
    <div className="mb-4 p-4 border border-calm-primary/50 dark:border-soft-primary/50 bg-calm-secondary/30 dark:bg-soft-secondary/20 rounded-lg shadow-lg animate-fadeIn relative">
      <button 
        onClick={onDismiss} 
        className="absolute top-2 right-2 p-1 text-calm-text/50 hover:text-calm-text dark:text-soft-text/50 dark:hover:text-soft-text"
        aria-label="Dismiss suggestion"
      >
        <CloseIcon />
      </button>
      <div className="flex items-center mb-2">
        <LightbulbIcon />
        <h3 className="ml-2 font-bold text-calm-primary dark:text-soft-primary">Coping Strategy Suggestion</h3>
      </div>
      <h4 className="font-semibold text-lg mb-1">{strategy.title}</h4>
      <p className="text-sm whitespace-pre-wrap">{strategy.description}</p>
    </div>
  );
};

export default CopingStrategyCard;