import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  // Server
  PORT: z.string().default('8787'),
  USE_WS: z.string().default('true'),
  JWT_SECRET: z.string().min(10),

  // Database
  DATABASE_URL: z.string(),
  MYSQL_HOST: z.string(),
  MYSQL_PORT: z.string(),
  MYSQL_USER: z.string(),
  MYSQL_PASSWORD: z.string(),
  MYSQL_DATABASE: z.string(),

  // Groq
  GROQ_API_KEY: z.string(),

  // OpenAI
  OPENAI_API_KEY: z.string(),
  OPENAI_CHAT_MODEL: z.string().default('gpt-4o-mini'),
  EMBEDDING_MODEL: z.string().default('text-embedding-3-small'),

  // Speech
  STT_LANGUAGE: z.string().default('fr'),
  WHISPER_MODEL: z.string().default('whisper-1'),
  TTS_MODEL: z.string().default('tts-1'),
  TTS_VOICE: z.string().default('alloy'),

  // Qdrant
  QDRANT_URL: z.string(),
  QDRANT_API_KEY: z.string().optional(),
  QDRANT_COLLECTION: z.string().default('company_knowledge_fr'),
});

export const env = envSchema.parse(process.env);

export default env;
