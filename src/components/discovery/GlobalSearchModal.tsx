import React, { useState, useEffect } from 'react';
import { ProduceItem } from '../../types';
import { searchDiscoveryService } from '../../services/searchDiscoveryService';
import { Mic, MicOff, Search, X, Sparkles, Volume2 } from 'lucide-react';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  produceList: ProduceItem[];
  onSelectProduce: (item: ProduceItem) => void;
  onSelectCategory?: (category: string) => void;
  autoStartVoice?: boolean;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  produceList,
  onSelectProduce,
  onSelectCategory,
  autoStartVoice = false,
}) => {
  const [query, setQuery] = useState<string>('');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [voiceNotice, setVoiceNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setIsListening(false);
      setVoiceNotice(null);
    } else if (autoStartVoice) {
      // Trigger voice search automatically when user clicked Voice in header
      const timer = setTimeout(() => {
        handleVoiceSearch();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen, autoStartVoice]);

  if (!isOpen) return null;

  const results = searchDiscoveryService.search(produceList, query);

  const handleVoiceSearch = async () => {
    setVoiceNotice(null);
    setIsListening(true);

    try {
      await searchDiscoveryService.startVoiceRecognition(
        (transcript) => {
          setQuery(transcript);
          setIsListening(false);
        },
        (errMessage) => {
          setVoiceNotice(errMessage);
          setIsListening(false);
        },
        () => {
          setIsListening(false);
        }
      );
    } catch (e: any) {
      setVoiceNotice(e?.message || 'Could not start voice search.');
      setIsListening(false);
    }
  };

  const sampleVoicePrompts = [
    'San Marzano Tomatoes',
    'Himachal Royal Apples',
    'A2 Gir Raw Milk',
    'Baby Spinach',
    'Cold-Pressed Mustard Oil',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-16 sm:pt-24 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
        {/* Search Input Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center gap-3 bg-white">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search farm produce, smallholder growers, Nashik/Shimla origins..."
            className="flex-1 text-sm sm:text-base font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none bg-transparent"
          />

          {/* Voice Search Button */}
          <button
            type="button"
            onClick={handleVoiceSearch}
            className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 cursor-pointer text-xs font-semibold transition-all ${
              isListening
                ? 'bg-red-500 text-white animate-pulse shadow-md'
                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/80'
            }`}
            title="Search by Voice (Web Speech & Mic Permission)"
          >
            {isListening ? (
              <>
                <Mic className="w-4 h-4 animate-bounce" />
                <span>Listening...</span>
              </>
            ) : (
              <>
                <Mic className="w-4 h-4 text-emerald-700" />
                <span>Voice Type</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center cursor-pointer transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Voice Listening Notice */}
        {isListening && (
          <div className="px-5 py-3 bg-red-50 border-b border-red-100 text-xs text-red-800 flex items-center justify-between animate-fadeIn">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping"></span>
              <span className="font-semibold">Microphone active: Speak produce name clearly...</span>
            </div>
            <button
              onClick={() => setIsListening(false)}
              className="text-red-700 hover:underline font-bold text-[11px]"
            >
              Stop
            </button>
          </div>
        )}

        {/* Voice Notice / Permission Alert */}
        {voiceNotice && (
          <div className="px-5 py-2.5 bg-amber-50 text-xs text-amber-900 border-b border-amber-200/80 flex items-center justify-between">
            <span>{voiceNotice}</span>
            <button
              onClick={() => setVoiceNotice(null)}
              className="text-amber-700 font-bold ml-2 hover:underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Quick Voice Chips (1-Click Voice Query Fallback) */}
        <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-100 flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-slate-400 font-semibold text-[10px] uppercase tracking-wider flex items-center gap-1">
            <Volume2 className="w-3 h-3 text-emerald-600" />
            <span>Voice prompts:</span>
          </span>
          {sampleVoicePrompts.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => setQuery(prompt)}
              className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-emerald-600 text-slate-700 hover:text-emerald-800 font-medium cursor-pointer transition-colors text-[11px]"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Quick Category Badges */}
        <div className="px-4 py-2 bg-white border-b border-slate-200/80 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-400 font-semibold text-[10px] uppercase tracking-wider">Categories:</span>
          {['all', 'fruits', 'leafy', 'dairy', 'staples'].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => {
                onSelectCategory?.(cat);
                onClose();
              }}
              className="px-2 py-0.5 rounded-md hover:bg-slate-100 text-slate-600 font-medium cursor-pointer text-xs"
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>

        {/* Search Results */}
        <div className="p-4 overflow-y-auto space-y-2 flex-1">
          {results.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs space-y-1">
              <p>No harvest lots found matching "{query}".</p>
              <p className="text-slate-500">Try searching "tomatoes", "apples", or "milk".</p>
            </div>
          ) : (
            results.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  onSelectProduce(item);
                  onClose();
                }}
                className="p-3 rounded-2xl hover:bg-emerald-50/70 border border-slate-100 hover:border-emerald-300 flex items-center justify-between cursor-pointer transition-all group"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                  />
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm group-hover:text-emerald-800 transition-colors">
                      {item.name}
                    </h4>
                    <span className="text-xs text-slate-500">
                      {item.farmer} · {item.origin} · {item.badge}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-sm font-bold text-slate-900 block">
                    ₹{item.price} <span className="text-xs text-slate-400 font-normal">/{item.unit}</span>
                  </span>
                  <span className="text-[10px] text-emerald-800 font-bold bg-emerald-100/90 px-2 py-0.5 rounded-full">
                    94.1% Direct
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
