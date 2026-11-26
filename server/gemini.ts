import * as fs from "fs";
import { GoogleGenAI } from "@google/genai";
import { classifyWithCNN } from "./cnn-model";

// DON'T DELETE THIS COMMENT
// Follow these instructions when using this blueprint:
// - Note that the newest Gemini model series is "gemini-2.5-flash" or gemini-2.5-pro"
//   - do not change this unless explicitly requested by the user

// This API key is from Gemini Developer API Key, not vertex AI API Key
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface PlantDiseaseAnalysis {
  disease: string;
  confidence: number;
  scientificName?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
}

export async function analyzePlantDisease(imagePath: string): Promise<PlantDiseaseAnalysis> {
  // Retry configuration
  const maxAttempts = 3;
  const baseDelayMs = 500;

  const imageBytes = fs.readFileSync(imagePath);

  const systemPrompt = `You are an expert plant pathologist specializing in disease identification.
Analyze the plant image and identify any diseases present. Provide your analysis in JSON format with:
- disease: The specific name of the disease
- confidence: A number between 0 and 1 representing your confidence
- scientificName: The scientific name of the pathogen (if applicable)
- severity: One of: low, medium, high, critical
- description: A brief 1-2 sentence description of what you observe

If the plant appears healthy, set disease to "Healthy" with high confidence.
If you're unsure, provide your best assessment with lower confidence.`;

  const contents = [
    {
      inlineData: {
        data: imageBytes.toString("base64"),
        mimeType: "image/jpeg",
      },
    },
    systemPrompt
  ];

  // Helper to decide if an error is transient and worth retrying
  function isTransientGeminiError(err: any) {
    if (!err) return false;
    const msg = String(err.message || err);
    // Common transient indicators: 503/service overloaded, 429/rate limit, network errors
    return /503|overload|overloaded|rate limit|429|timeout|ETIMEDOUT/i.test(msg);
  }

  // Attempt with exponential backoff
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-pro",
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "object",
            properties: {
              disease: { type: "string" },
              confidence: { type: "number" },
              scientificName: { type: "string" },
              severity: {
                type: "string",
                enum: ["low", "medium", "high", "critical"]
              },
              description: { type: "string" },
            },
            required: ["disease", "confidence", "severity", "description"],
          },
        },
        contents: contents,
      });

      const rawJson = response.text;

      if (rawJson) {
        const data: PlantDiseaseAnalysis = JSON.parse(rawJson);
        return data;
      } else {
        throw new Error("Empty response from Gemini AI");
      }
    } catch (err) {
      console.error(`Gemini attempt ${attempt} failed:`, (err as any)?.message ?? err);

      const lastAttempt = attempt === maxAttempts;
      if (!isTransientGeminiError(err) || lastAttempt) {
        // If this is not transient or we've exhausted retries, fall back to CNN
        console.warn("Falling back to CNN model due to Gemini failure.");
        try {
          const cnn = await classifyWithCNN(imagePath);

          // Derive a conservative severity from confidence
          let severity: PlantDiseaseAnalysis['severity'] = 'low';
          if (cnn.confidence > 0.92) severity = 'critical';
          else if (cnn.confidence > 0.80) severity = 'high';
          else if (cnn.confidence > 0.6) severity = 'medium';

          const fallback: PlantDiseaseAnalysis = {
            disease: cnn.disease,
            confidence: Math.max(0, Math.min(1, cnn.confidence * 0.85)), // conservative downweight
            scientificName: undefined,
            severity,
            description: `Fallback CNN-only analysis. Top prediction: ${cnn.disease} (confidence ${(
              cnn.confidence
            ).toFixed(2)}). Alternatives: ${cnn.predictions.slice(1,4).map(p => `${p.disease} (${p.confidence.toFixed(2)})`).join(', ')}. Gemini AI was unavailable.`
          };

          return fallback;
        } catch (cnnErr) {
          console.error('CNN fallback also failed:', (cnnErr as any)?.message ?? cnnErr);
          // As a last resort, return a conservative uncertain response instead of throwing
          return {
            disease: 'Unknown',
            confidence: 0.4,
            severity: 'medium',
            description: 'Analysis unavailable: both Gemini AI and local CNN fallback failed. Please try again later.'
          };
        }
      }

      // transient error and not last attempt -> wait with exponential backoff and retry
      const jitter = Math.floor(Math.random() * 300);
      const delay = baseDelayMs * Math.pow(2, attempt - 1) + jitter;
      console.info(`Retrying Gemini in ${delay}ms (attempt ${attempt + 1}/${maxAttempts})`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  // Shouldn't reach here, but return a safe unknown result
  return {
    disease: 'Unknown',
    confidence: 0.4,
    severity: 'medium',
    description: 'Analysis failed: unexpected error during analysis.'
  };
}
