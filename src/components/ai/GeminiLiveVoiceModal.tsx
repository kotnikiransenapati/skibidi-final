import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  PhoneOff,
  Volume2,
  Sparkles,
  X,
  Radio,
  AlertCircle,
  MessageSquare,
  Send,
} from 'lucide-react';

interface GeminiLiveVoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToChat?: () => void;
}

export const GeminiLiveVoiceModal: React.FC<GeminiLiveVoiceModalProps> = ({
  isOpen,
  onClose,
  onSwitchToChat,
}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isTalking, setIsTalking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isMicAvailable, setIsMicAvailable] = useState(true);
  const [statusText, setStatusText] = useState('Ready to connect with gemini-3.8-live');
  const [noticeMessage, setNoticeMessage] = useState<string | null>(null);
  const [textVoicePrompt, setTextVoicePrompt] = useState('');

  const wsRef = useRef<WebSocket | null>(null);
  const inputAudioCtxRef = useRef<AudioContext | null>(null);
  const outputAudioCtxRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const audioQueueRef = useRef<AudioBufferSourceNode[]>([]);
  const nextPlayTimeRef = useRef<number>(0);

  // Clean up audio and socket on unmount or close
  useEffect(() => {
    if (!isOpen) {
      handleDisconnect();
    }
  }, [isOpen]);

  const pcmToBase64 = (float32Array: Float32Array): string => {
    const pcm16 = new Int16Array(float32Array.length);
    for (let i = 0; i < float32Array.length; i++) {
      const s = Math.max(-1, Math.min(1, float32Array[i]));
      pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
    }
    const bytes = new Uint8Array(pcm16.buffer);
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  const playAudioChunk = (base64Audio: string) => {
    try {
      if (!outputAudioCtxRef.current) {
        outputAudioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({
          sampleRate: 24000,
        });
      }

      const ctx = outputAudioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const binary = atob(base64Audio);
      const len = binary.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binary.charCodeAt(i);
      }

      const pcm16 = new Int16Array(bytes.buffer);
      const float32 = new Float32Array(pcm16.length);
      for (let i = 0; i < pcm16.length; i++) {
        float32[i] = pcm16[i] / 32768.0;
      }

      const audioBuffer = ctx.createBuffer(1, float32.length, 24000);
      audioBuffer.getChannelData(0).set(float32);

      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);

      const currentTime = ctx.currentTime;
      const startTime = Math.max(currentTime, nextPlayTimeRef.current);
      source.start(startTime);
      nextPlayTimeRef.current = startTime + audioBuffer.duration;

      audioQueueRef.current.push(source);
      setIsTalking(true);
      setStatusText('Gemini 3.8 Live is speaking...');

      source.onended = () => {
        audioQueueRef.current = audioQueueRef.current.filter((s) => s !== source);
        if (audioQueueRef.current.length === 0) {
          setIsTalking(false);
          setStatusText(isMicAvailable ? 'Listening to your voice...' : 'Ready for next voice query');
        }
      };
    } catch (err) {
      console.warn('Audio chunk playback warning:', err);
    }
  };

  const stopAllAudioPlayback = () => {
    audioQueueRef.current.forEach((source) => {
      try {
        source.stop();
        source.disconnect();
      } catch (_) {}
    });
    audioQueueRef.current = [];
    nextPlayTimeRef.current = 0;
    setIsTalking(false);
  };

  const handleConnect = async () => {
    setNoticeMessage(null);
    setStatusText('Connecting to gemini-3.8-live...');

    let micStream: MediaStream | null = null;
    let micSupported = false;

    // 1. Safe microphone acquisition
    try {
      if (navigator.mediaDevices && typeof navigator.mediaDevices.getUserMedia === 'function') {
        micStream = await navigator.mediaDevices.getUserMedia({
          audio: {
            channelCount: 1,
            sampleRate: 16000,
            echoCancellation: true,
            noiseSuppression: true,
          },
        });
        mediaStreamRef.current = micStream;
        micSupported = true;
        setIsMicAvailable(true);

        const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({
          sampleRate: 16000,
        });
        inputAudioCtxRef.current = inputCtx;

        const source = inputCtx.createMediaStreamSource(micStream);
        const processor = inputCtx.createScriptProcessor(4096, 1, 1);
        processorRef.current = processor;
        source.connect(processor);
        processor.connect(inputCtx.destination);
      } else {
        setIsMicAvailable(false);
        setNoticeMessage('Microphone access is not supported in this browser window. You can interact using voice test queries.');
      }
    } catch (micErr: any) {
      // Gracefully handle denied or restricted mic permission without throwing fatal error
      console.warn('Microphone permission not granted or restricted by sandbox:', micErr?.message);
      setIsMicAvailable(false);
      setNoticeMessage('Microphone permission was denied or restricted by browser. You can click sample questions or type a voice prompt to hear live spoken responses.');
    }

    // 2. Setup WebSocket connection to Gemini 3.8 Live API
    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/live`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        setIsListening(micSupported);
        setStatusText(
          micSupported
            ? 'Connected to Gemini 3.8 Live. Speak now!'
            : 'Connected to Gemini 3.8 Live. Select or type a question to hear live audio.'
        );
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.error) {
            setNoticeMessage(msg.error);
            setStatusText('Connection error');
          } else if (msg.audio) {
            playAudioChunk(msg.audio);
          } else if (msg.interrupted) {
            stopAllAudioPlayback();
            setStatusText('Interrupted. Listening...');
          }
        } catch (e) {
          console.warn('Failed to parse WS message:', e);
        }
      };

      ws.onerror = (err) => {
        console.warn('WebSocket live notice:', err);
        setNoticeMessage('Live voice gateway is reconnecting or unavailable in this network.');
        setIsConnected(false);
      };

      ws.onclose = () => {
        setIsConnected(false);
        setIsListening(false);
        setIsTalking(false);
        setStatusText('Voice session ended');
      };

      // 3. Stream mic chunks if microphone is active
      if (processorRef.current && micSupported) {
        processorRef.current.onaudioprocess = (e) => {
          if (ws.readyState === WebSocket.OPEN && !isMuted) {
            const inputData = e.inputBuffer.getChannelData(0);
            const base64 = pcmToBase64(inputData);
            ws.send(JSON.stringify({ audio: base64 }));
          }
        };
      }
    } catch (wsErr: any) {
      console.warn('Live voice setup warning:', wsErr);
      setNoticeMessage('Could not connect to live voice server. You can switch to AI Chat.');
      setStatusText('Connection standby');
    }
  };

  const handleDisconnect = () => {
    stopAllAudioPlayback();

    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (inputAudioCtxRef.current) {
      inputAudioCtxRef.current.close().catch(() => {});
      inputAudioCtxRef.current = null;
    }
    if (outputAudioCtxRef.current) {
      outputAudioCtxRef.current.close().catch(() => {});
      outputAudioCtxRef.current = null;
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    setIsConnected(false);
    setIsListening(false);
    setIsTalking(false);
    setStatusText('Voice session closed');
  };

  const toggleMute = () => {
    setIsMuted((prev) => !prev);
  };

  const sendVoiceQuery = async (queryText: string) => {
    if (!queryText.trim()) return;

    if (!isConnected || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      await handleConnect();
      // Wait a moment for socket to open
      setTimeout(() => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({ text: queryText }));
          setStatusText(`Asking: "${queryText}"...`);
        }
      }, 500);
    } else {
      wsRef.current.send(JSON.stringify({ text: queryText }));
      setStatusText(`Asking: "${queryText}"...`);
    }
    setTextVoicePrompt('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-emerald-500/30 rounded-3xl shadow-2xl w-full max-w-lg p-6 flex flex-col items-center text-white overflow-hidden relative">
        {/* Ambient background glow */}
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Header */}
        <div className="w-full flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span className="text-xs uppercase tracking-wider text-emerald-400 font-bold">
              Gemini 3.8 Live API
            </span>
          </div>

          <button
            onClick={() => {
              handleDisconnect();
              onClose();
            }}
            className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Visualizer Area */}
        <div className="my-6 flex flex-col items-center text-center">
          <div className="relative mb-5">
            {/* Pulsing halo rings */}
            <div
              className={`w-32 h-32 rounded-full flex items-center justify-center transition-all duration-500 ${
                isTalking
                  ? 'bg-emerald-500/20 shadow-[0_0_50px_rgba(16,185,129,0.5)] scale-110'
                  : isListening
                  ? 'bg-teal-500/20 shadow-[0_0_30px_rgba(20,184,166,0.3)]'
                  : 'bg-slate-800'
              }`}
            >
              <div
                className={`w-24 h-24 rounded-full flex items-center justify-center transition-all ${
                  isTalking
                    ? 'bg-gradient-to-tr from-emerald-600 to-teal-400 text-white animate-pulse'
                    : isListening
                    ? 'bg-emerald-700 text-emerald-100'
                    : 'bg-slate-700 text-slate-400'
                }`}
              >
                {isTalking ? (
                  <Volume2 className="w-10 h-10" />
                ) : (
                  <Mic className={`w-10 h-10 ${isListening ? 'text-white' : 'text-slate-400'}`} />
                )}
              </div>
            </div>

            {/* Live Status Tag */}
            {isConnected && (
              <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wide uppercase bg-emerald-500 text-slate-950 shadow-md whitespace-nowrap">
                {isTalking ? 'Speaking Live' : isMuted ? 'Muted' : isMicAvailable ? 'Listening' : 'Ready'}
              </span>
            )}
          </div>

          <h2 className="text-xl font-bold mb-1">FarmDirect Voice Copilot</h2>
          <p className="text-xs text-slate-400 max-w-xs">{statusText}</p>

          {/* Animated Waveform Bars */}
          {isConnected && (
            <div className="flex items-center justify-center space-x-1.5 h-6 my-3">
              {[...Array(9)].map((_, i) => (
                <div
                  key={i}
                  className={`w-1.5 rounded-full transition-all duration-150 ${
                    isTalking
                      ? 'bg-emerald-400'
                      : isListening
                      ? 'bg-teal-400/60'
                      : 'bg-slate-700'
                  }`}
                  style={{
                    height: isTalking
                      ? `${16 + Math.sin(Date.now() / 150 + i) * 12}px`
                      : isListening && !isMuted
                      ? `${8 + (i % 3) * 6}px`
                      : '4px',
                  }}
                />
              ))}
            </div>
          )}

          {noticeMessage && (
            <div className="mt-3 p-3 bg-slate-800/90 border border-amber-500/40 rounded-xl text-amber-200 text-xs flex items-center space-x-2 text-left max-w-sm">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
              <span>{noticeMessage}</span>
            </div>
          )}
        </div>

        {/* Interactive Quick Prompts (Click to ask aloud via Gemini Live) */}
        <div className="w-full bg-slate-800/60 border border-slate-700/60 rounded-2xl p-3 mb-4 text-xs">
          <p className="text-slate-400 font-medium mb-2 flex items-center justify-between">
            <span className="flex items-center space-x-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Click to speak query to Gemini 3.8 Live:</span>
            </span>
          </p>
          <div className="space-y-1.5">
            {[
              'Are Ramesh Patel vine tomatoes tested 0.00 ppm pesticide-free?',
              'What temperature is solar reefer van MH-15-EG-4402 running right now?',
              'Explain how smart escrow protects my payment until doorstep inspection.',
            ].map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => sendVoiceQuery(prompt)}
                className="w-full text-left p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700/50 transition flex items-center justify-between group text-xs"
              >
                <span className="italic truncate">{prompt}</span>
                <Volume2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 opacity-70 group-hover:opacity-100" />
              </button>
            ))}
          </div>
        </div>

        {/* Text Voice Prompt Input for fallback */}
        <div className="w-full mb-4">
          <div className="flex items-center bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 focus-within:border-emerald-500 transition">
            <input
              type="text"
              value={textVoicePrompt}
              onChange={(e) => setTextVoicePrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  sendVoiceQuery(textVoicePrompt);
                }
              }}
              placeholder="Or type a query to hear Gemini speak aloud..."
              className="w-full bg-transparent text-xs text-white placeholder-slate-400 focus:outline-none"
            />
            <button
              onClick={() => sendVoiceQuery(textVoicePrompt)}
              disabled={!textVoicePrompt.trim()}
              className="p-1 rounded-lg text-emerald-400 hover:text-emerald-300 disabled:opacity-40 transition"
              title="Send to Live Voice"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Controls */}
        <div className="w-full flex items-center justify-center space-x-3">
          {!isConnected ? (
            <button
              onClick={handleConnect}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs flex items-center space-x-2 shadow-lg shadow-emerald-900/50 transition active:scale-95"
            >
              <Mic className="w-4 h-4" />
              <span>Start Real-Time Voice</span>
            </button>
          ) : (
            <>
              {isMicAvailable && (
                <button
                  onClick={toggleMute}
                  className={`p-2.5 rounded-xl border transition ${
                    isMuted
                      ? 'bg-amber-600/30 border-amber-500 text-amber-300'
                      : 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
                  }`}
                  title={isMuted ? 'Unmute microphone' : 'Mute microphone'}
                >
                  {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-emerald-400" />}
                </button>
              )}

              <button
                onClick={handleDisconnect}
                className="px-4 py-2.5 bg-red-600/90 hover:bg-red-600 text-white rounded-xl font-bold text-xs flex items-center space-x-2 shadow-lg transition active:scale-95"
              >
                <PhoneOff className="w-4 h-4" />
                <span>End Voice</span>
              </button>
            </>
          )}

          {onSwitchToChat && (
            <button
              onClick={() => {
                handleDisconnect();
                onSwitchToChat();
              }}
              className="px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white transition flex items-center space-x-1.5 text-xs font-semibold"
              title="Switch to Text & Grounded Chat"
            >
              <MessageSquare className="w-4 h-4 text-emerald-400" />
              <span>AI Chat</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
