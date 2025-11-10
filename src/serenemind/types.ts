
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
  role: 'user' | 'model';
  text: string;
}

export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
  maps?: {
    uri: string;
    title: string;
    placeAnswerSources?: {
        reviewSnippets: {
            uri: string;
            text: string;
        }[]
    }[]
  };
}

export interface SupportResource {
  title: string;
  uri: string;
}
