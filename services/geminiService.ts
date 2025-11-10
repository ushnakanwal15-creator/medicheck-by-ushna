import { GoogleGenAI, Type } from "@google/genai";
import { MedicineRequest, MedicineResponse } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const fetchMedicineInfo = async (request: MedicineRequest): Promise<MedicineResponse> => {
  const modelId = "gemini-2.5-flash";

  // Construct the prompt content based on whether an image is present
  const contentParts: any[] = [];

  if (request.imageBase64) {
    contentParts.push({
      inlineData: {
        data: request.imageBase64,
        mimeType: request.imageMimeType || "image/jpeg",
      },
    });
    contentParts.push({
      text: `
        Act as a professional medical assistant.
        Analyze the medicine shown in the image. ${request.medicineName ? `The user refers to it as "${request.medicineName}".` : ''}
        First, identify the medicine accurately from the image text or appearance.
        Then, for a patient aged ${request.age}, provide dosage guidance, side effects, and warnings.
        Translate the entire response into ${request.language}.
        Ensure the tone is helpful, professional, and clear.
        CRITICAL: You MUST strictly follow the JSON schema provided.
      `
    });
  } else {
    contentParts.push({
      text: `
        Act as a professional medical assistant.
        Analyze the medicine "${request.medicineName}" for a patient aged ${request.age}.
        Provide dosage guidance, side effects, and warnings.
        Translate the entire response into ${request.language}.
        Ensure the tone is helpful, professional, and clear.
        CRITICAL: You MUST strictly follow the JSON schema provided.
      `
    });
  }

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: {
        role: 'user',
        parts: contentParts
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            medicineName: { type: Type.STRING, description: "The standardized name of the medicine identified" },
            summary: { type: Type.STRING, description: "A brief 1-sentence summary of what the medicine is used for" },
            dosageGuidance: { type: Type.STRING, description: "General dosage guidance appropriate for the specified age. Do not prescribe, only guide." },
            commonSideEffects: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "List of common, less serious side effects"
            },
            seriousSideEffects: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "List of serious side effects requiring immediate attention"
            },
            ageSpecificWarnings: { type: Type.STRING, description: "Warnings specific to the patient's age group (e.g., children, elderly)" },
            disclaimer: { type: Type.STRING, description: "A mandatory medical disclaimer in the target language stating this is AI generated and not medical advice." }
          },
          required: ["medicineName", "summary", "dosageGuidance", "commonSideEffects", "seriousSideEffects", "ageSpecificWarnings", "disclaimer"]
        }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response received from AI");
    }

    const data = JSON.parse(text) as MedicineResponse;
    return data;

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to fetch medicine information. Please check your input and try again.");
  }
};