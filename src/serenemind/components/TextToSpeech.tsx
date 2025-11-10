import React, { useState, useRef } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';
import { TTS_VOICES } from '../constants';
import { decode, decodeAudioData } from '../utils/audio';
import { Spinner } from './icons/Spinner';
import { SpeakerIcon } from './icons/SpeakerIcon';

type TTSState = 'idle' | 'loading' | 'error';

const TextToSpeech: React.FC = () => {
  const [text, setText] = useState('Hello! Have a wonderful day.');
  const [selectedVoice, setSelectedVoice] = useState(TTS_VOICES[0].id);
  const [ttsState, setTtsState] = useState<TTSState>('idle');
  const audioContextRef = useRef<AudioContext | null>(null);

  const handleSpeak = async () => {
    if (!text.trim()) return;
    setTtsState('loading');
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-preview-tts',
        contents: [{ parts: [{ text }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: selectedVoice },
            },
          },
        },
      });
      
      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
          audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        }
        const audioContext = audioContextRef.current;
        const audioBuffer = await decodeAudioData(decode(base64Audio), audioContext, 24000, 1);
        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContext.destination);
        source.start();
        setTtsState('idle');
      } else {
        throw new Error("No audio data received from API.");
      }
    } catch (error) {
      console.error("TTS Error:", error);
      setTtsState('error');
    }
  };

  return (
    <div className="space-y-6 max-w-lg mx-auto">
      <div>
        <h2 className="text-xl font-semibold mb-2 text-sky-400">Text-to-Speech</h2>
        <p className="text-slate-400 text-sm">
          Type some text, choose a voice, and hear it spoken aloud.
        </p>
      </div>
      <div className="space-y-4">
        <div>
          <label htmlFor="tts-text" className="block mb-2 text-sm font-medium text-slate-300">
            Text to Speak
          </label>
          <textarea
            id="tts-text"
            rows={4}
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 focus:ring-2 focus:ring-sky-500 focus:outline-none transition"
            placeholder="Enter text here..."
          />
        </div>
        <div>
          <label htmlFor="tts-voice" className="block mb-2 text-sm font-medium text-slate-300">
            Voice
          </label>
          <select
            id="tts-voice"
            value={selectedVoice}
            onChange={(e) => setSelectedVoice(e.target.value)}
            className="bg-slate-700 border border-slate-600 text-white text-sm rounded-lg focus:ring-sky-500 focus:border-sky-500 block w-full p-2.5"
          >
            {TTS_VOICES.map((voice) => (
              <option key={voice.id} value={voice.id}>{voice.name}</option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <button
          onClick={handleSpeak}
          disabled={ttsState === 'loading'}
          className="w-full flex items-center justify-center gap-2 bg-sky-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-sky-700 transition-colors disabled:bg-slate-600 disabled:cursor-not-allowed"
        >
          {/* fix: Use imported SpeakerIcon component */}
          {ttsState === 'loading' ? <Spinner /> : <SpeakerIcon className="w-5 h-5"/>}
          {ttsState === 'loading' ? 'Generating...' : 'Speak'}
        </button>
        {ttsState === 'error' && (
          <p className="text-red-400 text-sm mt-2 text-center">
            Sorry, an error occurred while generating audio. Please try again.
          </p>
        )}
      </div>
    </div>
  );
};

export default TextToSpeech;