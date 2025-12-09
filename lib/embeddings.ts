/**
 * Local embedding service using all-MiniLM-L6-v2
 * Runs entirely on CPU, no GPU required
 */

// Dynamic import to avoid build-time issues
let pipeline: any = null;
let embeddingPipeline: any = null;
let isLoading = false;
let loadPromise: Promise<any> | null = null;

/**
 * Initialize the embedding model (loads once, cached)
 */
async function getEmbeddingPipeline(): Promise<any> {
  if (embeddingPipeline) {
    return embeddingPipeline;
  }

  if (isLoading && loadPromise) {
    return loadPromise;
  }

  isLoading = true;
  console.log('🔄 Loading embedding model: all-MiniLM-L6-v2...');

  // Dynamic import to avoid Next.js build issues
  if (!pipeline) {
    const transformers = await import('@xenova/transformers');
    pipeline = transformers.pipeline;
  }

  loadPromise = pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2', {
    // Use quantized model for faster loading and less memory
    quantized: true,
  });

  embeddingPipeline = await loadPromise;
  isLoading = false;
  console.log('✅ Embedding model loaded successfully');

  return embeddingPipeline;
}

/**
 * Generate embedding for a single text
 * @param text - Input text to embed
 * @returns 384-dimensional vector
 */
export async function embed(text: string): Promise<number[]> {
  const pipe = await getEmbeddingPipeline();
  
  // Run inference
  const output = await pipe(text, {
    pooling: 'mean',
    normalize: true,
  });

  // Convert to regular array
  return Array.from(output.data as Float32Array);
}

/**
 * Generate embeddings for multiple texts (batch processing)
 * @param texts - Array of texts to embed
 * @returns Array of 384-dimensional vectors
 */
export async function embedBatch(texts: string[]): Promise<number[][]> {
  const pipe = await getEmbeddingPipeline();
  
  const embeddings: number[][] = [];
  
  // Process in batches of 32 for memory efficiency
  const batchSize = 32;
  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize);
    
    for (const text of batch) {
      const output = await pipe(text, {
        pooling: 'mean',
        normalize: true,
      });
      embeddings.push(Array.from(output.data as Float32Array));
    }
    
    // Log progress for large batches
    if (texts.length > batchSize) {
      console.log(`📊 Embedded ${Math.min(i + batchSize, texts.length)}/${texts.length} chunks`);
    }
  }

  return embeddings;
}

/**
 * Calculate cosine similarity between two vectors
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Vectors must have same length');
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  const magnitude = Math.sqrt(normA) * Math.sqrt(normB);
  return magnitude === 0 ? 0 : dotProduct / magnitude;
}

/**
 * Check if embedding model is loaded
 */
export function isModelLoaded(): boolean {
  return embeddingPipeline !== null;
}

