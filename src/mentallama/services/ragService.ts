import { GoogleGenAI } from "@google/genai";
import { CopingStrategy } from '../types';
import { COPING_STRATEGIES } from './copingStrategies';

export const getCopingStrategy = async (userMessage: string): Promise<CopingStrategy | null> => {
  if (!userMessage.trim()) return null;

  const strategyTitles = COPING_STRATEGIES.map(s => s.title).join('", "');
  
  const prompt = `Based on the user's message, which of the following coping strategies is most relevant? 
  
  User message: "${userMessage}"
  
  Available strategies: "${strategyTitles}"
  
  Respond with only the exact title of the most appropriate strategy. If none seem relevant, respond with "None".`;

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    const relevantTitle = response.text.trim();

    if (relevantTitle === 'None') {
        return null;
    }

    const foundStrategy = COPING_STRATEGIES.find(s => s.title === relevantTitle);
    
    return foundStrategy || null;

  } catch (error) {
    console.error("Error retrieving coping strategy:", error);
    return null; // Fallback on error
  }
};