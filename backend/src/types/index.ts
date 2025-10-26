import { Request } from 'express';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export interface ConversationMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface RAGSearchResult {
  id: string;
  score: number;
  payload: {
    text: string;
    documentId: string;
    filename: string;
    metadata?: any;
  };
}

export interface AudioTranscriptionResult {
  text: string;
  language?: string;
  duration?: number;
}

export interface SpeechSynthesisResult {
  audioUrl: string;
  duration?: number;
}
