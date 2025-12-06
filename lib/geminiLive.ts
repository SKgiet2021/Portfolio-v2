import { GoogleGenAI, Modality } from "@google/genai";

export type ChatMessage = { role: "user" | "model"; content: string };

const LIVE_MODEL_ID = "gemini-live-2.5-flash-preview";

// Initialize the AI client with v1alpha (required for Live API)
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "",
  httpOptions: { apiVersion: "v1alpha" }, // Live API requires v1alpha
});

/**
 * Stream a reply from Gemini Live API using the official SDK
 * @param history Chat message history
 * @param personaPrompt System prompt defining the assistant's persona
 * @param ragContext Retrieved context from the knowledge base
 * @returns ReadableStream of UTF-8 encoded text chunks
 */
export async function streamLiveReply(
  history: ChatMessage[],
  personaPrompt: string,
  ragContext: string
): Promise<ReadableStream<Uint8Array>> {
  console.log("🔴 Using Gemini Live model:", LIVE_MODEL_ID);

  // Queue to collect response messages from the Live API
  const responseQueue: any[] = [];
  let sessionClosed = false;

  // Connect to the Live API session
  const session = await ai.live.connect({
    model: LIVE_MODEL_ID,
    config: {
      responseModalities: [Modality.TEXT], // Text-only responses
    },
    callbacks: {
      onopen() {
        console.debug("✅ Live session opened");
      },
      onmessage(message) {
        // Queue all messages for the stream to process
        responseQueue.push(message);
      },
      onerror(e) {
        console.error("❌ Live API error:", e);
        responseQueue.push({ error: e });
      },
      onclose(e) {
        console.debug("🔌 Live session closed:", e?.reason || "normally");
        sessionClosed = true;
      },
    },
  });

  // Build turns: system message with persona + RAG context, then chat history
  const turns = [
    {
      role: "user",
      parts: [
        { text: personaPrompt },
        { text: "\n\nHere is context from my local knowledge base:\n" + ragContext },
      ],
    },
    ...history.map((m) => ({
      role: m.role,
      parts: [{ text: m.content }],
    })),
  ];

  // Send all context + conversation history to the Live API
  console.log(`📤 Sending ${turns.length} turns to Live API`);
  session.sendClientContent({ turns, turnComplete: true });

  const encoder = new TextEncoder();

  // Convert Live API messages into a ReadableStream of UTF-8 text chunks
  const stream = new ReadableStream<Uint8Array>({
    async pull(controller) {
      // Wait for messages to arrive in the queue
      while (responseQueue.length === 0 && !sessionClosed) {
        await new Promise((resolve) => setTimeout(resolve, 10));
      }

      // Process all queued messages
      while (responseQueue.length > 0) {
        const msg = responseQueue.shift();

        // Handle errors
        if (msg?.error) {
          controller.error(msg.error);
          await session.close();
          return;
        }

        // Handle text chunks
        if (msg?.text) {
          console.debug("📝 Streaming text chunk:", msg.text.substring(0, 50) + "...");
          controller.enqueue(encoder.encode(msg.text as string));
        }

        // Handle turn completion
        if (msg?.serverContent?.turnComplete) {
          console.debug("✅ Turn complete, closing stream");
          controller.close();
          await session.close();
          return;
        }
      }

      // If session closed but no turnComplete, close the stream
      if (sessionClosed && responseQueue.length === 0) {
        console.debug("🔌 Session closed, ending stream");
        controller.close();
      }
    },
    async cancel() {
      console.log("🚫 Stream cancelled by client");
      await session.close();
    },
  });

  return stream;
}
