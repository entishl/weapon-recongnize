
import { GoogleGenAI, Type } from "@google/genai";
import type { WeaponCount } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

// Generate properties for the 6x3 grid
const properties: Record<string, { type: Type; description: string }> = {};
const requiredProperties: string[] = [];
for (let r = 0; r < 3; r++) {
  for (let c = 0; c < 6; c++) {
    const key = `${r},${c}`;
    properties[key] = {
      type: Type.INTEGER,
      description: `The total count of the weapon at grid coordinate row ${r}, column ${c}.`,
    };
    requiredProperties.push(key);
  }
}

const responseSchema = {
    type: Type.OBJECT,
    properties: properties,
    required: requiredProperties,
};

export const identifyWeapons = async (arsenalImageBase64: string, userImageBase64: string): Promise<WeaponCount> => {
    const prompt = `
        You are an expert weapon recognition and counting system.
        You will be given two images:
        1. 'Arsenal Image': A 6x3 grid of unique weapons. The grid has 3 rows (0-2) and 6 columns (0-5).
        2. 'User Screenshot': A game screenshot that may contain multiple instances of weapons from the arsenal.

        Your task is to:
        1. Examine the 'User Screenshot' and identify all weapons that match those in the 'Arsenal Image'.
        2. For EACH weapon slot in the 6x3 arsenal grid, count the total number of times the weapon from that slot appears in the 'User Screenshot'.
        3. Return a single JSON object that maps each weapon's zero-indexed 'row,col' coordinate from the arsenal to its total count in the screenshot.
        4. The keys of the JSON object must be strings in the format "row,col" (e.g., "0,0", "1,5").
        5. The values must be integers representing the count.
        6. If a weapon from the arsenal is not found in the screenshot, its count must be 0.
        7. You must provide a count for all 18 weapon slots from the arsenal grid, even if the count is 0.
    `;

    const arsenalImagePart = {
        inlineData: {
            mimeType: 'image/png',
            data: arsenalImageBase64,
        },
    };

    const userImagePart = {
        inlineData: {
            mimeType: 'image/jpeg',
            data: userImageBase64,
        },
    };

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [{ text: prompt }, arsenalImagePart, userImagePart] },
            config: {
                responseMimeType: "application/json",
                responseSchema: responseSchema,
            },
        });

        const jsonText = response.text.trim();
        const parsedResponse = JSON.parse(jsonText) as WeaponCount;
        return parsedResponse;
        
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        throw new Error("Failed to get a valid response from the AI model.");
    }
};
