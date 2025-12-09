/**
 * Agent Guardrails - Multi-Layer Defense System
 * 
 * Layer 1: Input Validation (pre-processing)
 * Layer 2: Output Sanitization (post-processing)
 * Layer 3: Circuit Breaker (consecutive meta-query detection)
 */

// Meta-query patterns that should be deflected
// IMPORTANT: These should ONLY catch questions about the AI itself, not about Swadhin
const META_QUERY_PATTERNS = [
  // AI/Model identity questions (specific to the agent, not Swadhin)
  /\b(what|which)\s+(model|AI|system|chatbot|bot|llm)\s+(are\s+you|is\s+this)/i,
  /\bare\s+you\s+(an?\s+)?(AI|bot|chatbot|model|gemini|gpt|claude|llama)/i,
  /\bwhat\s+are\s+you\s+(exactly|really|made\s+of)/i,
  /\bhow\s+do\s+you\s+(work|function|think|process)/i,
  
  // System/prompt probing (jailbreak attempts)
  /\b(system|hidden|secret)\s*prompt/i,
  /\bignore\s+(previous|above|all|prior)\s*(instructions?|prompts?)/i,
  /\bshow\s+(me\s+)?(your|the)\s*(prompt|instructions?|system)/i,
  /\bwhat\s+(are\s+)?your\s+instructions?\s*(for|from)/i,
  /\brepeat\s+(the\s+)?(system|initial|above)\s*(prompt|instructions)/i,
  
  // Technical architecture probing (specific terms)
  /\bRAG\s*(system|pipeline|retrieval)/i,
  /\bvector\s*database/i,
  /\blancedb/i,
  /\bhow\s+(were|are)\s+you\s+(trained|built|programmed)/i,
  
  // Jailbreak attempts
  /\bDAN\s*mode/i,
  /\bjailbreak/i,
  /\bbypass\s+(your\s+)?restrictions/i,
  /\bforget\s+(everything|all)\s+(you\s+know|about)/i,
];

// Forbidden output phrases that indicate character break
const FORBIDDEN_OUTPUT_PHRASES = [
  "i'm an ai",
  "i am an ai",
  "language model",
  "gemini",
  "llm",
  "knowledge base",
  "rag system",
  "vector database",
  "lancedb",
  "indexed document",
  "system prompt",
  "my instructions",
  "i was trained",
  "i'm a chatbot",
  "i am a chatbot",
  "resume parsing",
  "pdf extraction",
  "embedding model",
  "retrieval augmented",
];

// Canned deflection responses (rotate for natural feel)
const DEFLECTION_RESPONSES = [
  "I'm here to talk about Swadhin's work and experience. What aspect of his skills interests you?",
  "Let's focus on Swadhin's projects and capabilities. Anything specific you'd like to know?",
  "I'm happy to discuss Swadhin's professional background. What would you like to explore?",
  "That's outside my scope here. I'm focused on Swadhin's work—curious about his projects or experience?",
];

// Circuit breaker response for persistent meta-queries
const CIRCUIT_BREAKER_RESPONSE = 
  "I'm focused on helping with questions about Swadhin's projects and experience. If you have professional inquiries, I'm happy to help with those.";

// Track meta-query count per session (simple in-memory, resets on restart)
const sessionMetaCounts = new Map<string, number>();

/**
 * Layer 1: Input Validation
 * Detects meta-queries before sending to LLM
 */
export function isMetaQuery(input: string): boolean {
  const normalizedInput = input.toLowerCase().trim();
  
  for (const pattern of META_QUERY_PATTERNS) {
    if (pattern.test(normalizedInput)) {
      console.log(`🛡️ Meta-query detected: pattern matched`);
      return true;
    }
  }
  
  return false;
}

/**
 * Layer 2: Output Sanitization
 * Catches character breaks in LLM responses
 */
