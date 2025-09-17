
import { GoogleGenAI, Modality, Part } from "@google/genai";

// Ensure the API key is available in the environment variables
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
    throw new Error("API_KEY is not defined in environment variables.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });
const model = ai.models['gemini-2.5-flash-image-preview'];

type EditImageResult = {
    image: string | null;
    text: string | null;
};

export async function editImage(
    base64ImageData: string,
    mimeType: string,
    prompt: string
): Promise<EditImageResult> {
    try {
        const imagePart = {
            inlineData: {
                data: base64ImageData,
                mimeType: mimeType,
            },
        };

        const textPart = {
            text: prompt,
        };

        const response = await model.generateContent({
            contents: {
                parts: [imagePart, textPart],
            },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });
        
        const result: EditImageResult = { image: null, text: null };

        if (response && response.candidates && response.candidates.length > 0) {
            const parts: Part[] = response.candidates[0].content.parts;
            for (const part of parts) {
                if (part.inlineData && part.inlineData.data) {
                    result.image = part.inlineData.data;
                } else if (part.text) {
                    result.text = part.text;
                }
            }
        } else {
             throw new Error("Invalid response from Gemini API.");
        }
        
        return result;

    } catch (error) {
        console.error("Error calling Gemini API:", error);
        if (error instanceof Error) {
            throw new Error(`Lỗi API Gemini: ${error.message}`);
        }
        throw new Error("An unknown error occurred while communicating with the Gemini API.");
    }
}
