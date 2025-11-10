import React from 'react';
import { Emotion } from '../types';
import { 
    EmotionJoyIcon, 
    EmotionSadnessIcon, 
    EmotionAngerIcon, 
    EmotionFearIcon, 
    EmotionSurpriseIcon, 
    EmotionNeutralIcon,
    EmotionAnalyzingIcon
} from './icons/Icons';

interface EmotionIndicatorProps {
  emotion: Emotion | null;
}

const emotionMap: Record<Emotion, { icon: React.FC, color: string }> = {
    [Emotion.JOY]: { icon: EmotionJoyIcon, color: 'text-yellow-500' },
    [Emotion.SADNESS]: { icon: EmotionSadnessIcon, color: 'text-blue-500' },
    [Emotion.ANGER]: { icon: EmotionAngerIcon, color: 'text-red-500' },
    [Emotion.FEAR]: { icon: EmotionFearIcon, color: 'text-purple-500' },
    [Emotion.SURPRISE]: { icon: EmotionSurpriseIcon, color: 'text-pink-500' },
    [Emotion.NEUTRAL]: { icon: EmotionNeutralIcon, color: 'text-gray-500' },
    [Emotion.ANALYZING]: { icon: EmotionAnalyzingIcon, color: 'text-calm-primary dark:text-soft-primary' },
};


const EmotionIndicator: React.FC<EmotionIndicatorProps> = ({ emotion }) => {
  if (!emotion) return null;

  const { icon: IconComponent, color } = emotionMap[emotion];

  return (
    <div className="flex items-center space-x-2 p-2 rounded-full bg-calm-bg/50 dark:bg-soft-bg/50 transition-all duration-300 animate-fadeIn">
      <div className={color}>
        <IconComponent />
      </div>
      <span className="text-sm font-medium text-calm-text dark:text-soft-text">{emotion}</span>
    </div>
  );
};

export default EmotionIndicator;