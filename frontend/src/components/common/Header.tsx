import React from 'react';
import { Role } from '../../types';
import { 
  Search, Bell, Mic, Network, History, Globe, Shield, User, FileText, CheckCircle2, LogOut 
} from 'lucide-react';

interface HeaderProps {
  currentRole: Role;
  onLogout: () => void;
  currentLang: string;
  onLangChange: (lang: string) => void;
  onOpenVoiceModal: () => void;
  onOpenIntegrationsModal: () => void;
  onOpenReplayModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  onLogout,
  currentLang,
  onLangChange,
  onOpenVoiceModal,
  onOpenIntegrationsModal,
  onOpenReplayModal
}) => {
  const getRoleTitle = () => {
    if (currentRole === 'STUDENT') return 'Student Services Portal';
    if (currentRole === 'OFFICER') return 'Officer Verification Workbench';
    if (currentRole === 'SCHEME_ADMIN') return 'Scheme Policy Administration';
    return 'MoTA Executive Command Center';
  };

  const getUserName = () => {
    if (currentRole === 'STUDENT') return 'Arun Kumar';
    if (currentRole === 'OFFICER') return 'Dr. Rajeshwar Prasad';
    if (currentRole === 'SCHEME_ADMIN') return 'Policy Administrator';
    return 'Executive Director';
  };

  const getUserCode = () => {
    if (currentRole === 'STUDENT') return 'STU-88192';
    if (currentRole === 'OFFICER') return 'OFF-104';
    if (currentRole === 'SCHEME_ADMIN') return 'ADM-302';
    return 'MOTA-001';
  };

  return (
    <header className="bg-white border-b border-slate-300 sticky top-0 z-30 shadow-xs">
      
      {/* 1. Official Government Information Strip */}
      <div className="bg-[#0b2238] text-slate-200 text-[11px] px-4 py-1 flex flex-wrap items-center justify-between border-b border-slate-700/60 font-medium">
        <div className="flex items-center space-x-3">
          <span className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block"></span>
            <span>Government of India • Ministry of Tribal Affairs</span>
          </span>
          <span className="text-slate-500">|</span>
          <span className="text-slate-300">Scholarship & Fellowship Services Portal</span>
        </div>

        <div className="flex items-center space-x-4 text-[10px] text-slate-300">
          <span>Smart India Hackathon 2026 Prototype</span>
          <span className="text-slate-500">•</span>
          <span className="text-amber-300 font-mono">SIH26239</span>
        </div>
      </div>

      {/* 2. Main Role-Specific Header Bar */}
      <div className="w-full px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
        
        {/* Brand Identity & Role Workspace Title */}
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-[#0e2a47] text-white flex items-center justify-center font-black text-base tracking-wider border border-slate-700 shadow-xs">
            सेतु
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-base font-bold text-slate-900 tracking-tight leading-none">
                SETU <span className="text-xs text-slate-500 font-medium">• {getRoleTitle()}</span>
              </h1>
              <span className="px-2 py-0.5 rounded text-[10px] bg-blue-50 text-blue-800 border border-blue-200 font-mono font-bold">
                {getUserCode()}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">
              Signed in as: <strong className="text-slate-800 font-semibold">{getUserName()}</strong>
            </p>
          </div>
        </div>

        {/* Right Controls & Role Session Switcher */}
        <div className="flex items-center space-x-2">
          
          {/* Sarvam AI Indic Voice Assistant Button */}
          <button
            onClick={onOpenVoiceModal}
            className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-amber-50 text-amber-800 border border-amber-300 hover:bg-amber-100 text-xs font-bold transition-all"
            title="Sarvam AI Indic Voice Assistant"
          >
            <Mic className="w-3.5 h-3.5 text-amber-700" />
            <span className="hidden md:inline">Voice Assistant</span>
          </button>

          {/* Connected Integrations Status */}
          <button
            onClick={onOpenIntegrationsModal}
            className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-300 text-xs font-semibold transition-all"
            title="Connected Integrations (DigiLocker / PFMS / NSP)"
          >
            <Network className="w-3.5 h-3.5 text-emerald-700" />
            <span className="hidden lg:inline">Integrations</span>
          </button>

          {/* Decision Replay Audit Trail */}
          <button
            onClick={onOpenReplayModal}
            className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-300 text-xs font-semibold transition-all"
            title="Audit Decision Replay Log"
          >
            <History className="w-3.5 h-3.5 text-blue-700" />
            <span className="hidden lg:inline">Audit Trail</span>
          </button>

          {/* Language Switcher Dropdown */}
          <div className="flex items-center bg-slate-50 rounded-lg px-2 py-1 border border-slate-300 text-xs font-semibold">
            <Globe className="w-3.5 h-3.5 text-slate-500 mr-1" />
            <select
              value={currentLang}
              onChange={(e) => onLangChange(e.target.value)}
              className="bg-transparent text-slate-800 outline-none cursor-pointer text-xs"
            >
              <option value="en">English</option>
              <option value="ta">தமிழ்</option>
              <option value="hi">हिन्दी</option>
            </select>
          </div>

          {/* Switch Persona / Logout */}
          <button
            onClick={onLogout}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 text-xs font-bold transition-all ml-2"
            title="Switch Persona Role"
          >
            <LogOut className="w-3.5 h-3.5 text-slate-600" />
            <span>Switch Role</span>
          </button>

        </div>

      </div>

    </header>
  );
};

