import { GoogleGenAI } from "@google/genai";
import { Emotion } from "../types";

const validEmotions = Object.values(Emotion).filter(e => e !== Emotion.ANALYZING);

export const analyzeEmotion = async (text: string): Promise<Emotion> => {
  if (!text.trim()) return Emotion.NEUTRAL;

  const prompt = `Analyze the predominant emotion of the following text. Respond with only one of these exact words: ${validEmotions.join(', ')}.\n\nText: "${text}"`;

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    const resultText = response.text.trim();

    // Check if the response is a valid emotion
    const foundEmotion = Object.values(Emotion).find(e => e.toLowerCase() === resultText.toLowerCase());
    
    return foundEmotion || Emotion.NEUTRAL;

  } catch (error) {
    console.error("Error analyzing emotion:", error);
    return Emotion.NEUTRAL; // Fallback on error
  }
};

