import { GoogleGenAI } from "@google/genai";
import { ChatMessage } from '../types';

export const generateChatTitle = async (messages: ChatMessage[]): Promise<string> => {
  if (messages.length < 1) return "New Chat";

  const conversation = messages
    .slice(0, 4) // Use first few messages for brevity
    .map(msg => `${msg.sender === 'user' ? 'User' : 'AI'}: ${msg.text}`)
    .join('\n');

  const prompt = `Generate a very short, concise title (3-5 words max) for the following conversation. The title should be neutral and descriptive. Do not use quotes.\n\n${conversation}`;

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text.trim().replace(/["'*]/g, "");
  } catch (error) {
    console.error("Error generating chat title:", error);
    return "Chat Summary"; // Fallback title
  }
};
