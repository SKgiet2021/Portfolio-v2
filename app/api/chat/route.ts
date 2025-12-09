import { NextRequest, NextResponse } from 'next/server';
import { findRelevantChunks } from '@/lib/rag-simple';
import { streamLiveReply } from '@/lib/geminiLive';
import { buildPersonaPrompt } from '@/lib/persona';
import { search } from '@/lib/lance-store';
import { embed } from '@/lib/embeddings';
import { validateAndProcess } from '@/lib/guardrails';

export async function POST(req: NextRequest) {
  try {
    const { message, messages } = await req.json();

    // Support both single message and messages array (chat history)
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

    // ========================================
    // LAYER 1: GUARDRAILS - Pre-processing
    // Block system prompt probing and jailbreaks
    // ========================================
    const sessionId = req.headers.get('x-session-id') || 'default';
    const validation = validateAndProcess(latestUserMsg, sessionId);
    
    if (validation.blocked) {
      console.log(`🛡️ Guardrails blocked: ${validation.reason}`);
      return NextResponse.json({
        response: validation.cannedResponse,
        source: 'guardrails',
      });
    }

    // Try LanceDB vector search first, fall back to keyword matching
    let ragContext = "";
    
    try {
      // Generate embedding for the query and search LanceDB
      const queryEmbedding = await embed(latestUserMsg);
      const lanceResults = await search(queryEmbedding, 5);
      if (lanceResults.length > 0) {
        ragContext = lanceResults
          .map((r, idx) => `[${idx + 1}] ${r.text}`)
          .join('\n\n');
        console.log(`📊 LanceDB: Found ${lanceResults.length} relevant chunks`);
      }
    } catch (lanceError) {
      console.log("📊 LanceDB not available, using keyword RAG");
    }
    
    // Fall back to keyword matching if LanceDB empty
    if (!ragContext) {
      const keywordChunks = findRelevantChunks(latestUserMsg, 3);
      ragContext = keywordChunks
        .map((chunk, idx) => `[${idx + 1}] ${chunk.text}`)
        .join('\n\n');
      console.log(`📊 Keyword RAG: Found ${keywordChunks.length} relevant chunks`);
    }

    // Build the first-person persona prompt
    const personaPrompt = buildPersonaPrompt(ragContext);

    // Try Gemini Live API first (PRIMARY)
    try {
      console.log("🔴 Using Gemini Live model: gemini-live-2.5-flash-preview");
      const stream = await streamLiveReply(history, personaPrompt, ragContext);
      
      return new Response(stream, {
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    } catch (geminiError: any) {
      console.error('❌ Gemini Live API failed:', geminiError.message);
      
      // Failover to OpenRouter (BACKUP ONLY)
      const openRouterKey = process.env.OPENROUTER_API_KEY;
      if (!openRouterKey) {
        throw new Error('Gemini Live failed and OPENROUTER_API_KEY is not configured');
      }

      console.log('🟡 Switching to OpenRouter backup...');

      const fullPrompt = `${personaPrompt}

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

// Health check endpoint
export async function GET() {
  const apiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
  const isConfigured = !!apiKey;

  return NextResponse.json({
    status: 'ok',
    apiConfigured: isConfigured,
    ragMethod: 'hybrid (LanceDB + keyword fallback)',
    model: 'gemini-live-2.5-flash-preview',
    persona: 'first-person Swadhin',
  });
}
