/**
 * Simplified RAG implementation that works with auto-generated knowledge base
 */

import knowledgeBase from '@/data/portfolio.json';

// Cache for knowledge chunks
let knowledgeChunks: string[] | null = null;

/**
 * Simple text similarity using keyword matching (TF-IDF-like approach)
 */
function calculateSimilarity(query: string, text: string): number {
  const queryWords = query.toLowerCase().split(/\W+/).filter(w => w.length > 2);
  const textLower = text.toLowerCase();
  
  let matches = 0;
  queryWords.forEach(word => {
    if (textLower.includes(word)) {
      matches++;
    }
  });
  
  return matches / Math.max(queryWords.length, 1);
}

/**
 * Prepare knowledge chunks from auto-generated portfolio data
 */
export function prepareKnowledgeChunks(): string[] {
  const chunks: string[] = [];

  // Check if this is the new auto-generated format (array of chunks)
  if (Array.isArray(knowledgeBase)) {
    knowledgeBase.forEach((chunk: any) => {
      chunks.push(chunk.text);
    });
  } 
  // Check if this is the previous auto-generated format (object with files array)
  else if ('files' in (knowledgeBase as any) && Array.isArray((knowledgeBase as any).files)) {
    // New format from ingest-files.ts
    (knowledgeBase as any).files.forEach((file: any) => {
      chunks.push(file.text);
    });
  } else {
    // Legacy format (original portfolio.json)
    const portfolioData = knowledgeBase as any;

    // Add bio
    if (portfolioData.bio) {
      chunks.push(`Bio: ${portfolioData.bio}`);
    }

    // Add skills
    if (portfolioData.skills) {
      portfolioData.skills.forEach((skillGroup: any) => {
        chunks.push(
          `${skillGroup.category} skills: ${skillGroup.items.join(', ')}`
        );
      });
    }

    // Add projects
    if (portfolioData.projects) {
      portfolioData.projects.forEach((project: any) => {
        chunks.push(
          `Project: ${project.name}. ${project.description}. Technologies: ${project.technologies.join(', ')}. Highlights: ${project.highlights.join('; ')}`
        );
      });
    }

    // Add experience
    if (portfolioData.experience) {
      portfolioData.experience.forEach((exp: any) => {
        chunks.push(
          `Experience: ${exp.role} at ${exp.company} (${exp.duration}). Responsibilities: ${exp.responsibilities.join('; ')}`
        );
      });
    }

    // Add education
    if (portfolioData.education) {
      const edu = portfolioData.education;
      chunks.push(
        `Education: ${edu.degree} from ${edu.university} (${edu.year}). ${edu.achievements.join('; ')}`
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
  }

  return chunks;
}

/**
 * Find relevant chunks using simple text matching
 * @param query - The search query
 * @param topK - Number of top results to return
 * @returns Top K most similar chunks
 */
export function findRelevantChunks(
  query: string,
  topK: number = 3
): Array<{ text: string; score: number }> {
  // Initialize knowledge base if not done
  if (!knowledgeChunks) {
    knowledgeChunks = prepareKnowledgeChunks();
    console.log(`📚 Knowledge base initialized with ${knowledgeChunks.length} chunks`);
  }

  // Calculate similarity scores
  const scoredChunks = knowledgeChunks.map(text => ({
    text,
    score: calculateSimilarity(query, text),
  }));

  // Sort by score and return top K
  return scoredChunks
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}

/**
 * Reload the knowledge base (call this after running ingest script)
 */
export function reloadKnowledgeBase() {
  knowledgeChunks = null;
  console.log('🔄 Knowledge base cleared, will reload on next query');
}

/**
 * Get ALL knowledge chunks as a single string (for Full Context mode)
 */
export function getAllKnowledge(): string {
  if (!knowledgeChunks) {
    knowledgeChunks = prepareKnowledgeChunks();
    console.log(`📚 Knowledge base initialized with ${knowledgeChunks.length} chunks`);
  }
  return knowledgeChunks.join('\n\n');
}
