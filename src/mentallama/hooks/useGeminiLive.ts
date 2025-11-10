import { useState, useRef, useCallback, useEffect } from 'react';
import { GoogleGenAI, LiveSession, LiveServerMessage, Modality, Blob } from "@google/genai";
import { ConnectionState } from '../types';
import { encode } from '../services/audioUtils';
import { GEMINI_MODEL_NAME, SYSTEM_INSTRUCTION, INPUT_SAMPLE_RATE, SCRIPT_PROCESSOR_BUFFER_SIZE } from '../constants';

interface UseGeminiLiveProps {
  onTurnComplete: (userMessage: string, aiMessage: string) => void;
  playAudio: (base64: string) => void;
}

const useGeminiLive = ({ onTurnComplete, playAudio }: UseGeminiLiveProps) => {
  const [connectionState, setConnectionState] = useState<ConnectionState>(ConnectionState.IDLE);
  const [error, setError] = useState<string | null>(null);
  const [userTranscript, setUserTranscript] = useState('');
  const [aiTranscript, setAiTranscript] = useState('');

  const sessionPromiseRef = useRef<Promise<LiveSession> | null>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const mediaStreamSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  const currentInputTranscriptRef = useRef('');
  const currentOutputTranscriptRef = useRef('');

  const stopConversation = useCallback(() => {
    setConnectionState(ConnectionState.IDLE);
    setUserTranscript('');
    setAiTranscript('');
    currentInputTranscriptRef.current = '';
    currentOutputTranscriptRef.current = '';

    if (sessionPromiseRef.current) {
      sessionPromiseRef.current.then(session => session.close());
      sessionPromiseRef.current = null;
    }
    
    mediaStreamRef.current?.getTracks().forEach(track => track.stop());
    mediaStreamRef.current = null;
    
    if (scriptProcessorRef.current) {
        scriptProcessorRef.current.disconnect();
        scriptProcessorRef.current.onaudioprocess = null;
        scriptProcessorRef.current = null;
    }
    if (mediaStreamSourceRef.current) {
        mediaStreamSourceRef.current.disconnect();
        mediaStreamSourceRef.current = null;
    }

    if (inputAudioContextRef.current?.state !== 'closed') {
      inputAudioContextRef.current?.close().catch(console.error);
    }
    inputAudioContextRef.current = null;

  }, []);
  
  const startConversation = useCallback(async () => {
    setError(null);
    setConnectionState(ConnectionState.CONNECTING);
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

      inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: INPUT_SAMPLE_RATE });
      await inputAudioContextRef.current.resume();

      sessionPromiseRef.current = ai.live.connect({
        model: GEMINI_MODEL_NAME,
        config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
            systemInstruction: SYSTEM_INSTRUCTION,
            inputAudioTranscription: {},
            outputAudioTranscription: {},
        },
        callbacks: {
          onopen: () => {
            setConnectionState(ConnectionState.CONNECTED);
            
            mediaStreamSourceRef.current = inputAudioContextRef.current!.createMediaStreamSource(stream);
            scriptProcessorRef.current = inputAudioContextRef.current!.createScriptProcessor(SCRIPT_PROCESSOR_BUFFER_SIZE, 1, 1);
            
            scriptProcessorRef.current.onaudioprocess = (audioProcessingEvent) => {
              const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
              const l = inputData.length;
              const int16 = new Int16Array(l);
              for (let i = 0; i < l; i++) {
                int16[i] = inputData[i] * 32768;
              }
              const pcmBlob: Blob = {
                data: encode(new Uint8Array(int16.buffer)),
                mimeType: `audio/pcm;rate=${INPUT_SAMPLE_RATE}`,
              };

              if (sessionPromiseRef.current) {
                sessionPromiseRef.current.then((session) => {
                    session.sendRealtimeInput({ media: pcmBlob });
                });
              }
            };
            
            mediaStreamSourceRef.current.connect(scriptProcessorRef.current);
            scriptProcessorRef.current.connect(inputAudioContextRef.current!.destination);
            setConnectionState(ConnectionState.LISTENING);
          },
          onmessage: async (message: LiveServerMessage) => {
            // Handle transcripts
            if (message.serverContent?.inputTranscription) {
                currentInputTranscriptRef.current += message.serverContent.inputTranscription.text;
                setUserTranscript(currentInputTranscriptRef.current);
            }
            if (message.serverContent?.outputTranscription) {
                currentOutputTranscriptRef.current += message.serverContent.outputTranscription.text;
                setAiTranscript(currentOutputTranscriptRef.current);
            }
            if (message.serverContent?.turnComplete) {
                onTurnComplete(currentInputTranscriptRef.current, currentOutputTranscriptRef.current);
                currentInputTranscriptRef.current = '';
                currentOutputTranscriptRef.current = '';
                setUserTranscript('');
                setAiTranscript('');
            }

            // Handle audio
            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio) {
                playAudio(base64Audio);
            }
          },
          onerror: (e: any) => {
            console.error('Gemini Live Error:', e);
            setError(`Connection failed: ${e.message || 'Unknown error'}`);
            stopConversation();
          },
          onclose: () => {
             stopConversation();
          },
        }
      });
    } catch (err: any) {
      console.error("Failed to start conversation:", err);
      let errorMessage = "An unexpected error occurred.";
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          errorMessage = "Microphone access denied. Please allow microphone access in your browser settings.";
      } else if (err.message) {
          errorMessage = err.message;
      }
      setError(errorMessage);
      setConnectionState(ConnectionState.ERROR);
      stopConversation();
    }
  }, [stopConversation, onTurnComplete, playAudio]);

  useEffect(() => {
    return () => {
      stopConversation();
    }
  }, [stopConversation]);

  return { connectionState, error, startConversation, stopConversation, userTranscript, aiTranscript };
};

export default useGeminiLive;
