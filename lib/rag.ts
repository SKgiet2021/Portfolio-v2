import { pipeline, env } from '@xenova/transformers';

// Configure transformers to work in Next.js/Node.js environment
env.allowLocalModels = false;
env.useBrowserCache = false;
env.cacheDir = './.cache/transformers';

// Singleton pattern to ensure model loads only once
let embeddingPipeline: any = null;

/**
 * Initialize the embedding pipeline (singleton)
 * Uses the all-MiniLM-L6-v2 model for generating embeddings
 */
async function getEmbeddingPipeline() {
  if (!embeddingPipeline) {
    console.log("Loading embedding model...");
    embeddingPipeline = await pipeline(
      "feature-extraction",
      "Xenova/all-MiniLM-L6-v2"
    );
    console.log("Embedding model loaded successfully");
  }
  return embeddingPipeline;
}

/**
 * Generate embeddings for a given text
 * @param text - The input text to embed
 * @returns A normalized embedding vector
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const pipe = await getEmbeddingPipeline();

  // Generate embedding
  const output = await pipe(text, {
    pooling: "mean",
    normalize: true,
  });

  // Convert to array
  return Array.from(output.data);
}

/**
 * Calculate cosine similarity between two vectors
 * @param vecA - First embedding vector
 * @param vecB - Second embedding vector
 * @returns Similarity score (0-1, where 1 is most similar)
 */
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length) {
    throw new Error("Vectors must have the same length");
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Find the most relevant text chunks based on similarity to query
 * @param query - The search query
 * @param chunks - Array of text chunks with their embeddings
 * @param topK - Number of top results to return
 * @returns Top K most similar chunks
 */
export async function findRelevantChunks(
  query: string,
  chunks: Array<{ text: string; embedding: number[] }>,
  topK: number = 3
): Promise<Array<{ text: string; score: number }>> {
  // Generate embedding for query
  const queryEmbedding = await generateEmbedding(query);

  // Calculate similarity scores
  const scoredChunks = chunks.map((chunk) => ({
    text: chunk.text,
    score: cosineSimilarity(queryEmbedding, chunk.embedding),
  }));

  // Sort by score (descending) and take top K
  return scoredChunks.sort((a, b) => b.score - a.score).slice(0, topK);
}

/**
 * Prepare knowledge base chunks from portfolio data
 * @param portfolioData - The portfolio JSON data
 * @returns Array of text chunks ready for embedding
 */
export function prepareKnowledgeChunks(portfolioData: any): string[] {
  const chunks: string[] = [];

  // Add bio
  if (portfolioData.bio) {
    chunks.push(`Bio: ${portfolioData.bio}`);
  }

  // Add skills
  if (portfolioData.skills) {
    portfolioData.skills.forEach((skillGroup: any) => {
      chunks.push(
        `${skillGroup.category} skills: ${skillGroup.items.join(", ")}`
      );
    });
  }

  // Add projects
  if (portfolioData.projects) {
    portfolioData.projects.forEach((project: any) => {
      chunks.push(
        `Project: ${project.name}. ${
          project.description
        }. Technologies: ${project.technologies.join(
          ", "
        )}. Highlights: ${project.highlights.join("; ")}`
      );
    });
  }

  // Add experience
  if (portfolioData.experience) {
    portfolioData.experience.forEach((exp: any) => {
      chunks.push(
        `Experience: ${exp.role} at ${exp.company} (${
          exp.duration
        }). Responsibilities: ${exp.responsibilities.join("; ")}`
      );
    });
  }

  // Add education
  if (portfolioData.education) {
    const edu = portfolioData.education;
    chunks.push(
      `Education: ${edu.degree} from ${edu.university} (${
        edu.year
      }). ${edu.achievements.join("; ")}`
    );
  }

  // Add FAQs
  if (portfolioData.faq) {
    portfolioData.faq.forEach((faq: any) => {
      chunks.push(`Q: ${faq.question} A: ${faq.answer}`);
    });
  }

  // Add contact info
  if (portfolioData.contact) {
    chunks.push(
      `Contact: Email - ${portfolioData.contact.email}, GitHub - ${portfolioData.contact.github}, LinkedIn - ${portfolioData.contact.linkedin}`
    );
  }

  return chunks;
}
