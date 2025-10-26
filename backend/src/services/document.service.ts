import fs from 'fs';
import path from 'path';
import pdfParse from 'pdf-parse';

class DocumentService {
  async extractTextFromPDF(filePath: string): Promise<string> {
    try {
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdfParse(dataBuffer);
      return data.text;
    } catch (error) {
      console.error('❌ Erreur lors de l\'extraction du PDF:', error);
      throw error;
    }
  }

  async extractTextFromFile(filePath: string, mimetype: string): Promise<string> {
    try {
      if (mimetype === 'application/pdf') {
        return await this.extractTextFromPDF(filePath);
      } else if (mimetype.startsWith('text/')) {
        return fs.readFileSync(filePath, 'utf-8');
      } else if (
        mimetype === 'application/msword' ||
        mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ) {
        // Pour les fichiers Word, on pourrait utiliser mammoth ou textract
        // Pour l'instant, on retourne un message
        return '[Document Word - extraction non implémentée]';
      } else {
        throw new Error(`Type de fichier non supporté: ${mimetype}`);
      }
    } catch (error) {
      console.error('❌ Erreur lors de l\'extraction du texte:', error);
      throw error;
    }
  }

  ensureUploadDirectory(directory: string) {
    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory, { recursive: true });
    }
  }

  deleteFile(filePath: string) {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      console.error('❌ Erreur lors de la suppression du fichier:', error);
    }
  }
}

export const documentService = new DocumentService();
