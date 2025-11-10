import { useState } from 'react';
import { GoogleGenAI, Chat, Content } from "@google/genai";
import { ChatMessage, MessageSender } from '../types';
import { SYSTEM_INSTRUCTION } from '../constants';

const useGeminiChat = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = async (history: ChatMessage[], newMessage: string): Promise<string | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
      
      const formattedHistory: Content[] = history
        .filter(msg => msg.text !== '...') // Exclude typing indicators from history
        .map(msg => ({
          role: msg.sender === MessageSender.USER ? 'user' : 'model',
          parts: [{ text: msg.text }]
      }));

      const chat: Chat = ai.chats.create({
        model: 'gemini-2.5-flash', // Non-audio model is better for text chat
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
        },
        history: formattedHistory,
      });
      
      const response = await chat.sendMessage({ message: newMessage });

      setIsLoading(false);
      return response.text;

    } catch (err: any) {
      console.error("Gemini Chat Error:", err);
      setError(err.message || "An error occurred while sending the message.");
      setIsLoading(false);
      return null;
    }
  };

  return { sendMessage, isLoading, error };
};

export default useGeminiChat;
