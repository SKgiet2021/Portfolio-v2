export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export const INITIAL_PROMPTS = [
  "What projects have you built?",
  "Tell me about your tech stack",
  "How can I contact you?",
  "What's your experience?"
];

export function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
