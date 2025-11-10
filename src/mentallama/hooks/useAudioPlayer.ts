import { useRef, useEffect, useCallback } from 'react';
import { decodeAudioData } from '../services/audioUtils';
import { OUTPUT_SAMPLE_RATE } from '../constants';

interface UseAudioPlayerProps {
  voiceReplyOn: boolean;
}

export const useAudioPlayer = ({ voiceReplyOn }: UseAudioPlayerProps) => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const nextAudioStartTimeRef = useRef<number>(0);
  const audioPlaybackQueueRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  // Initialize AudioContext
  useEffect(() => {
    if (!audioContextRef.current) {
      try {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: OUTPUT_SAMPLE_RATE });
        gainNodeRef.current = audioContextRef.current.createGain();
        gainNodeRef.current.connect(audioContextRef.current.destination);
      } catch (e) {
        console.error("Failed to create AudioContext:", e);
      }
    }

    return () => {
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(console.error);
      }
      audioContextRef.current = null;
      gainNodeRef.current = null;
      audioPlaybackQueueRef.current.forEach(source => source.stop());
      audioPlaybackQueueRef.current.clear();
    };
  }, []);

  // Control volume based on voiceReplyOn prop
  useEffect(() => {
    if (gainNodeRef.current && audioContextRef.current) {
      gainNodeRef.current.gain.setValueAtTime(voiceReplyOn ? 1 : 0, audioContextRef.current.currentTime);
    }
  }, [voiceReplyOn]);

  const play = useCallback(async (base64: string) => {
    if (!audioContextRef.current || !gainNodeRef.current) return;
    
    try {
      const audioCtx = audioContextRef.current;
      
      if (audioCtx.state === 'suspended') {
        await audioCtx.resume();
      }

      nextAudioStartTimeRef.current = Math.max(nextAudioStartTimeRef.current, audioCtx.currentTime);
      
      const audioBuffer = await decodeAudioData(base64, audioCtx, OUTPUT_SAMPLE_RATE, 1);
      
      const source = audioCtx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(gainNodeRef.current!);
      source.addEventListener('ended', () => {
          audioPlaybackQueueRef.current.delete(source);
      });
      
      source.start(nextAudioStartTimeRef.current);
      nextAudioStartTimeRef.current += audioBuffer.duration;
      audioPlaybackQueueRef.current.add(source);
    } catch (error) {
      console.error("Error playing audio:", error);
    }
  }, []);

  return { play };
};
