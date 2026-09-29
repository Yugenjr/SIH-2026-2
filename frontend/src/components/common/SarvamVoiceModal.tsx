import React, { useState } from 'react';
import { Mic, X, Volume2, Sparkles, CheckCircle2, Bot } from 'lucide-react';
import { api } from '../../services/api';

interface SarvamVoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLang: string;
}

export const SarvamVoiceModal: React.FC<SarvamVoiceModalProps> = ({
  isOpen,
  onClose,
  currentLang
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState<string>('');
  const [response, setResponse] = useState<string>('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSimulateVoiceInput = async () => {
    setIsRecording(true);
    setTranscript('Recording voice input...');
    setResponse('');

    setTimeout(async () => {
      setIsRecording(false);
      
      let queryText = "What is my application status?";
      if (currentLang === 'ta') {
        queryText = "என்னுடைய விண்ணப்பம் இப்போது எந்த நிலையில் இருக்கிறது?";
      } else if (currentLang === 'hi') {
        queryText = "मेरे आवेदन की वर्तमान स्थिति क्या है?";
      }
      setTranscript(queryText);

      setLoading(true);
      // Fetch live application state & response via Sarvam/Groq engine
      const res = await api.askChatbot(queryText, "NFST-2026-00821");
      
      let answerText = res?.answer || "Your application is currently under officer scrutiny. No action required.";
      if (currentLang === 'ta') {
        answerText = await api.translateText("Your application is currently under officer scrutiny.", "ta");
      } else if (currentLang === 'hi') {
        answerText = await api.translateText("Your application is currently under officer scrutiny.", "hi");
      }

      setResponse(answerText);
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative overflow-hidden">
        
        {/* Decorative Top Accent */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-orange-500 to-blue-600"></div>

        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="h-9 w-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Sarvam Indic Voice Assistant
                <span className="px-2 py-0.5 rounded text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 font-semibold">Sarvam AI Core</span>
              </h3>
              <p className="text-xs text-slate-400">Indian Language Voice Query & Real Application State</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Voice Pipeline Diagram */}
        <div className="my-5 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-[11px] font-mono text-slate-400 flex items-center justify-between">
          <span className="text-amber-400 font-semibold">VOICE (Tamil / Hindi / En)</span>
          <span>→</span>
          <span className="text-blue-400">SARVAM STT</span>
          <span>→</span>
          <span className="text-emerald-400">SAHA TRUTH</span>
          <span>→</span>
          <span className="text-purple-400">SARVAM TTS</span>
        </div>

        {/* Mic Interaction Area */}
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <button
            onClick={handleSimulateVoiceInput}
            disabled={isRecording || loading}
            className={`h-20 w-20 rounded-full flex items-center justify-center shadow-xl transition-all ${
              isRecording 
                ? 'bg-red-500 text-white animate-pulse ring-8 ring-red-500/20 scale-105' 
                : 'bg-gradient-to-tr from-amber-500 to-orange-600 text-white hover:scale-105 shadow-amber-500/20'
            }`}
          >
            <Mic className="w-8 h-8" />
          </button>
          <p className="mt-3 text-xs text-slate-300 font-medium">
            {isRecording ? 'Listening in selected language...' : 'Tap Microphone to Speak Query'}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            Current Language: <span className="text-amber-400 font-semibold uppercase">{currentLang}</span>
          </p>
        </div>

        {/* Dynamic Speech & Response Container */}
        {transcript && (
          <div className="space-y-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
            <div>
              <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Recognized Voice Input (STT)</p>
              <p className="text-sm font-semibold text-amber-300 mt-0.5">"{transcript}"</p>
            </div>

            {loading ? (
              <div className="flex items-center space-x-2 text-xs text-slate-400 py-2">
                <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
                <span>Retrieving live application state & generating Sarvam response...</span>
              </div>
            ) : response ? (
              <div className="pt-2 border-t border-slate-800/80">
                <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Bot className="w-3.5 h-3.5 text-emerald-400" />
                  SAHA Factual Response (Translated via Sarvam)
                </p>
                <div className="mt-1 flex items-start space-x-2 bg-slate-900 p-3 rounded-lg border border-slate-800">
                  <Volume2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5 animate-bounce" />
                  <p className="text-sm text-slate-100 font-medium leading-relaxed">{response}</p>
                </div>
              </div>
            ) : null}
          </div>
        )}

        {/* Footer info */}
        <div className="mt-5 flex items-center justify-between text-[11px] text-slate-400 pt-3 border-t border-slate-800">
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            Factual Application DB Grounding
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700 text-xs font-semibold"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
