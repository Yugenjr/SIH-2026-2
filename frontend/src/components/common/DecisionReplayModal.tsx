import React, { useEffect, useState } from 'react';
import { X, History, Clock, User, Shield, CheckCircle2, AlertTriangle, FileText } from 'lucide-react';
import { AuditRecord } from '../../types';
import { api } from '../../services/api';

interface DecisionReplayModalProps {
  isOpen: boolean;
  onClose: () => void;
  applicationId?: string;
}

export const DecisionReplayModal: React.FC<DecisionReplayModalProps> = ({
  isOpen,
  onClose,
  applicationId = "NFST-2026-00821"
}) => {
  const [logs, setLogs] = useState<AuditRecord[]>([]);

  useEffect(() => {
    if (isOpen) {
      api.getAuditTimeline(applicationId).then(setLogs);
    }
  }, [isOpen, applicationId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative max-h-[85vh] flex flex-col">
        
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="h-9 w-9 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Audit & Decision Replay Timeline</h3>
              <p className="text-xs text-slate-400">Application #{applicationId} • Traceable Execution Log</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Audit Timeline */}
        <div className="my-4 overflow-y-auto space-y-4 pr-2 flex-1">
          {logs.map((item, idx) => (
            <div key={idx} className="relative pl-6 pb-4 border-l-2 border-slate-800 last:border-l-0 last:pb-0">
              {/* Timeline Dot */}
              <div className={`absolute -left-[9px] top-0.5 h-4 w-4 rounded-full border-2 border-slate-900 ${
                item.actor_role === 'STUDENT' ? 'bg-blue-500' : (item.actor_role === 'OFFICER' ? 'bg-amber-500' : 'bg-emerald-500')
              }`} />

              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800/80 space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-white">{item.action}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 font-mono">{item.scheme_version}</span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-500" />
                    {item.timestamp}
                  </span>
                </div>

                <p className="text-xs text-slate-300 font-medium leading-relaxed">{item.reason}</p>

                <div className="pt-2 border-t border-slate-900 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3 text-slate-500" />
                    Actor: <strong className="text-slate-200">{item.actor}</strong>
                  </span>
                  <span className="uppercase tracking-wider font-semibold text-[10px] text-blue-400">{item.actor_role}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Every decision is tamper-evident & deterministic</span>
          <button onClick={onClose} className="px-4 py-1.5 rounded-lg bg-slate-800 text-white hover:bg-slate-700 font-semibold">
            Close Replay
          </button>
        </div>

      </div>
    </div>
  );
};
