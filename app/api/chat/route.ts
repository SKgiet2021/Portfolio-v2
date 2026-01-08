import { NextRequest, NextResponse } from 'next/server';
import { findRelevantChunks } from '@/lib/rag-simple';
import { buildPersonaPrompt } from '@/lib/persona';
import { search } from '@/lib/lance-store';
import { embed } from '@/lib/embeddings';
import { validateAndProcess } from '@/lib/guardrails';

// Modular Provider Config
const CHAT_PROVIDER = process.env.CHAT_PROVIDER || 'OPENROUTER'; 

// Simple in-memory rate limiter (for demo/portfolio scale)
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 5;
const rateLimitMap = new Map<string, { count: number; expires: number }>();

export async function POST(req: NextRequest) {
  try {
    // 0. Security: Rate Limiting
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    const now = Date.now();
    
    // Clean up expired entries
    if (rateLimitMap.has(ip) && rateLimitMap.get(ip)!.expires < now) {
      rateLimitMap.delete(ip);
    }

    const record = rateLimitMap.get(ip) || { count: 0, expires: now + RATE_LIMIT_WINDOW };
    
    if (record.count >= MAX_REQUESTS_PER_WINDOW) {
      return NextResponse.json(
        { error: "Too many requests. Please try again in a minute." },
        { status: 429 }
      );
    }

    record.count += 1;
    rateLimitMap.set(ip, record);

    const { message, messages } = await req.json();

    // 1. History
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
    const latestUserMsg = history[history.length - 1].content;

    // 2. Guardrails
    const sessionId = req.headers.get('x-session-id') || 'default';
    const validation = validateAndProcess(latestUserMsg, sessionId);
    if (validation.blocked) {
      return NextResponse.json({ response: validation.cannedResponse, source: 'guardrails' });
    }

    // 3. RAG
    let ragContext = "";
    try {
      const queryEmbedding = await embed(latestUserMsg);
      const lanceResults = await search(queryEmbedding, 5);
      if (lanceResults.length > 0) {
        ragContext = lanceResults.map((r, idx) => `[${idx + 1}] ${r.text}`).join('\n\n');
      }
    } catch (e) { console.log("LanceDB skipped"); }

    if (!ragContext) {
      const keywordChunks = findRelevantChunks(latestUserMsg, 3);
      ragContext = keywordChunks.map((chunk, idx) => `[${idx + 1}] ${chunk.text}`).join('\n\n');
    }

    // 4. Persona
    const personaPrompt = buildPersonaPrompt(ragContext);
    
    // 5. Execution (OpenRouter)
    if (CHAT_PROVIDER === 'OPENROUTER') {
      const openRouterKey = process.env.OPENROUTER_API_KEY;
      if (!openRouterKey) throw new Error('OPENROUTER_API_KEY missing');

      console.log('🤖 Using OpenRouter: meta-llama/llama-3.3-70b-instruct:free');

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
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
            ...history.map(m => ({ role: m.role === 'model' ? 'assistant' : 'user', content: m.content }))
          ]
        })
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(`OpenRouter failed: ${err.error?.message || response.statusText}`);
      }
      
      const data = await response.json();
      return NextResponse.json({
        response: data.choices[0]?.message?.content || "No response",
        source: 'OpenRouter (Llama 3.3)'
      });
    }

    throw new Error(`Provider ${CHAT_PROVIDER} not implemented`);

  } catch (error: any) {
    console.error('Chat API Error:', error);
    return NextResponse.json({ error: error.message || 'Server Error' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ status: 'ok', provider: CHAT_PROVIDER });
}
