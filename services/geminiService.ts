
import { GoogleGenAI, Type } from "@google/genai";
import { AIInsight } from "../types";

/**
 * Generates an AI-powered pastoral reflection, prayer, and verse suggestion based on user's meditation content.
 */
export const getAIInsight = async (scripture: string): Promise<AIInsight> => {
  // Always create a new instance right before the call to ensure the latest API key is used
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `사용자의 묵상/기도 내용: "${scripture}"\n이 내용을 바탕으로 성숙한 신앙적 통찰을 제공해주세요.`,
    config: {
      systemInstruction: "당신은 안산동산교회의 따뜻하고 지혜로운 목회자입니다. 사용자의 묵상 내용을 분석하여 격려와 통찰이 담긴 묵상 피드백, 진심 어린 짧은 기도문, 그리고 관련된 성경 구절을 추천하세요. 반드시 한국어로 답변하고 JSON 형식을 유지하세요.",
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          meditation: {
            type: Type.STRING,
            description: "성숙하고 따뜻한 어조의 한국어 묵상 피드백"
          },
          prayer: {
            type: Type.STRING,
            description: "묵상 내용을 갈무리하는 짧은 한국어 기도문"
          },
          verseSuggestion: {
            type: Type.STRING,
            description: "관련된 성경 구절 (예: 시편 23:1)"
          }
        },
        required: ["meditation", "prayer", "verseSuggestion"]
      }
    }
  });

  const text = response.text;
  if (!text) {
    throw new Error("AI response text is empty");
  }
  
  try {
    return JSON.parse(text);
  } catch (e) {
    console.error("Failed to parse AI response JSON", text);
    throw new Error("Invalid AI response format");
  }
};
