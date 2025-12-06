import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * Admin endpoint to trigger knowledge base re-ingestion
 * Call this after adding new files to knowledge_base/
 * 
 * Usage: POST http://localhost:3000/api/admin/ingest
 */
export async function POST() {
  try {
    console.log('🔄 Starting knowledge base ingestion...');
    
    // Run the ingestion script
    const { stdout, stderr } = await execAsync('pnpm ingest', {
      cwd: process.cwd(),
    });
    
    console.log('📦 Ingestion output:', stdout);
    
    if (stderr && !stderr.includes('npm')) {
      console.warn('⚠️  Ingestion warnings:', stderr);
    }
    
    // Force reload the knowledge base in the RAG module
    const { reloadKnowledgeBase } = await import('@/lib/rag-simple');
    reloadKnowledgeBase();
    
    return NextResponse.json({
      success: true,
      message: 'Knowledge base updated successfully!',
      output: stdout,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('❌ Ingestion failed:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        stderr: error.stderr,
      },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint to check last ingestion status
 */
export async function GET() {
  const fs = require('fs');
  const path = require('path');
  
  try {
    const portfolioPath = path.join(process.cwd(), 'data', 'portfolio.json');
    const stats = fs.statSync(portfolioPath);
    const data = JSON.parse(fs.readFileSync(portfolioPath, 'utf-8'));
    
    return NextResponse.json({
      lastModified: stats.mtime,
      totalChunks: data.length,
      files: [...new Set(data.map((chunk: any) => chunk.metadata.fileName))],
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Portfolio file not found' },
      { status: 404 }
    );
  }
}
