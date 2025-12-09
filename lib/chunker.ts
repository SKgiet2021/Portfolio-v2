/**
 * Smart text chunker with overlap
 * Optimized for semantic search quality
 */

export interface Chunk {
  text: string;
  index: number;
  startChar: number;
  endChar: number;
  metadata?: {
    page?: number;
    source?: string;
  };
}

export interface ChunkingOptions {
  chunkSize?: number;      // Target tokens per chunk (default: 512)
  chunkOverlap?: number;   // Overlap tokens (default: 50)
  minChunkSize?: number;   // Minimum chunk size (default: 100)
}

// Approximate tokens = characters / 4 (rough estimate for English)
const CHARS_PER_TOKEN = 4;

/**
 * Split text into overlapping chunks for semantic search
 */
export function chunkText(
  text: string,
  options: ChunkingOptions = {}
): Chunk[] {
  const {
    chunkSize = 512,
    chunkOverlap = 50,
    minChunkSize = 100,
  } = options;

  const chunkChars = chunkSize * CHARS_PER_TOKEN;
  const overlapChars = chunkOverlap * CHARS_PER_TOKEN;
  const minChunkChars = minChunkSize * CHARS_PER_TOKEN;

  const chunks: Chunk[] = [];
  
  // Clean and normalize text
  const cleanedText = text
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  if (cleanedText.length < minChunkChars) {
    // Text is short enough to be a single chunk
    return [{
      text: cleanedText,
      index: 0,
      startChar: 0,
      endChar: cleanedText.length,
    }];
  }

  let startIndex = 0;
  let chunkIndex = 0;

  while (startIndex < cleanedText.length) {
    let endIndex = Math.min(startIndex + chunkChars, cleanedText.length);

    // Try to break at sentence boundary
    if (endIndex < cleanedText.length) {
      const searchStart = Math.max(startIndex + minChunkChars, endIndex - 200);
      const searchText = cleanedText.slice(searchStart, endIndex);
      
      // Look for sentence endings
      const sentenceEndings = ['. ', '.\n', '? ', '?\n', '! ', '!\n'];
      let bestBreak = -1;
      
      for (const ending of sentenceEndings) {
        const lastIndex = searchText.lastIndexOf(ending);
        if (lastIndex > bestBreak) {
          bestBreak = lastIndex;
        }
      }

      if (bestBreak > 0) {
        endIndex = searchStart + bestBreak + 2; // Include the period and space
      }
    }

    const chunkText = cleanedText.slice(startIndex, endIndex).trim();
    
    if (chunkText.length >= minChunkChars || startIndex === 0) {
      chunks.push({
        text: chunkText,
        index: chunkIndex,
        startChar: startIndex,
        endChar: endIndex,
      });
      chunkIndex++;
    }

    // Move to next chunk with overlap
    startIndex = endIndex - overlapChars;
    
    // Avoid infinite loop
    if (startIndex >= cleanedText.length - minChunkChars) {
      break;
    }
  }

  // Handle any remaining text
  if (startIndex < cleanedText.length) {
    const remaining = cleanedText.slice(startIndex).trim();
    if (remaining.length > 0 && !chunks.some(c => c.text.includes(remaining))) {
      chunks.push({
        text: remaining,
        index: chunkIndex,
        startChar: startIndex,
        endChar: cleanedText.length,
      });
    }
  }

  return chunks;
}

/**
 * Estimate token count for a text
 */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / CHARS_PER_TOKEN);
}

/**
 * Format chunks for context injection (compact format)
 */
export function formatChunksForContext(
  chunks: Array<{ text: string; score: number; index: number }>
): string {
  return chunks
    .map((chunk, i) => `[${i + 1}] ${chunk.text}`)
    .join('\n\n');
}
