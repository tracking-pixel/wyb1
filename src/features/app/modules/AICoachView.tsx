import React, { useState, useRef, useEffect } from 'react';
import { aiCoachService, ChatMessage } from '@/src/services/aiCoach';
import { useQuizStore } from '@/src/store/quizStore';
import { useWorkoutStore } from '@/src/store/workoutStore';
import { useTranslation } from '@/src/i18n';
import { Button } from '@/src/components/ui/Button';

export const AICoachView: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { t } = useTranslation();
  const { answers } = useQuizStore();
  const { currentDay, streak } = useWorkoutStore();

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg_welcome',
      sender: 'coach',
      text: `¡Hola, ${answers.user_name || 'amiga'}! Soy tu Coach de Ligera. Estoy aquí para acompañarte, responder tus dudas sobre las rutinas de caminata y pilates de pared, y darte ideas de comidas amables con tu cuerpo. ¿Cómo te sientes hoy?`,
      timestamp: new Date().toISOString(),
    },
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    const context = {
      userName: answers.user_name || 'amiga',
      primaryGoal: answers.primary_goal,
      limitations: answers.limitations,
      currentDay,
      streak,
    };

    const reply = await aiCoachService.sendMessage(text, context, messages);

    const coachMsg: ChatMessage = {
      id: `cch_${Date.now()}`,
      sender: 'coach',
      text: reply,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, coachMsg]);
    setIsLoading(false);
  };

  const suggestedQuestions = [
    t('app.ai_coach.suggested_questions.0'),
    t('app.ai_coach.suggested_questions.1'),
    t('app.ai_coach.suggested_questions.2'),
    t('app.ai_coach.suggested_questions.3'),
  ];

  return (
    <div className="flex flex-col h-[78vh] bg-white rounded-3xl border border-rose-100 shadow-sm overflow-hidden">
      {/* Top Header */}
      <div className="p-3.5 border-b border-rose-100 flex items-center justify-between bg-rose-50/50">
        <button
          onClick={onBack}
          className="text-xs font-semibold text-rose-800 flex items-center gap-1 hover:underline"
        >
          ← Volver
        </button>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-rose-800 text-white flex items-center justify-center text-xs font-bold shadow-xs">
            ✨
          </div>
          <span className="font-bold text-sm text-slate-900">
            {t('app.ai_coach.title')}
          </span>
        </div>
        <div className="w-8" />
      </div>

      {/* Health Disclaimer Banner */}
      <div className="px-3 py-1.5 bg-amber-50/90 border-b border-amber-200/60 text-[10px] text-amber-900 leading-tight">
        {t('app.ai_coach.disclaimer')}
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
        {messages.map((m) => {
          const isUser = m.sender === 'user';
          return (
            <div
              key={m.id}
              className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                  isUser
                    ? 'bg-rose-800 text-white rounded-br-xs shadow-xs'
                    : 'bg-slate-100 text-slate-800 rounded-bl-xs border border-slate-200/60'
                }`}
              >
                {m.text}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex justify-start">
            <div className="p-3 rounded-2xl bg-slate-100 text-slate-500 text-xs flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping" />
              <span>Escribiendo respuesta...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Questions */}
      {messages.length <= 3 && (
        <div className="px-3 py-1.5 border-t border-slate-100 bg-slate-50/50 flex gap-1.5 overflow-x-auto scrollbar-none">
          {suggestedQuestions.map((q, i) => (
            <button
              key={i}
              onClick={() => handleSendMessage(q)}
              className="px-2.5 py-1 rounded-xl bg-white border border-rose-200 text-[11px] font-medium text-rose-900 shrink-0 hover:bg-rose-50 transition"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="p-3 border-t border-rose-100 bg-white flex items-center gap-2"
      >
        <input
          type="text"
          placeholder={t('app.ai_coach.input_placeholder')}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isLoading}
          className="flex-1 min-h-[44px] px-3.5 text-xs rounded-xl border border-slate-200 focus:outline-rose-800"
        />
        <Button
          type="submit"
          size="sm"
          disabled={!input.trim() || isLoading}
          className="min-h-[44px] px-4"
        >
          {t('app.ai_coach.send')}
        </Button>
      </form>
    </div>
  );
};
