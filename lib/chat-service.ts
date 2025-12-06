// Chat service to communicate with RAG backend
// Using relative URL - Vite proxy will forward to localhost:3000
const BACKEND_URL = "";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export async function sendChatMessage(
  messages: ChatMessage[],
  onChunk: (chunk: string) => void
): Promise<void> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ messages }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) {
      throw new Error("No response body");
    }

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      // Decode the chunk as plain text
      const chunk = decoder.decode(value, { stream: true });
      
      // Send the text chunk directly to the callback
      if (chunk) {
        onChunk(chunk);
      }
    }
  } catch (error) {
    console.error("Chat service error:", error);
    throw error;
  }
}
