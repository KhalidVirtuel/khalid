interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export const streamLegalChat = async ({
  messages,
  onDelta,
  onDone,
  onError,
}: {
  messages: Message[];
  onDelta: (deltaText: string) => void;
  onDone: () => void;
  onError?: (error: string) => void;
}) => {
  try {
    const { supabase } = await import('@/integrations/supabase/client');
    const session = await supabase.auth.getSession();
    
    if (!session.data.session) {
      onError?.("Vous devez être connecté pour utiliser le chat.");
      return;
    }

    const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/legal-chat`;

    const resp = await fetch(CHAT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.data.session.access_token}`,
      },
      body: JSON.stringify({ messages }),
    });

    if (resp.status === 429) {
      onError?.("Limite de requêtes atteinte. Veuillez réessayer dans quelques instants.");
      return;
    }

    if (resp.status === 402) {
      onError?.("Crédit insuffisant. Veuillez recharger votre compte.");
      return;
    }

    if (!resp.ok || !resp.body) {
      throw new Error('Failed to start stream');
    }

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let textBuffer = '';
    let streamDone = false;

    while (!streamDone) {
      const { done, value } = await reader.read();
      if (done) break;
      textBuffer += decoder.decode(value, { stream: true });

      // Process line-by-line as data arrives
      let newlineIndex: number;
      while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
        let line = textBuffer.slice(0, newlineIndex);
        textBuffer = textBuffer.slice(newlineIndex + 1);

        if (line.endsWith('\r')) line = line.slice(0, -1);
        if (line.startsWith(':') || line.trim() === '') continue;
        if (!line.startsWith('data: ')) continue;

        const jsonStr = line.slice(6).trim();
        if (jsonStr === '[DONE]') {
          streamDone = true;
          break;
        }

        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content as string | undefined;
          if (content) onDelta(content);
        } catch {
          textBuffer = line + '\n' + textBuffer;
          break;
        }
      }
    }

    // Final flush
    if (textBuffer.trim()) {
      for (let raw of textBuffer.split('\n')) {
        if (!raw) continue;
        if (raw.endsWith('\r')) raw = raw.slice(0, -1);
        if (raw.startsWith(':') || raw.trim() === '') continue;
        if (!raw.startsWith('data: ')) continue;
        const jsonStr = raw.slice(6).trim();
        if (jsonStr === '[DONE]') continue;
        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content as string | undefined;
          if (content) onDelta(content);
        } catch {}
      }
    }

    onDone();
  } catch (error) {
    console.error('streamLegalChat error:', error);
    onError?.(error instanceof Error ? error.message : 'Erreur de communication avec l\'IA');
  }
};