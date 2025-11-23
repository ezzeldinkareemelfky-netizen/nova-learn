
import { GoogleGenAI, Type } from "@google/genai";
import { LearningStyle, Question } from "../types";

// Helper to get client with the correct key safely for browser environments
const getClient = (userKey?: string) => {
    // Check if process is defined (Node env) to avoid "process is not defined" error in browser
    let envKey = undefined;
    try {
        if (typeof process !== 'undefined' && process.env) {
            envKey = process.env.API_KEY;
        }
    } catch (e) {
        // Ignore error if process is accessed in strict browser env
    }

    const key = userKey || envKey;
    
    if (!key) return null;
    return new GoogleGenAI({ apiKey: key });
};

export const generateDailyTip = async (style: LearningStyle, apiKey?: string, language: 'en' | 'ar' = 'en'): Promise<string> => {
  const ai = getClient(apiKey);
  if (!ai) return language === 'ar' ? "نصيحة: أضف مفتاح API في الإعدادات!" : "Tip: Add your Gemini API Key in Settings!";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Give me a short, one-sentence study tip for a ${style !== LearningStyle.UNDEFINED ? style : 'general'} learner. 
      Respond in ${language === 'ar' ? 'Arabic' : 'English'}.`,
    });
    return response.text || (language === 'ar' ? "ركز على أهدافك اليوم!" : "Focus on your goals today!");
  } catch (error) {
    console.error("Gemini Error:", error);
    return language === 'ar' ? "الاستمرارية هي مفتاح النجاح." : "Consistency is key to mastery.";
  }
};

export const chatWithAI = async (message: string, style: LearningStyle, history: string[], apiKey?: string, language: 'en' | 'ar' = 'en'): Promise<string> => {
  const ai = getClient(apiKey);
  if (!ai) return language === 'ar' ? "الرجاء إضافة مفتاح API في الإعدادات للتحدث مع نوفا." : "Please add your API Key in Settings > Profile to chat with Nova.";

  const systemInstruction = `You are Nova, an intelligent study assistant. 
  The user is a ${style} learner. 
  - Respond in ${language === 'ar' ? 'Arabic' : 'English'}.
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
    return response.text || (language === 'ar' ? "أنا أعالج طلبك..." : "I'm processing that...");
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    return language === 'ar' ? "أواجه مشكلة في الاتصال. تحقق من المفتاح." : "I'm having trouble connecting. Please check your API Key.";
  }
};

export const analyzeQuiz = async (answers: string[], apiKey?: string): Promise<LearningStyle> => {
   const ai = getClient(apiKey);
   if (!ai) {
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

export const generateFlashcards = async (content: string, count: number = 5, apiKey?: string, language: 'en' | 'ar' = 'en'): Promise<{front: string, back: string}[]> => {
    const ai = getClient(apiKey);
    if (!ai) return [];

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Create ${count} flashcards from the following text. 
            Respond in ${language === 'ar' ? 'Arabic' : 'English'}.
            Return ONLY a valid JSON array of objects with 'front' (question) and 'back' (answer) properties.
            Do not add markdown formatting.
            
            Text: ${content.substring(0, 2000)}`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            front: { type: Type.STRING },
                            back: { type: Type.STRING }
                        }
                    }
                }
            }
        });

        const text = response.text || "[]";
        return JSON.parse(text);
    } catch (error) {
        console.error("Flashcard Gen Error:", error);
        return [];
    }
};

export const generateQuiz = async (content: string, apiKey?: string, language: 'en' | 'ar' = 'en'): Promise<Question[]> => {
    const ai = getClient(apiKey);
    if (!ai) return [];

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Generate exactly 10 multiple choice questions based on the text provided.
            Language: ${language === 'ar' ? 'Arabic' : 'English'}.
            The output MUST be a JSON array of objects.
            Each object must have:
            - question (string)
            - options (array of 4 strings)
            - correctIndex (number 0-3)
            - explanation (string explaining why the answer is correct)

            Text: ${content.substring(0, 3000)}`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            question: { type: Type.STRING },
                            options: { 
                                type: Type.ARRAY,
                                items: { type: Type.STRING }
                            },
                            correctIndex: { type: Type.NUMBER },
                            explanation: { type: Type.STRING }
                        }
                    }
                }
            }
        });
        
        const text = response.text || "[]";
        const rawQuestions = JSON.parse(text);
        
        // Add IDs
        return rawQuestions.map((q: any, i: number) => ({
            ...q,
            id: i.toString()
        }));
    } catch (error) {
        console.error("Quiz Gen Error:", error);
        return [];
    }
}
