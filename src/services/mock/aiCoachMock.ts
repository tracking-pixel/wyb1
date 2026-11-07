import { AICoachContext, AICoachService, ChatMessage } from '../aiCoach';

class AICoachServiceImpl implements AICoachService {
  async sendMessage(
    message: string,
    context?: AICoachContext,
    history?: ChatMessage[]
  ): Promise<string> {
    try {
      const response = await fetch('/api/coach', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          context,
          history: history?.slice(-6).map((m) => ({
            role: m.sender === 'user' ? 'user' : 'model',
            text: m.text,
          })),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.reply) {
          return data.reply;
        }
      }
    } catch {
      // Fallback below
    }

    // Graceful empathetic fallback
    const name = context?.userName || 'amiga';
    const lower = message.toLowerCase();

    if (lower.includes('rodilla') || lower.includes('dolor') || lower.includes('espalda') || lower.includes('articulación')) {
      return `Hola ${name}, cuidar de ti es lo primero. Si sientes dolor agudo o molestia persistente, por favor consulta con un médico o fisioterapeuta. Mientras tanto, en tu plan de Ligera puedes usar las variaciones en silla o con la espalda completamente apoyada en la pared, sin flexionar profundamente las rodillas ni realizar ningún impacto. ¿Te gustaría que adaptemos la sesión de hoy a algo más suave?`;
    }

    if (lower.includes('comida') || lower.includes('merienda') || lower.includes('receta') || lower.includes('cena') || lower.includes('hambre')) {
      return `¡Qué buena pregunta, ${name}! Te recomiendo una merienda antiinflamatoria y saciante: un puñadito de almendras tostadas con rodajas de manzana o media taza de yogur griego sin azúcar con canela. En Ligera nunca recomendamos pasar hambre ni dietas extremas; lo importante es nutrir tu cuerpo con proteínas limpias y grasas buenas para mantener tu energía estable.`;
    }

    if (lower.includes('motivación') || lower.includes('cansada') || lower.includes('ánimo') || lower.includes('pereza')) {
      return `Es completamente natural tener días con menos energía, ${name}. Recuerda que la constancia no significa dar el 100% de fuerza todos los días, sino hacer presencia. Con solo 5 a 10 minutos de respiración y estiramientos suaves en la pared habrás cumplido contigo misma. Respeta tu cuerpo, ponte ropa cómoda y hagamos solo unos pasos ligeros juntas. ¡Estoy contigo!`;
    }

    return `Hola ${name}, me encanta que me preguntes eso. El movimiento suave y diario de caminata y pilates de pared está diseñado para que te sientas con más vitalidad y ligereza sin agotarte. Si mantienes este ritmo amable, en pocos días notarás tu espalda más despejada y mayor tono en tu abdomen. ¿Hay alguna zona o ejercicio en particular que quieras repasar hoy?`;
  }
}

export const aiCoachService = new AICoachServiceImpl();
