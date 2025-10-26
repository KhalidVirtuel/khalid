import { QdrantClient } from '@qdrant/js-client-rest';
import env from '../config/env';
import { embeddingService } from './embedding.service';

class QdrantService {
  private client: QdrantClient;
  private collectionName: string;

  constructor() {
    this.client = new QdrantClient({
      url: env.QDRANT_URL,
      apiKey: env.QDRANT_API_KEY || undefined,
    });
    this.collectionName = env.QDRANT_COLLECTION;
  }

  async initialize() {
    try {
      // Vérifier si la collection existe
      const collections = await this.client.getCollections();
      const exists = collections.collections.some(
        (col) => col.name === this.collectionName
      );

      if (!exists) {
        // Créer la collection
        await this.client.createCollection(this.collectionName, {
          vectors: {
            size: 1536, // text-embedding-3-small dimension
            distance: 'Cosine',
          },
        });
        console.log(`✅ Collection Qdrant '${this.collectionName}' créée`);
      } else {
        console.log(`✅ Collection Qdrant '${this.collectionName}' existe déjà`);
      }
    } catch (error) {
      console.error('❌ Erreur lors de l\'initialisation de Qdrant:', error);
      throw error;
    }
  }

  async indexDocument(
    documentId: string,
    text: string,
    metadata: {
      filename: string;
      userId: string;
      projectId?: string;
      documentType?: string;
    }
  ) {
    try {
      // Découper le texte en chunks
      const chunks = this.chunkText(text, 1000);

      const points = [];

      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        const embedding = await embeddingService.createEmbedding(chunk);

        points.push({
          id: `${documentId}_chunk_${i}`,
          vector: embedding,
          payload: {
            documentId,
            chunkIndex: i,
            text: chunk,
            ...metadata,
          },
        });
      }

      await this.client.upsert(this.collectionName, {
        wait: true,
        points,
      });

      console.log(`✅ Document ${documentId} indexé avec ${chunks.length} chunks`);
      return { success: true, chunksCount: chunks.length };
    } catch (error) {
      console.error('❌ Erreur lors de l\'indexation:', error);
      throw error;
    }
  }

  async search(query: string, limit: number = 5, filter?: any) {
    try {
      const queryEmbedding = await embeddingService.createEmbedding(query);

      const searchResult = await this.client.search(this.collectionName, {
        vector: queryEmbedding,
        limit,
        filter,
        with_payload: true,
      });

      return searchResult.map((result) => ({
        id: result.id,
        score: result.score,
        payload: result.payload,
      }));
    } catch (error) {
      console.error('❌ Erreur lors de la recherche:', error);
      throw error;
    }
  }

  async deleteDocument(documentId: string) {
    try {
      await this.client.delete(this.collectionName, {
        wait: true,
        filter: {
          must: [
            {
              key: 'documentId',
              match: { value: documentId },
            },
          ],
        },
      });

      console.log(`✅ Document ${documentId} supprimé de Qdrant`);
    } catch (error) {
      console.error('❌ Erreur lors de la suppression:', error);
      throw error;
    }
  }

  private chunkText(text: string, maxChunkSize: number = 1000): string[] {
    const chunks: string[] = [];
    const paragraphs = text.split('\n\n');

    let currentChunk = '';

    for (const paragraph of paragraphs) {
      if ((currentChunk + paragraph).length > maxChunkSize) {
        if (currentChunk) {
          chunks.push(currentChunk.trim());
          currentChunk = '';
        }

        // Si un paragraphe est trop long, le découper
        if (paragraph.length > maxChunkSize) {
          const sentences = paragraph.split('. ');
          for (const sentence of sentences) {
            if ((currentChunk + sentence).length > maxChunkSize) {
              if (currentChunk) {
                chunks.push(currentChunk.trim());
                currentChunk = '';
              }
              chunks.push(sentence.trim());
            } else {
              currentChunk += sentence + '. ';
            }
          }
        } else {
          currentChunk = paragraph + '\n\n';
        }
      } else {
        currentChunk += paragraph + '\n\n';
      }
    }

    if (currentChunk.trim()) {
      chunks.push(currentChunk.trim());
    }

    return chunks;
  }
}

export const qdrantService = new QdrantService();
