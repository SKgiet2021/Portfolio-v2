/**
 * PDF text extraction
 * Uses pdf-parse for server-side PDF processing
 * 
 * API discovered via hard debugging:
 * - new PDFParse(Uint8Array)  -> creates parser
 * - await parser.load()       -> loads document
 * - await parser.getText()    -> returns { text: string, total: number, pages: [] }
 * - await parser.getInfo()    -> returns { total: number, info: {...}, ... }
 */

import { PDFParse } from 'pdf-parse';

export interface ParsedPDF {
  text: string;
  numPages: number;
  info?: {
    title?: string;
    author?: string;
    subject?: string;
  };
}

/**
 * Extract text from PDF buffer
 */
export async function parsePDF(buffer: Buffer): Promise<ParsedPDF> {
  try {
    // Convert Buffer to Uint8Array (required by pdf-parse)
    const uint8Array = new Uint8Array(buffer);
    
    // Create parser instance
    const parser = new PDFParse(uint8Array);
    
    // Load the document
    await (parser as any).load();
    
    // Get document info
    const info = await (parser as any).getInfo();
    
    // Get text content
    const textResult = await (parser as any).getText();
    
    const text = textResult?.text || '';
    const numPages = textResult?.total || info?.total || 1;
    
    console.log(`📄 Parsed PDF: ${numPages} pages, ${text.length} characters`);
    
    return {
      text,
      numPages,
      info: info?.info ? {
        title: info.info.Title || undefined,
        author: info.info.Author || undefined,
        subject: info.info.Subject || undefined,
      } : undefined,
    };
  } catch (error) {
    console.error('PDF parsing error:', error);
    throw new Error(`Failed to parse PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Extract text from various file types
 */
export async function extractText(
  buffer: Buffer,
  mimeType: string,
  fileName: string
): Promise<{ text: string; metadata: { pages?: number; source: string } }> {
  
  if (mimeType === 'application/pdf') {
    const parsed = await parsePDF(buffer);
    return {
      text: parsed.text,
      metadata: {
        pages: parsed.numPages,
        source: fileName,
      },
    };
  }
  
  if (mimeType.startsWith('text/')) {
    // Plain text files
    return {
      text: buffer.toString('utf-8'),
      metadata: {
        source: fileName,
      },
    };
  }

  throw new Error(`Unsupported file type: ${mimeType}`);
}
