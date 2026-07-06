/**
 * StadiumPulse AI - Chat Widget Component
 *
 * "Ask StadiumPulse" floating chat for navigation assistance.
 * Supports multi-language responses and debounced AI calls.
 */
import { useState, useRef, useEffect, useCallback } from 'react';
import { MessageCircle, Send, X, Loader2, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';
import * as api from '@/services/api';
import type { ChatMessage } from '@/types';

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '0',
      role: 'assistant',
      content: 'Hi! I\'m StadiumPulse AI 🏟️ Ask me anything about navigating the stadium — "Where is the nearest restroom?", "How do I get to Block C from Gate 2?"',
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { language } = useAuthStore();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  const sendMessage = useCallback(async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await api.askNavigation(input.trim(), undefined, language);
      const aiContent = res.success && res.data
        ? res.data.response
        : 'Sorry, I couldn\'t process that. Please try again.';

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiContent,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'I\'m having trouble connecting right now. Please try again in a moment.',
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, language]);

  return (
    <>
      {/* Chat Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-primary to-accent shadow-[0_0_30px_rgba(99,102,241,0.5)] flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-50 animate-pulse-glow group"
          aria-label="Open StadiumPulse AI chat assistant"
          title="Ask StadiumPulse AI"
        >
          <MessageCircle className="w-7 h-7 text-white group-hover:rotate-12 transition-transform duration-300" strokeWidth={2.5} />
          <div className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full border-2 border-[#050810] animate-bounce" />
        </button>
      )}

      {/* Chat Panel */}
      {isOpen && (
        <div
          className="fixed inset-x-3 bottom-3 sm:bottom-6 sm:right-6 sm:left-auto w-auto sm:w-[420px] max-w-[calc(100vw-1.5rem)] h-[min(34rem,calc(100vh-1.5rem))] sm:h-[36rem] max-h-[calc(100vh-1.5rem)] bg-slate-900/90 backdrop-blur-2xl border border-white/10 rounded-3xl flex flex-col z-50 animate-fade-in shadow-2xl overflow-hidden"
          role="dialog"
          aria-label="StadiumPulse AI navigation assistant"
          aria-modal="false"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/[0.02]">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg border border-white/20">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-[1.05rem] font-bold text-white tracking-wide">StadiumPulse AI</h2>
                <p className="text-xs font-medium text-primary mt-0.5 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  Navigation Assistant
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
              aria-label="Close chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div
            className="flex-1 overflow-y-auto px-6 py-5 space-y-6 custom-scrollbar relative"
            role="log"
            aria-label="Chat messages"
            aria-live="polite"
          >
            <div className="flex flex-wrap gap-2">
              {['Nearest gate', 'Food options', 'Accessible route'].map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => setInput(prompt)}
                  className="text-[11px] font-bold uppercase tracking-wider px-3 py-2 rounded-full bg-white/5 text-slate-300 border border-white/5 hover:bg-white/10 hover:text-white transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  'max-w-[85%] animate-fade-in flex flex-col',
                  msg.role === 'user' ? 'ml-auto items-end' : 'mr-auto items-start',
                )}
              >
                <div
                  className={cn(
                    'rounded-2xl px-5 py-3.5 text-[0.95rem] leading-relaxed shadow-md',
                    msg.role === 'user'
                      ? 'bg-gradient-to-r from-primary to-accent text-white rounded-br-sm'
                      : 'bg-slate-800/80 border border-white/5 text-slate-200 rounded-bl-sm',
                  )}
                >
                  {msg.content}
                </div>
                <p className="text-[10px] font-semibold tracking-wider text-slate-500 mt-2 uppercase">
                  {new Date(msg.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            ))}
            {isLoading && (
              <div className="flex items-center gap-3 text-primary mr-auto bg-slate-800/50 px-4 py-2.5 rounded-2xl rounded-bl-sm border border-white/5">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-xs font-bold tracking-widest uppercase">Thinking...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-white/10 bg-slate-900/50">
            <div className="flex items-center gap-3 bg-slate-800/60 p-1.5 rounded-2xl border border-white/5 shadow-inner focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/50 transition-all">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') sendMessage();
                }}
                placeholder="Ask about navigation, food, etc..."
                className="flex-1 bg-transparent text-white placeholder:text-slate-500 px-4 py-2 text-[0.95rem] outline-none"
                aria-label="Type your navigation question"
                disabled={isLoading}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || isLoading}
                className="w-11 h-11 rounded-xl bg-gradient-to-r from-primary to-accent flex items-center justify-center disabled:opacity-50 hover:shadow-[0_0_15px_rgba(99,102,241,0.4)] transition-all duration-300"
                aria-label="Send message"
              >
                <Send className="w-5 h-5 text-white ml-1" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
