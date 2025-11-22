
import { GoogleGenAI } from "@google/genai";
import { LearningStyle } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generateDailyTip = async (style: LearningStyle): Promise<string> => {
  if (!process.env.API_KEY) return "Remember to take breaks and stay hydrated!";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Give me a short, one-sentence study tip for a ${style !== LearningStyle.UNDEFINED ? style : 'general'} learner.`,
    });
    return response.text || "Focus on your goals today!";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Consistency is key to mastery.";
  }
};

export const chatWithAI = async (message: string, style: LearningStyle, history: string[]): Promise<string> => {
  if (!process.env.API_KEY) return "I can't connect to the stars right now (API Key missing).";

  const systemInstruction = `You are Nova, an intelligent study assistant. 
  The user is a ${style} learner. 
  - If Visual: Use descriptive imagery, suggest diagrams, charts, and videos.
  - If Auditory: Explain as if speaking, suggest podcasts, mnemonics, and repeating aloud.
  - If Kinesthetic: Suggest hands-on activities, experiments, and taking breaks to move.
  - If the user provides a text/file context, answer strictly based on that context if asked.
  - Keep responses concise and encouraging.`;

  try {
    // We pass a limited history to keep context but avoid token limits in this demo
    const contextMessages = history.slice(-5).join("\n"); 
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `History:\n${contextMessages}\n\nCurrent Request:\n${message}`,
      config: {
        systemInstruction: systemInstruction,
      }
    });
    return response.text || "I'm processing that...";
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    return "I'm having trouble connecting to the knowledge base.";
  }
};

export const analyzeQuiz = async (answers: string[]): Promise<LearningStyle> => {
   if (!process.env.API_KEY) {
     // Fallback mock logic if no API key
     return LearningStyle.VISUAL; 
   }

   try {
     const prompt = `Analyze these answers to a learning style quiz and return ONLY one of these words: "Visual", "Auditory", or "Kinesthetic". 
     Answers: ${JSON.stringify(answers)}`;
     
     const response = await ai.models.generateContent({
       model: 'gemini-2.5-flash',
       contents: prompt,
     });
     
     const text = response.text?.trim();
     if (text?.includes("Visual")) return LearningStyle.VISUAL;
     if (text?.includes("Auditory")) return LearningStyle.AUDITORY;
     if (text?.includes("Kinesthetic")) return LearningStyle.KINESTHETIC;
     
     return LearningStyle.VISUAL; // Default
   } catch (error) {
     return LearningStyle.VISUAL;
   }
};
