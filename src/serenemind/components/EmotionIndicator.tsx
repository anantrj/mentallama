import React from 'react';
import { Emotion } from '../types';

// Emotion Icons
const EmotionJoyIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const EmotionSadnessIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const EmotionAngerIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const EmotionFearIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const EmotionSurpriseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
);

const EmotionNeutralIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const EmotionAnalyzingIcon = () => (
    <div className="w-6 h-6 border-2 border-current rounded-full border-t-transparent animate-spin" />
);

interface EmotionIndicatorProps {
  emotion: Emotion | null;
}

const emotionMap: Record<Emotion, { icon: React.FC, color: string }> = {
    [Emotion.JOY]: { icon: EmotionJoyIcon, color: 'text-yellow-400' },
    [Emotion.SADNESS]: { icon: EmotionSadnessIcon, color: 'text-blue-400' },
    [Emotion.ANGER]: { icon: EmotionAngerIcon, color: 'text-red-400' },
    [Emotion.FEAR]: { icon: EmotionFearIcon, color: 'text-purple-400' },
    [Emotion.SURPRISE]: { icon: EmotionSurpriseIcon, color: 'text-pink-400' },
    [Emotion.NEUTRAL]: { icon: EmotionNeutralIcon, color: 'text-gray-400' },
    [Emotion.ANALYZING]: { icon: EmotionAnalyzingIcon, color: 'text-sky-400' },
};

const EmotionIndicator: React.FC<EmotionIndicatorProps> = ({ emotion }) => {
  if (!emotion) return null;

  const { icon: IconComponent, color } = emotionMap[emotion];

  return (
    <div className="flex items-center space-x-2 p-2 rounded-full bg-slate-800/50 transition-all duration-300">
      <div className={color}>
        <IconComponent />
      </div>
      <span className="text-sm font-medium text-slate-200">{emotion}</span>
    </div>
  );
};

export default EmotionIndicator;

