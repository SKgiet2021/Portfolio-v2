import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'RAG System Backend API',
    endpoints: {
      chat: 'POST /api/chat',
    },
    timestamp: new Date().toISOString(),
  });
}
