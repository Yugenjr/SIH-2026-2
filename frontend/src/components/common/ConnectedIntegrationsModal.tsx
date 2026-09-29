import React, { useEffect, useState } from 'react';
import { X, Network, CheckCircle2, RefreshCw, ShieldCheck, CreditCard, FileCheck, Landmark } from 'lucide-react';
import { IntegrationStatus } from '../../types';
import { api } from '../../services/api';

interface ConnectedIntegrationsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ConnectedIntegrationsModal: React.FC<ConnectedIntegrationsModalProps> = ({ isOpen, onClose }) => {
  const [integrations, setIntegrations] = useState<IntegrationStatus[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      api.getIntegrations().then(data => {
        setIntegrations(data);
        setLoading(false);
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const getIcon = (category: string) => {
    if (category === 'Identity') return <ShieldCheck className="w-5 h-5 text-blue-400" />;
    if (category === 'DigiLocker') return <FileCheck className="w-5 h-5 text-indigo-400" />;
    if (category === 'DBT / PFMS') return <CreditCard className="w-5 h-5 text-emerald-400" />;
    return <Landmark className="w-5 h-5 text-amber-400" />;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl relative">
        
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="h-9 w-9 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Network className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Connected Verification Services</h3>
              <p className="text-xs text-slate-400">Live Integration Adapters & System Health</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="my-4 space-y-3">
          {loading ? (
            <div className="py-8 flex justify-center items-center text-slate-400 text-sm gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-blue-400" />
              Checking connected integration adapters...
            </div>
          ) : (
            integrations.map((item, idx) => (
              <div key={idx} className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                    {getIcon(item.category)}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="text-sm font-semibold text-white">{item.service_name}</h4>
                      <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-400 font-mono">{item.category}</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">Latency: {item.latency_ms}ms • Last Sync: {item.last_sync}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{item.status}</span>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Enterprise Integration Standard Adapter Pattern</span>
          <button onClick={onClose} className="px-4 py-1.5 rounded-lg bg-slate-800 text-white hover:bg-slate-700 font-semibold">
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
