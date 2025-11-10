// FIX: Removed self-import of 'ChatSession' which conflicted with its local declaration.
import React from 'react';

export enum MessageSender {
  USER = 'user',
  AI = 'ai',
}

export enum Emotion {
  JOY = 'Joy',
  SADNESS = 'Sadness',
  ANGER = 'Anger',
  FEAR = 'Fear',
  SURPRISE = 'Surprise',
  NEUTRAL = 'Neutral',
  ANALYZING = 'Analyzing...',
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: MessageSender;
  timestamp: string;
  emotion?: Emotion;
}

export interface CopingStrategy {
  title: string;
  description: string;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
}

export enum Theme {
    CALM = 'calm',
    SOFT = 'soft',
}

export enum ThemeMode {
    LIGHT = 'light',
    DARK = 'dark',
}

export enum ConnectionState {
  IDLE = 'idle',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  LISTENING = 'listening',
  ERROR = 'error',
}