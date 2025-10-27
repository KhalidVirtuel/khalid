import OpenAI from 'openai';
import env from '../config/env';
import { ConversationMessage } from '../types';

class LLMService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: env.OPENAI_API_KEY,
    });
  }

  async chat(
    messages: ConversationMessage[],
    context?: string
  ): Promise<string> {
    try {
      const systemMessage: ConversationMessage = {
        role: 'system',
        content: `Tu es un assistant juridique AI spécialisé pour aider les avocats et leurs clients.
Tu dois fournir des conseils juridiques précis et professionnels en français.
${context ? `\n\nContexte pertinent:\n${context}` : ''}

Règles importantes:
- Toujours fournir des réponses précises et basées sur le droit français
- Citer les sources légales quand c'est pertinent
- Être clair et professionnel
- Si tu n'es pas sûr, le dire clairement`,
      };

      const response = await this.openai.chat.completions.create({
        model: env.OPENAI_CHAT_MODEL,
        messages: [systemMessage, ...messages],
        temperature: 0.7,
        max_tokens: 2048,
      });

      return response.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('❌ Erreur lors de l\'appel à OpenAI:', error);
      throw error;
    }
  }

  async generateContractDraft(
    contractType: string,
    details: any
  ): Promise<string> {
    try {
      const prompt = `Génère un projet de contrat de type "${contractType}" en français avec les détails suivants:
${JSON.stringify(details, null, 2)}

Le contrat doit être complet, professionnel et conforme au droit français.
Inclure toutes les clauses standards nécessaires.`;

      const response = await this.openai.chat.completions.create({
        model: env.OPENAI_CHAT_MODEL,
        messages: [
          {
            role: 'system',
            content: 'Tu es un assistant juridique spécialisé dans la rédaction de contrats en français.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 4096,
      });

      return response.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('❌ Erreur lors de la génération du contrat:', error);
      throw error;
    }
  }

  async analyzeDocument(documentText: string, question?: string): Promise<string> {
    try {
      const userMessage = question
        ? `Analyse le document suivant et réponds à la question: ${question}\n\nDocument:\n${documentText}`
        : `Analyse le document suivant et fournis un résumé détaillé:\n\n${documentText}`;

      const response = await this.openai.chat.completions.create({
        model: env.OPENAI_CHAT_MODEL,
        messages: [
          {
            role: 'system',
            content: 'Tu es un assistant juridique spécialisé dans l\'analyse de documents juridiques.',
          },
          {
            role: 'user',
            content: userMessage,
          },
        ],
        temperature: 0.5,
        max_tokens: 2048,
      });

      return response.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('❌ Erreur lors de l\'analyse du document:', error);
      throw error;
    }
  }
}

export const llmService = new LLMService();
