import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import {
  findRelevantChunks,
} from '@/lib/rag-simple';
import { streamLiveReply } from '@/lib/geminiLive';
import portfolioData from '@/data/portfolio.json';

// Initialize Gemini AI
let ai: GoogleGenAI | null = null;

function getAI() {
  if (!ai) {
    // API key is read from GEMINI_API_KEY environment variable by default
    ai = new GoogleGenAI({
      apiKey: process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY,
    });
  }
  return ai;
}

export async function POST(req: NextRequest) {
  try {
    const { message, messages } = await req.json();

    // Support both single message (legacy) and messages array (chat history)
    // If 'messages' is provided, use it. If only 'message', treat as single turn.
    let history: { role: "user" | "model"; content: string }[] = [];
    
    if (messages && Array.isArray(messages)) {
        history = messages.map((m: any) => ({
            role: m.role === "assistant" ? "model" : m.role,
            content: m.content
        }));
    } else if (message) {
        history = [{ role: "user", content: message }];
    } else {
        return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // Extract the latest user message for RAG context
    const latestUserMsg = history[history.length - 1].content;

    // Find relevant context using simplified RAG (keyword matching)
    const relevantChunks = findRelevantChunks(latestUserMsg, 3);
    const ragContext = relevantChunks
      .map((chunk, idx) => `[${idx + 1}] ${chunk.text}`)
      .join('\n\n');

    const personaPrompt = `You are a helpful assistant answering questions about the user's portfolio.
    
Use the following context to answer the user's question. If the context doesn't contain relevant information, politely say so and provide a general response based on what you know.

Please provide a helpful, friendly, and informative response. Be conversational and natural.`;

    // Try Gemini Live API first (PRIMARY)
    try {
      console.log("🔴 Using Gemini Live model: gemini-live-2.5-flash-preview");
      const stream = await streamLiveReply(history, personaPrompt, ragContext);
      
      return new Response(stream, {
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    } catch (geminiError: any) {
      console.error('❌ Gemini Live API failed:', geminiError.message);
      console.error('❌ Full error:', geminiError);
      console.error('❌ Stack trace:', geminiError.stack);
      
      // Failover to OpenRouter (BACKUP ONLY)
      const openRouterKey = process.env.OPENROUTER_API_KEY;
      if (!openRouterKey) {
        throw new Error('Gemini Live failed and OPENROUTER_API_KEY is not configured');
      }

      console.log('🟡 Switching to OpenRouter backup (DeepSeek)...');

      // Build prompt for OpenRouter
      const fullPrompt = `${personaPrompt}

Here is context from my local knowledge base:
${ragContext}

USER QUESTION: ${latestUserMsg}`;

      const openRouterResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openRouterKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'http://localhost:3000',
          'X-Title': 'Portfolio RAG Chatbot',
        },
        body: JSON.stringify({
          model: 'meta-llama/llama-3.3-70b-instruct:free',
          messages: [
            { role: 'system', content: personaPrompt },
            { role: 'user', content: fullPrompt }
          ],
        }),
      });

      if (!openRouterResponse.ok) {
        const errorData = await openRouterResponse.json();
        throw new Error(`OpenRouter failed: ${errorData.error?.message || openRouterResponse.statusText}`);
      }

      const data = await openRouterResponse.json();
      const responseText = data.choices[0]?.message?.content || 'No response from OpenRouter';

      return NextResponse.json({
        response: responseText,
        relevantScores: relevantChunks.map(c => c.score),
        source: 'OpenRouter Backup',
      });
    }

  } catch (error: any) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// Optional: Add a GET endpoint to check API health
export async function GET() {
  const apiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
  const isConfigured = !!apiKey;

  return NextResponse.json({
    status: 'ok',
    apiConfigured: isConfigured,
    ragMethod: 'keyword-matching',
    model: 'gemini-live-2.5-flash-preview',
  });
}
