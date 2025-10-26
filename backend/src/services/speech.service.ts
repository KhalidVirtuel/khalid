import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import env from '../config/env';

class SpeechService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: env.OPENAI_API_KEY,
    });
  }

  async transcribeAudio(audioFilePath: string): Promise<string> {
    try {
      const audioFile = fs.createReadStream(audioFilePath);

      const response = await this.openai.audio.transcriptions.create({
        file: audioFile,
        model: env.WHISPER_MODEL,
        language: env.STT_LANGUAGE,
      });

      return response.text;
    } catch (error) {
      console.error('❌ Erreur lors de la transcription audio:', error);
      throw error;
    }
  }

  async synthesizeSpeech(text: string, outputPath: string): Promise<string> {
    try {
      const mp3 = await this.openai.audio.speech.create({
        model: env.TTS_MODEL,
        voice: env.TTS_VOICE as any,
        input: text,
      });

      const buffer = Buffer.from(await mp3.arrayBuffer());

      // Créer le dossier si nécessaire
      const dir = path.dirname(outputPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      fs.writeFileSync(outputPath, buffer);

      return outputPath;
    } catch (error) {
      console.error('❌ Erreur lors de la synthèse vocale:', error);
      throw error;
    }
  }
}

export const speechService = new SpeechService();
