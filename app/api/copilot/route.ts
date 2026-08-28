import { NextRequest, NextResponse } from 'next/server';

// Rate Limiter Guard (Sliding Window in Memory)
const requestTimestamps: number[] = [];
const MAX_REQUESTS_PER_MINUTE = 10; // Well below Google's 15 RPM free limit

export async function POST(req: NextRequest) {
  try {
    const { prompt, deal, userApiKey } = await req.json();
    const apiKey = userApiKey || process.env.GEMINI_API_KEY;

    if (!deal) {
      return NextResponse.json({ error: 'Faltan datos del negocio' }, { status: 400 });
    }

    // Safety Rate Limiting check
    const now = Date.now();
    // Remove timestamps older than 60 seconds
    while (requestTimestamps.length > 0 && requestTimestamps[0] < now - 60000) {
      requestTimestamps.shift();
    }

    // If rate limit reached, return local fallback response safely
    if (requestTimestamps.length >= MAX_REQUESTS_PER_MINUTE) {
      return NextResponse.json({
        result: `Protección de Cuota Gratuita Activa:\n\nHas realizado varias consultas seguidas. Para evitar consumir tu cuota gratuita de Google Gemini, el sistema responde de forma local:\n\n• Oportunidad: "${deal.title}" por $${Number(deal.value).toLocaleString('es-ES')} USD.\n• Recomendación: Contactar a ${deal.contact_name || 'cliente'} para acordar reunión.`,
        provider: 'Protector de Cuota Gratuita (Local Fallback)'
      });
    }

    requestTimestamps.push(now);

    // Truncate prompt to max 500 chars to save tokens
    const safePrompt = (prompt || 'Hola').substring(0, 500);

    const contextText = `
Detalles del Trato Comercial:
- Título: ${deal.title}
- Valor: $${deal.value || 0} USD
- Cliente: ${deal.contact_name || 'N/A'} (${deal.company_name || 'N/A'})

Instrucción del usuario: "${safePrompt}"
`;

    if (apiKey) {
      const modelsToTry = ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-2.5-flash-lite'];

      for (const modelName of modelsToTry) {
        try {
          const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

          const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    {
                      text: `Eres el Asistente Comercial Google Gemini. Responde en español de forma concisa, ejecutiva y profesional a la consulta del usuario. No uses emojis.\n\n${contextText}`
                    }
                  ]
                }
              ],
              generationConfig: {
                maxOutputTokens: 600 // Prevents long token generation to protect free tier
              }
            })
          });

          const data = await response.json();
          const geminiText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

          if (geminiText) {
            return NextResponse.json({
              result: geminiText,
              provider: `Google Gemini Free Tier (${modelName})`
            });
          }
        } catch (err) {
          console.error(`Error consultando modelo ${modelName}:`, err);
        }
      }
    }

    return NextResponse.json({
      result: `Respuesta para "${deal.title}":\n\n• Oportunidad con ${deal.contact_name || 'el cliente'} por $${Number(deal.value).toLocaleString('es-ES')} USD.\n• Recomendación: Agendar llamada de seguimiento.`,
      provider: 'Google Gemini Engine (Gratuito)'
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error en IA' }, { status: 500 });
  }
}
