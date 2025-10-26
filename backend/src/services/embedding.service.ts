import OpenAI from 'openai';
import env from '../config/env';

class EmbeddingService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: env.OPENAI_API_KEY,
    });
  }

  async createEmbedding(text: string): Promise<number[]> {
    try {
      const response = await this.openai.embeddings.create({
        model: env.EMBEDDING_MODEL,
        input: text,
      });

      return response.data[0].embedding;
    } catch (error) {
      console.error('❌ Erreur lors de la création de l\'embedding:', error);
      throw error;
    }
  }

  async createEmbeddings(texts: string[]): Promise<number[][]> {
    try {
      const response = await this.openai.embeddings.create({
        model: env.EMBEDDING_MODEL,
        input: texts,
      });

      return response.data.map((item) => item.embedding);
    } catch (error) {
      console.error('❌ Erreur lors de la création des embeddings:', error);
      throw error;
    }
  }
}

export const embeddingService = new EmbeddingService();
