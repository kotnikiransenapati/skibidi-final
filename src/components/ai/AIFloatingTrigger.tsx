import React from 'react';
import { Sparkles, Mic, MessageSquare } from 'lucide-react';

interface AIFloatingTriggerProps {
  onOpenChat: () => void;
  onOpenVoice: () => void;
}

export const AIFloatingTrigger: React.FC<AIFloatingTriggerProps> = ({
  onOpenChat,
  onOpenVoice,
}) => {
  return (
    <div className="fixed bottom-6 right-6 z-40 flex items-center space-x-2">
      {/* Voice Copilot Fast Trigger - Clean White Theme */}
      <button
        onClick={onOpenVoice}
        className="px-3.5 py-3 rounded-full bg-white hover:bg-emerald-50 text-slate-800 font-semibold text-xs shadow-xl border border-slate-200 flex items-center space-x-2 transition transform hover:-translate-y-0.5 active:scale-95 group"
        title="Live Voice Conversation (gemini-3.8-live)"
      >
        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <Mic className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition" />
        <span className="hidden sm:inline font-bold">Gemini Voice</span>
      </button>

      {/* Main AI Copilot Chat Trigger */}
      <button
        onClick={onOpenChat}
        className="px-4 py-3 rounded-full bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-700 hover:from-emerald-800 hover:to-teal-800 text-white font-semibold text-xs shadow-xl border border-emerald-400/30 flex items-center space-x-2 transition transform hover:-translate-y-0.5 active:scale-95 group"
        title="Open FarmDirect AI Copilot (Search & Maps Grounding, High Thinking)"
      >
        <Sparkles className="w-4 h-4 text-amber-300 group-hover:rotate-12 transition" />
        <span>Ask FarmDirect AI</span>
      </button>
    </div>
  );
};