export function sanitizeOutput(response: string): { sanitized: boolean; output: string } {
  const lowerResponse = response.toLowerCase();
  
  for (const phrase of FORBIDDEN_OUTPUT_PHRASES) {
    if (lowerResponse.includes(phrase)) {
      console.log(`🛡️ Forbidden phrase detected in output: "${phrase}"`);
      return {
        sanitized: true,
        output: getDeflectionResponse(),
      };
    }
  }
  
  return { sanitized: false, output: response };
}

/**
 * Layer 3: Circuit Breaker
 * Tracks consecutive meta-queries per session
 */
export function checkCircuitBreaker(sessionId: string, isMetaQuery: boolean): { triggered: boolean; response?: string } {
  if (!isMetaQuery) {
    // Reset count on legitimate query
    sessionMetaCounts.set(sessionId, 0);
    return { triggered: false };
  }
  
  const currentCount = (sessionMetaCounts.get(sessionId) || 0) + 1;
  sessionMetaCounts.set(sessionId, currentCount);
  
  if (currentCount >= 3) {
    console.log(`🛡️ Circuit breaker triggered: ${currentCount} consecutive meta-queries`);
    return { triggered: true, response: CIRCUIT_BREAKER_RESPONSE };
  }
  
  return { triggered: false };
}

/**
 * Get a random deflection response for natural feel
 */
export function getDeflectionResponse(): string {
  const index = Math.floor(Math.random() * DEFLECTION_RESPONSES.length);
  return DEFLECTION_RESPONSES[index];
}

/**
 * Check if response is about Swadhin's work (for confidence scoring)
 */
export function isAboutSwadhinWork(response: string): boolean {
  const workIndicators = [
    'swadhin', 'project', 'skill', 'experience', 'internship',
    'wipro', 'salesforce', 'logozon', 'giet', 'python', 'react',
    'ui/ux', 'data science', 'machine learning', 'flask', 'django',
    'rainfall', 'loan', 'deskbot', 'vulnerability'
  ];
  
  const lowerResponse = response.toLowerCase();
  return workIndicators.some(indicator => lowerResponse.includes(indicator));
}

/**
 * Detect uncertainty markers that might indicate character break
 */
export function detectCharacterBreak(response: string): { breaking: boolean; safeResponse: string } {
  const uncertaintyMarkers = [
    "i'm not sure what i am",
    "i think i might be",
    "i don't have personal",
    "as an ai",
    "my training data",
  ];
  
  const lowerResponse = response.toLowerCase();
  
  for (const marker of uncertaintyMarkers) {
    if (lowerResponse.includes(marker)) {
      if (!isAboutSwadhinWork(response)) {
        console.log(`🛡️ Character break detected: uncertainty marker "${marker}"`);
        return {
          breaking: true,
          safeResponse: getDeflectionResponse(),
        };
      }
    }
  }
  
  return { breaking: false, safeResponse: response };
}

/**
 * Master validation function - combines all layers
 */
export function validateAndProcess(
  input: string, 
  sessionId: string = 'default'
): { 
  blocked: boolean; 
  reason?: string; 
  cannedResponse?: string;
} {
  // Layer 1: Check if meta-query
  const isMeta = isMetaQuery(input);
  
  // Layer 3: Check circuit breaker
  const circuitBreaker = checkCircuitBreaker(sessionId, isMeta);
  if (circuitBreaker.triggered) {
    return { 
      blocked: true, 
      reason: 'circuit_breaker', 
      cannedResponse: circuitBreaker.response 
    };
  }
  
  // If meta-query, return canned response
  if (isMeta) {
    return { 
      blocked: true, 
      reason: 'meta_query', 
      cannedResponse: getDeflectionResponse() 
    };
  }
  
  // Allow through to LLM
  return { blocked: false };
}

/**
 * Post-process LLM output through all safety layers
 */
export function postProcessOutput(response: string): string {
  // Layer 2: Output sanitization
  const sanitized = sanitizeOutput(response);
  if (sanitized.sanitized) {
    return sanitized.output;
  }
  
  // Confidence check: character break detection
  const characterCheck = detectCharacterBreak(response);
  if (characterCheck.breaking) {
    return characterCheck.safeResponse;
  }
  
  return response;
}
