
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Blob, GroundingChunk } from '@google/genai';
import { SYSTEM_INSTRUCTION, LIVE_API_VOICES, SAFETY_KEYWORDS } from '../constants';
import { SupportResource, Emotion } from '../types';
import { encode, decode, decodeAudioData } from '../utils/audio';
import { Spinner } from './icons/Spinner';
import { analyzeEmotion } from '../services/emotionAnalysisService';
import EmotionIndicator from './EmotionIndicator';

type CallState = 'idle' | 'connecting' | 'active' | 'ending' | 'error';

const VoiceCall: React.FC = () => {
    const [callState, setCallState] = useState<CallState>('idle');
    const [selectedVoice, setSelectedVoice] = useState(LIVE_API_VOICES[0].id);
    const [userTranscription, setUserTranscription] = useState('');
    const [modelTranscription, setModelTranscription] = useState('');
    const [latestEmotion, setLatestEmotion] = useState<Emotion | null>(null);
    const [supportResources, setSupportResources] = useState<SupportResource[]>([]);
    const lastAnalyzedTextRef = useRef<string>('');

    const sessionRef = useRef<any>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
    const outputAudioContextRef = useRef<AudioContext | null>(null);
    let nextStartTime = 0;
    const sources = new Set<AudioBufferSourceNode>();

    const handleSafetyTrigger = useCallback(async () => {
        console.log("Safety trigger activated. Finding resources...");
        setSupportResources([]);
        try {
            navigator.geolocation.getCurrentPosition(async (position) => {
                const { latitude, longitude } = position.coords;
                const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
                const response = await ai.models.generateContent({
                    model: "gemini-2.5-flash",
                    contents: "Find nearby mental health support centers, hospitals, or crisis hotlines.",
                    config: {
                        tools: [{ googleMaps: {} }],
                        toolConfig: {
                            retrievalConfig: {
                                latLng: { latitude, longitude }
                            }
                        }
                    },
                });

                const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks as GroundingChunk[];
                if (chunks) {
                    const resources: SupportResource[] = chunks
                        .filter(chunk => chunk.maps?.uri)
                        .map(chunk => ({
                            title: chunk.maps!.title,
                            uri: chunk.maps!.uri
                        }));
                    setSupportResources(resources);
                }
            }, (error) => {
                console.error("Geolocation error:", error);
                // Handle case where user denies location
            });
        } catch (error) {
            console.error("Error fetching support resources:", error);
        }
    }, []);

    useEffect(() => {
        const hasSafetyKeyword = SAFETY_KEYWORDS.some(keyword =>
            userTranscription.toLowerCase().includes(keyword)
        );
        if (hasSafetyKeyword) {
            handleSafetyTrigger();
        }
    }, [userTranscription, handleSafetyTrigger]);
    
    const startCall = async () => {
        setCallState('connecting');
        setUserTranscription('');
        setModelTranscription('');
        setSupportResources([]);
        setLatestEmotion(null);
        lastAnalyzedTextRef.current = '';
        
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaStreamRef.current = stream;

            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });

            const sessionPromise = ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                config: {
                    responseModalities: [Modality.AUDIO],
                    speechConfig: {
                        voiceConfig: { prebuiltVoiceConfig: { voiceName: selectedVoice } },
                    },
                    systemInstruction: SYSTEM_INSTRUCTION,
                    inputAudioTranscription: {},
                    outputAudioTranscription: {},
                },
                callbacks: {
                    onopen: () => {
                        console.log('Session opened.');
                        setCallState('active');
                        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
                        const source = audioContextRef.current.createMediaStreamSource(stream);
                        scriptProcessorRef.current = audioContextRef.current.createScriptProcessor(4096, 1, 1);
                        scriptProcessorRef.current.onaudioprocess = (audioProcessingEvent) => {
                            const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                            const pcmBlob: Blob = {
                                data: encode(new Uint8Array(new Int16Array(inputData.map(x => x * 32768)).buffer)),
                                mimeType: 'audio/pcm;rate=16000'
                            };
                            sessionPromise.then((session) => session.sendRealtimeInput({ media: pcmBlob }));
                        };
                        source.connect(scriptProcessorRef.current);
                        scriptProcessorRef.current.connect(audioContextRef.current.destination);
                    },
                    onmessage: async (message: LiveServerMessage) => {
                         if (message.serverContent?.inputTranscription) {
                            setUserTranscription(prev => prev + message.serverContent.inputTranscription.text);
                        }
                        if (message.serverContent?.outputTranscription) {
                            setModelTranscription(prev => prev + message.serverContent.outputTranscription.text);
                        }
                        const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
                        if (base64Audio) {
                            const audioContext = outputAudioContextRef.current!;
                            nextStartTime = Math.max(nextStartTime, audioContext.currentTime);
                            const audioBuffer = await decodeAudioData(decode(base64Audio), audioContext, 24000, 1);
                            const source = audioContext.createBufferSource();
                            source.buffer = audioBuffer;
                            source.connect(audioContext.destination);
                            source.addEventListener('ended', () => { sources.delete(source); });
                            source.start(nextStartTime);
                            nextStartTime += audioBuffer.duration;
                            sources.add(source);
                        }
                        if (message.serverContent?.interrupted) {
                            for (const source of sources.values()) {
                                source.stop();
                                sources.delete(source);
                            }
                            nextStartTime = 0;
                        }
                         if (message.serverContent?.turnComplete) {
                            const finalUser = userTranscription + (message.serverContent?.inputTranscription?.text || '');
                            
                            // Analyze emotion when turn completes
                            if (finalUser.trim() && finalUser !== lastAnalyzedTextRef.current) {
                                lastAnalyzedTextRef.current = finalUser;
                                setLatestEmotion(Emotion.ANALYZING);
                                analyzeEmotion(finalUser).then(detectedEmotion => {
                                    setLatestEmotion(detectedEmotion);
                                });
                            }
                            
                            setUserTranscription('');
                            setModelTranscription('');
                        }
                    },
                    onerror: (e: ErrorEvent) => {
                        console.error('Session error:', e);
                        setCallState('error');
                        endCall();
                    },
                    onclose: (e: CloseEvent) => {
                        console.log('Session closed.');
                        endCall();
                    },
                },
            });

            sessionRef.current = await sessionPromise;

        } catch (error) {
            console.error('Failed to start call:', error);
            setCallState('error');
        }
    };

    const endCall = () => {
        setCallState('ending');
        if (sessionRef.current) {
            sessionRef.current.close();
            sessionRef.current = null;
        }
        if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach(track => track.stop());
            mediaStreamRef.current = null;
        }
        if (scriptProcessorRef.current) {
            scriptProcessorRef.current.disconnect();
            scriptProcessorRef.current = null;
        }
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
            audioContextRef.current.close();
        }
        if (outputAudioContextRef.current && outputAudioContextRef.current.state !== 'closed') {
            outputAudioContextRef.current.close();
        }
        sources.forEach(source => source.stop());
        sources.clear();
        nextStartTime = 0;
        setCallState('idle');
    };

    const isCalling = callState === 'active' || callState === 'connecting';

    return (
        <div className="flex flex-col items-center justify-between h-full min-h-[60vh]">
            <div className="w-full flex items-center justify-between mb-4">
                <div className="flex-1">
                    <label htmlFor="voice-select" className="block mb-2 text-sm font-medium text-slate-400">
                        Select a Voice
                    </label>
                </div>
                <EmotionIndicator emotion={latestEmotion} />
            </div>
            <div className="w-full mb-4">
                <select
                    id="voice-select"
                    value={selectedVoice}
                    onChange={(e) => setSelectedVoice(e.target.value)}
                    disabled={isCalling}
                    className="bg-slate-700 border border-slate-600 text-white text-sm rounded-lg focus:ring-sky-500 focus:border-sky-500 block w-full p-2.5 disabled:opacity-50"
                >
                    {LIVE_API_VOICES.map((voice) => (
                        <option key={voice.id} value={voice.id}>{voice.name}</option>
                    ))}
                </select>
            </div>
            
            <div className="flex flex-col items-center justify-center my-8 flex-grow">
                 <button
                    onClick={isCalling ? endCall : startCall}
                    className={`relative flex items-center justify-center w-32 h-32 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg ${
                        isCalling ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
                    }`}
                >
                    {callState === 'connecting' && <Spinner className="w-12 h-12" />}
                    {callState !== 'connecting' && (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                    )}
                    {callState === 'active' && <span className="absolute w-full h-full bg-green-500 rounded-full animate-ping opacity-75"></span>}
                </button>
                <p className="mt-4 text-slate-400 capitalize">{callState}...</p>
            </div>

            <div className="w-full p-4 bg-slate-900/50 rounded-lg space-y-4">
                 {supportResources.length > 0 && (
                    <div className="p-4 border-2 border-yellow-400 bg-yellow-900/30 rounded-lg">
                        <h3 className="text-lg font-bold text-yellow-300">Important: Support Resources Nearby</h3>
                        <p className="text-sm text-yellow-200 mb-2">It sounds like you're going through a tough time. Here are some resources that can help:</p>
                        <ul className="space-y-1">
                            {supportResources.map((res, index) => (
                                <li key={index}>
                                    <a href={res.uri} target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:underline text-sm font-medium">
                                        {res.title}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
                <div>
                    <h3 className="font-bold text-sky-400">You said:</h3>
                    <p className="text-slate-300 italic min-h-[2rem]">{userTranscription || "..."}</p>
                </div>
                 <div>
                    <h3 className="font-bold text-teal-400">Serene said:</h3>
                    <p className="text-slate-300 italic min-h-[2rem]">{modelTranscription || "..."}</p>
                </div>
            </div>
        </div>
    );
};

export default VoiceCall;
