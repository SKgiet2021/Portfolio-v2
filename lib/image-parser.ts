/**
 * Image Analysis using Gemini Live API
 * Uses WebSocket for higher rate limits
 * Extracts visual metadata from images: objects, people, weather, accessories, etc.
 */

import { GoogleGenAI, Modality } from "@google/genai";

// Initialize with v1alpha for Live API
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
  httpOptions: { apiVersion: "v1alpha" },
});

const LIVE_MODEL = "gemini-live-2.5-flash-preview";

export interface ImageMetadata {
  description: string;
  people: {
    count: number;
    details: string[];
  };
  objects: string[];
  animals: string[];
  location: {
    type: string;
    details: string[];
  };
  weather: string;
  accessories: string[];
  colors: string[];
  mood: string;
  tags: string[];
}

/**
 * Analyze an image and extract structured metadata using Live API
 */
export async function analyzeImage(
  imageBuffer: Buffer,
  mimeType: string,
  fileName: string
): Promise<{ metadata: ImageMetadata; textDescription: string }> {
  console.log(`🖼️ Analyzing image via Live API: ${fileName}`);
  
  // Convert buffer to base64
  const base64Image = imageBuffer.toString("base64");
  
  const prompt = `Analyze this image and provide detailed metadata in JSON format.

Extract the following information:
1. **description**: A one-sentence summary of the image
2. **people**: 
   - count: number of people visible
   - details: array of observations about each person (clothing, accessories, hats, umbrellas, glasses, etc.)
3. **objects**: array of notable objects in the scene
4. **animals**: array of animals with type (e.g., "1 cat", "2 dogs")
5. **location**: 
   - type: indoor/outdoor/unknown
   - details: array of location features (mountain, beach, city, room, etc.)
6. **weather**: weather conditions if outdoor (sunny, cloudy, rainy, night, etc.) or "indoor" if inside
7. **accessories**: array of accessories worn by people (hat, umbrella, sunglasses, watch, bag, etc.)
8. **colors**: dominant colors in the image
9. **mood**: overall mood/atmosphere (happy, professional, casual, adventurous, etc.)
10. **tags**: array of keywords for searching this image

Respond ONLY with valid JSON, no markdown or explanation.`;

  return new Promise(async (resolve, reject) => {
    let fullResponse = "";
    let sessionClosed = false;

    try {
      const session = await ai.live.connect({
        model: LIVE_MODEL,
        config: {
          responseModalities: [Modality.TEXT],
        },
        callbacks: {
          onopen() {
            console.log("✅ Live vision session opened");
          },
          onmessage(msg) {
            if (msg.serverContent?.modelTurn?.parts) {
              for (const part of msg.serverContent.modelTurn.parts) {
                if (part.text) {
                  fullResponse += part.text;
                }
              }
            }

            if (msg.serverContent?.turnComplete) {
              console.log("✅ Image analysis complete");
              sessionClosed = true;
              session.close();
              
              // Parse the response
              try {
                const jsonStr = fullResponse.replace(/```json\n?|\n?```/g, "").trim();
                const metadata: ImageMetadata = JSON.parse(jsonStr);
                const textDescription = formatMetadataAsText(metadata, fileName);
                
                console.log(`✅ Parsed: ${metadata.people.count} people, ${metadata.objects.length} objects, ${metadata.tags.length} tags`);
                
                resolve({ metadata, textDescription });
              } catch (parseError) {
                console.error("Failed to parse JSON, using fallback");
                const fallbackMetadata = createFallbackMetadata(fullResponse);
                resolve({
                  metadata: fallbackMetadata,
                  textDescription: formatMetadataAsText(fallbackMetadata, fileName),
                });
              }
            }
          },
          onerror(e) {
            console.error("❌ Live vision error:", e);
            if (!sessionClosed) {
              sessionClosed = true;
              session.close();
              reject(new Error(`Vision analysis failed: ${e}`));
            }
          },
          onclose() {
            if (!sessionClosed) {
              sessionClosed = true;
              // If closed without response, reject
              if (!fullResponse) {
                reject(new Error("Session closed without response"));
              }
            }
          },
        },
      });

      // Send the image with the prompt
      // Live API expects content structure
      session.sendClientContent({
        turns: [
          {
            role: "user",
            parts: [
              { text: prompt },
              {
                inlineData: {
                  mimeType,
                  data: base64Image,
                },
              },
            ],
          },
        ],
        turnComplete: true,
      });

      // Timeout after 30 seconds
      setTimeout(() => {
        if (!sessionClosed) {
          sessionClosed = true;
          session.close();
          reject(new Error("Image analysis timeout"));
        }
      }, 30000);

    } catch (error: any) {
      reject(new Error(`Failed to analyze image: ${error.message}`));
    }
  });
}

/**
 * Create fallback metadata when JSON parsing fails
 */
function createFallbackMetadata(rawResponse: string): ImageMetadata {
  return {
    description: rawResponse.slice(0, 200),
    people: { count: 0, details: [] },
    objects: [],
    animals: [],
    location: { type: "unknown", details: [] },
    weather: "unknown",
    accessories: [],
    colors: [],
    mood: "unknown",
    tags: [],
  };
}

/**
 * Format metadata as searchable text for embedding
 */
function formatMetadataAsText(metadata: ImageMetadata, fileName: string): string {
  const parts: string[] = [];
  
  parts.push(`Image: ${fileName}`);
  parts.push(`Description: ${metadata.description}`);
  
  if (metadata.people.count > 0) {
    parts.push(`People: ${metadata.people.count} person(s)`);
    metadata.people.details.forEach(d => parts.push(`  - ${d}`));
  }
  
  if (metadata.animals.length > 0) {
    parts.push(`Animals: ${metadata.animals.join(", ")}`);
  }
  
  if (metadata.objects.length > 0) {
    parts.push(`Objects: ${metadata.objects.join(", ")}`);
  }
  
  if (metadata.location.type !== "unknown") {
    parts.push(`Location: ${metadata.location.type} - ${metadata.location.details.join(", ")}`);
  }
  
  if (metadata.weather !== "unknown") {
    parts.push(`Weather: ${metadata.weather}`);
  }
  
  if (metadata.accessories.length > 0) {
    parts.push(`Accessories: ${metadata.accessories.join(", ")}`);
  }
  
  if (metadata.colors.length > 0) {
    parts.push(`Colors: ${metadata.colors.join(", ")}`);
  }
  
  parts.push(`Mood: ${metadata.mood}`);
  parts.push(`Tags: ${metadata.tags.join(", ")}`);
  
  return parts.join("\n");
}

/**
 * Check if a file is an image
 */
export function isImageFile(mimeType: string): boolean {
  return mimeType.startsWith("image/");
}
