import React from 'react';
import { Role } from '../../types';
import { 
  Home, UserCheck, Settings, BarChart3, ShieldCheck, LogOut, ChevronRight, Folder 
} from 'lucide-react';

interface SidebarProps {
  currentRole: Role;
  onRoleChange: (role: Role) => void;
  collapsed?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentRole, onRoleChange }) => {
  const navItems = [
    { role: 'STUDENT' as Role, label: 'Home / Student', icon: Home },
    { role: 'OFFICER' as Role, label: 'Officer Workbench', icon: UserCheck },
    { role: 'SCHEME_ADMIN' as Role, label: 'Scheme Builder', icon: Settings },
    { role: 'MOTA_ADMIN' as Role, label: 'MoTA Command Center', icon: BarChart3 },
  ];

  return (
    <aside className="w-64 bg-[#0e2a47] text-slate-200 flex flex-col justify-between min-h-screen shrink-0 border-r border-slate-800/40">
      
      {/* Top Header */}
      <div>
        <div className="p-5 flex items-center space-x-3 border-b border-slate-800/40">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-blue-500 via-indigo-600 to-amber-400 flex items-center justify-center shadow-lg shadow-blue-900/40">
            <span className="font-extrabold text-white text-base tracking-wider">S</span>
          </div>
          <div>
            <h1 className="font-bold text-base text-white tracking-tight leading-none">SAHA Platform</h1>
            <span className="text-[10px] text-slate-400 tracking-wider uppercase font-medium">MoTA Administrative Layer</span>
          </div>
        </div>

        {/* Main Navigation Links */}
        <nav className="p-3 space-y-1.5 mt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentRole === item.role;

            return (
              <button
                key={item.role}
                onClick={() => onRoleChange(item.role)}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs transition-all ${
                  isActive 
                    ? 'bg-white text-[#0e2a47] font-bold shadow-md shadow-slate-900/10' 
                    : 'text-slate-300 hover:bg-slate-800/50 hover:text-white font-medium'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#0e2a47]' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>

                {isActive && (
                  <span className="h-2 w-2 rounded-full bg-blue-600 shadow-sm" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Workspace Quick Links */}
        <div className="px-5 pt-6 space-y-2 text-[11px] text-slate-400">
          <span className="uppercase tracking-wider font-bold text-[10px] text-slate-500">SCHEME WORKSPACE</span>
          
          <div className="space-y-1 pt-1 font-medium">
            <div className="flex items-center space-x-2 text-slate-300 hover:text-white cursor-pointer py-1">
              <ChevronRight className="w-3 h-3 text-slate-500" />
              <Folder className="w-3.5 h-3.5 text-blue-400" />
              <span>NFST Fellowship</span>
            </div>
            <div className="flex items-center space-x-2 text-slate-300 hover:text-white cursor-pointer py-1">
              <ChevronRight className="w-3 h-3 text-slate-500" />
              <Folder className="w-3.5 h-3.5 text-amber-400" />
              <span>NOS Scholarship</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Profile Footer */}
      <div className="p-4 border-t border-slate-800/40 text-xs">
        <div className="flex items-center justify-between text-slate-400 hover:text-white cursor-pointer">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="font-medium text-slate-300">MoTA Portal v2026.1</span>
          </div>
          <LogOut className="w-4 h-4 text-slate-500 hover:text-red-400 transition-colors" />
        </div>
      </div>

    </aside>
  );
};
