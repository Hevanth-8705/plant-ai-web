import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  Trash2, 
  Camera, 
  User as UserIcon, 
  Loader2, 
  Paperclip,
  X
} from 'lucide-react';
import { AIChatMessage, Plant } from '../types/index.ts';
import { api } from '../services/api.ts';
import { Button } from '../components/common/Button.tsx';

const SUGGESTED_PROMPTS = [
  'What gardening tasks should I complete today?',
  'Why are my tomato leaves turning yellow?',
  'How often should Monty (Monstera) be watered in autumn?',
  'Does my kitchen basil need direct sunlight or shade?',
  'What causes brown crispy leaf tips on indoor plants?',
  'How can I naturally prevent spider mites and aphids?',
  'When will my chili peppers be ready to harvest?',
];

export const AIChatPage: React.FC = () => {
  const [messages, setMessages] = useState<AIChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [attachedImage, setAttachedImage] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchHistory = async () => {
    try {
      const res = await api.chat.getHistory();
      setMessages(res.history || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim() && !attachedImage) return;

    const currentImage = attachedImage;
    setInput('');
    setAttachedImage('');

    // Optimistic user message
    const tempUserMsg: AIChatMessage = {
      id: `temp_${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
      imageUrl: currentImage || undefined,
    };
    setMessages((prev) => [...prev, tempUserMsg]);
    setLoading(true);

    try {
      const res = await api.chat.sendMessage({
        message: text,
        imageBase64: currentImage || undefined,
      });
      setMessages(res.history || []);
    } catch (err: any) {
      // Add error message
      setMessages((prev) => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          role: 'assistant',
          content: 'Sorry, I encountered a temporary connection glitch. Please check your prompt or try again in a moment.',
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = async () => {
    if (confirm('Clear chat history?')) {
      await api.chat.clear();
      setMessages([
        {
          id: 'welcome_reset',
          role: 'assistant',
          content: "Chat history cleared. I'm ready for your gardening questions!",
          timestamp: new Date().toISOString(),
        },
      ]);
    }
  };

  const handleImageFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const b64 = e.target?.result as string;
      if (b64) setAttachedImage(b64);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col bg-white rounded-3xl border border-stone-200/80 shadow-xs overflow-hidden animate-in fade-in duration-200">
      {/* Header */}
      <div className="px-6 py-4 border-b border-stone-200 bg-stone-50/70 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white flex items-center justify-center shadow-xs">
            <Bot className="w-5 h-5 text-emerald-100" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-stone-900 font-serif">PlantPal AI Assistant</h2>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                Gemini 3.8 Flash
              </span>
            </div>
            <p className="text-[11px] text-stone-500">
              Context-aware assistant connected to your personal garden inventory
            </p>
          </div>
        </div>

        <button
          onClick={handleClearHistory}
          className="text-stone-400 hover:text-stone-600 p-2 rounded-xl transition-colors"
          title="Clear conversation"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-[#fbfbf9]/60">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 max-w-2xl ${isUser ? 'ml-auto flex-row-reverse' : ''}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                  isUser
                    ? 'bg-emerald-700 text-white'
                    : 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                }`}
              >
                {isUser ? <UserIcon className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`rounded-2xl p-4 text-xs sm:text-sm leading-relaxed shadow-2xs whitespace-pre-line ${
                  isUser
                    ? 'bg-emerald-700 text-white rounded-tr-xs'
                    : 'bg-white text-stone-800 border border-stone-200/80 rounded-tl-xs'
                }`}
              >
                {/* Attached image if any */}
                {msg.imageUrl && (
                  <div className="mb-2 rounded-xl overflow-hidden max-h-48 border border-white/20">
                    <img src={msg.imageUrl} alt="Attached" className="w-full h-full object-cover" />
                  </div>
                )}
                {msg.content}
                <span
                  className={`block text-[10px] mt-2 ${
                    isUser ? 'text-emerald-200 text-right' : 'text-stone-400'
                  }`}
                >
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-start gap-3 max-w-2xl">
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-900 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-white border border-stone-200 rounded-2xl p-4 text-xs text-stone-500 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-emerald-700" />
              <span>PlantPal is consulting botanical principles...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompt Chips */}
      {messages.length <= 4 && (
        <div className="px-4 py-2 border-t border-stone-100 bg-white flex items-center gap-2 overflow-x-auto scrollbar-none">
          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 shrink-0">
            Suggested:
          </span>
          {SUGGESTED_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              onClick={() => handleSend(prompt)}
              className="text-xs bg-stone-100 hover:bg-emerald-50 hover:text-emerald-900 text-stone-700 px-3 py-1.5 rounded-full transition-colors shrink-0 whitespace-nowrap"
            >
              {prompt}
            </button>
          ))}
        </div>
      )}

      {/* Input Box */}
      <div className="p-4 border-t border-stone-200 bg-white">
        {attachedImage && (
          <div className="mb-2 relative inline-block">
            <img src={attachedImage} alt="Attachment preview" className="w-16 h-16 object-cover rounded-xl border border-stone-300" />
            <button
              onClick={() => setAttachedImage('')}
              className="absolute -top-1.5 -right-1.5 bg-stone-900 text-white rounded-full p-0.5 hover:bg-rose-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-xl transition-colors shrink-0"
            title="Attach plant photograph"
          >
            <Camera className="w-5 h-5" />
          </button>

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="Ask about watering, yellow leaves, pests, or harvest readiness..."
            className="flex-1 text-sm px-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-stone-50/50"
          />

          <Button
            variant="primary"
            onClick={() => handleSend()}
            disabled={(!input.trim() && !attachedImage) || loading}
            icon={<Send className="w-4 h-4" />}
          >
            Send
          </Button>

          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleImageFile(e.target.files[0]);
              }
            }}
          />
        </div>
      </div>
    </div>
  );
};
