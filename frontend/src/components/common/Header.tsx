import React from 'react';
import { Role } from '../../types';
import { 
  Search, Bell, Mic, Network, History, Globe, User 
} from 'lucide-react';

interface HeaderProps {
  currentRole: Role;
  currentLang: string;
  onLangChange: (lang: string) => void;
  onOpenVoiceModal: () => void;
  onOpenIntegrationsModal: () => void;
  onOpenReplayModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  currentLang,
  onLangChange,
  onOpenVoiceModal,
  onOpenIntegrationsModal,
  onOpenReplayModal
}) => {
  const getGreetingName = () => {
    if (currentRole === 'STUDENT') return 'Arun';
    if (currentRole === 'OFFICER') return 'Verification Officer';
    if (currentRole === 'SCHEME_ADMIN') return 'Scheme Administrator';
    return 'MoTA Admin';
  };

  const getProfileCode = () => {
    if (currentRole === 'STUDENT') return 'STU-88192';
    if (currentRole === 'OFFICER') return 'OFF-104';
    return 'MoTA-SA031';
  };

  return (
    <header className="bg-white border-b border-slate-200/80 px-6 py-3.5 flex items-center justify-between shadow-sm sticky top-0 z-30">
      
      {/* Left Greeting Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          Good afternoon, <span className="text-[#0e2a47]">{getGreetingName()}</span>
        </h2>
      </div>

      {/* Center Search Bar */}
      <div className="hidden md:flex items-center bg-slate-100/80 border border-slate-200 rounded-xl px-3.5 py-1.5 w-80 text-xs focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
        <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
        <input
          type="text"
          placeholder="Search applications, schemes, documents..."
          className="bg-transparent border-none outline-none text-slate-800 placeholder-slate-400 w-full"
        />
        <kbd className="hidden lg:inline-block px-1.5 py-0.5 text-[10px] font-mono font-semibold bg-white border border-slate-200 rounded text-slate-400 shadow-2xs">
          ⌘K
        </kbd>
      </div>

      {/* Right Controls & Profile */}
      <div className="flex items-center space-x-3">
        
        {/* Sarvam Voice Button */}
        <button
          onClick={onOpenVoiceModal}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 text-xs font-semibold transition-all shadow-2xs"
          title="Sarvam AI Indic Speech Assistant"
        >
          <Mic className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
          <span className="hidden sm:inline">Sarvam Voice</span>
        </button>

        {/* Connected Services */}
        <button
          onClick={onOpenIntegrationsModal}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200 text-xs font-semibold transition-all shadow-2xs"
          title="Connected Integrations Status"
        >
          <Network className="w-3.5 h-3.5 text-emerald-600" />
          <span className="hidden lg:inline">Connected Services</span>
        </button>

        {/* Audit Decision Replay */}
        <button
          onClick={onOpenReplayModal}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200 text-xs font-semibold transition-all shadow-2xs"
          title="Decision Replay Audit Log"
        >
          <History className="w-3.5 h-3.5 text-blue-600" />
          <span className="hidden lg:inline">Decision Replay</span>
        </button>

        {/* Language Selector */}
        <div className="relative flex items-center bg-slate-50 rounded-xl px-2.5 py-1.5 border border-slate-200">
          <Globe className="w-3.5 h-3.5 text-slate-500 mr-1.5" />
          <select
            value={currentLang}
            onChange={(e) => onLangChange(e.target.value)}
            className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="en">English</option>
            <option value="ta">தமிழ் (Tamil)</option>
            <option value="hi">हिन्दी (Hindi)</option>
          </select>
        </div>

        {/* Bell Notification Icon */}
        <button className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 relative transition-all">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-blue-600" />
        </button>

        {/* User Profile Pill Avatar */}
        <div className="flex items-center space-x-2.5 pl-2 border-l border-slate-200">
          <div className="text-right hidden sm:block">
            <span className="text-xs font-bold text-slate-900 block leading-tight">{getGreetingName()}</span>
            <span className="text-[10px] font-mono text-slate-500">{getProfileCode()}</span>
          </div>

          <div className="h-9 w-9 rounded-full bg-[#0e2a47] text-white flex items-center justify-center font-bold text-xs shadow-sm ring-2 ring-slate-100">
            {getGreetingName().substring(0, 1)}
          </div>
        </div>

      </div>

    </header>
  );
};
