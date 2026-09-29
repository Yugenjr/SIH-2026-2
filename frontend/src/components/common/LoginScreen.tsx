import React, { useState } from 'react';
import { Role } from '../../types';
import { Shield, UserCheck, Settings, BarChart3, Lock, CheckCircle2, ArrowRight } from 'lucide-react';

interface LoginScreenProps {
  onLogin: (role: Role) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [selectedRole, setSelectedRole] = useState<Role>('STUDENT');
  const [username, setUsername] = useState('arun.kumar.st@university.edu.in');
  const [password, setPassword] = useState('••••••••••••');

  const handleSelectRole = (role: Role) => {
    setSelectedRole(role);
    if (role === 'STUDENT') setUsername('arun.kumar.st@university.edu.in');
    else if (role === 'OFFICER') font: setUsername('rajeshwar.prasad@mota.gov.in');
    else if (role === 'SCHEME_ADMIN') setUsername('policy.admin@mota.gov.in');
    else if (role === 'MOTA_ADMIN') setUsername('command.director@mota.gov.in');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(selectedRole);
  };

  return (
    <div className="min-h-screen bg-[#f3f6fa] flex flex-col justify-between font-sans text-slate-900 selection:bg-[#0e2a47] selection:text-white">
      
      {/* Top Official Strip */}
      <div className="bg-[#0b2238] text-slate-200 text-xs px-6 py-1.5 flex flex-wrap items-center justify-between border-b border-slate-700 font-medium">
        <div className="flex items-center space-x-3">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span>Government of India • Ministry of Tribal Affairs</span>
          <span className="text-slate-500">|</span>
          <span>Scholarship & Fellowship Digital Services</span>
        </div>
        <div className="text-[11px] text-slate-300 font-mono">
          SIH 2026 Prototype Portal (SIH26239)
        </div>
      </div>

      {/* Main Login Body */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="max-w-4xl w-full bg-white border border-slate-300 rounded-2xl shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-12">
          
          {/* Left Info Panel (5 Cols) */}
          <div className="md:col-span-5 bg-[#0e2a47] text-white p-8 flex flex-col justify-between space-y-6">
            <div>
              <div className="w-12 h-12 rounded-xl bg-white text-[#0e2a47] flex items-center justify-center font-black text-2xl shadow-sm border border-slate-300">
                सेतु
              </div>
              <h2 className="text-2xl font-black tracking-tight mt-4">SETU Portal</h2>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Intelligent Scholarship Verification & Lifecycle Management System.
              </p>
            </div>

            <div className="space-y-3 text-xs text-slate-200 border-t border-slate-700/80 pt-6">
              <div className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Deterministic Eligibility Verification Engine</span>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>PyMuPDF & OpenCV Real Document Intelligence</span>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Grounded Groq AI & Sarvam Indic Voice Integration</span>
              </div>
            </div>

            <div className="text-[11px] text-slate-400 font-mono">
              SIH Problem Statement: SIH26239
            </div>
          </div>

          {/* Right Form Panel (7 Cols) */}
          <div className="md:col-span-7 p-6 sm:p-8 space-y-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Sign In to SETU Services</h3>
              <p className="text-xs text-slate-500 mt-0.5">Select your role persona to access your dedicated workspace.</p>
            </div>

            {/* Persona Selector Tabs */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Select Persona Portal
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                
                <button
                  type="button"
                  onClick={() => handleSelectRole('STUDENT')}
                  className={`p-3 rounded-xl border text-left transition-all flex items-center space-x-2.5 ${
                    selectedRole === 'STUDENT'
                      ? 'bg-blue-50 border-[#0e2a47] text-[#0e2a47] shadow-2xs ring-1 ring-[#0e2a47]'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <UserCheck className="w-4 h-4 text-blue-700 shrink-0" />
                  <div>
                    <span className="block font-bold">Student Portal</span>
                    <span className="text-[10px] text-slate-500 font-normal">Arun Kumar (STU-88192)</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectRole('OFFICER')}
                  className={`p-3 rounded-xl border text-left transition-all flex items-center space-x-2.5 ${
                    selectedRole === 'OFFICER'
                      ? 'bg-blue-50 border-[#0e2a47] text-[#0e2a47] shadow-2xs ring-1 ring-[#0e2a47]'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Shield className="w-4 h-4 text-blue-700 shrink-0" />
                  <div>
                    <span className="block font-bold">Verification Officer</span>
                    <span className="text-[10px] text-slate-500 font-normal">Dr. Rajeshwar Prasad</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectRole('SCHEME_ADMIN')}
                  className={`p-3 rounded-xl border text-left transition-all flex items-center space-x-2.5 ${
                    selectedRole === 'SCHEME_ADMIN'
                      ? 'bg-blue-50 border-[#0e2a47] text-[#0e2a47] shadow-2xs ring-1 ring-[#0e2a47]'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Settings className="w-4 h-4 text-blue-700 shrink-0" />
                  <div>
                    <span className="block font-bold">Scheme Builder</span>
                    <span className="text-[10px] text-slate-500 font-normal">Policy Administrator</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectRole('MOTA_ADMIN')}
                  className={`p-3 rounded-xl border text-left transition-all flex items-center space-x-2.5 ${
                    selectedRole === 'MOTA_ADMIN'
                      ? 'bg-blue-50 border-[#0e2a47] text-[#0e2a47] shadow-2xs ring-1 ring-[#0e2a47]'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <BarChart3 className="w-4 h-4 text-blue-700 shrink-0" />
                  <div>
                    <span className="block font-bold">MoTA Command</span>
                    <span className="text-[10px] text-slate-500 font-normal">Executive Analytics</span>
                  </div>
                </button>

              </div>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4 pt-2">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Government User ID / Email</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none focus:border-[#0e2a47]"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none focus:border-[#0e2a47]"
                  required
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-[#0e2a47] hover:bg-[#0b2035] text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center space-x-2"
                >
                  <span>Enter {selectedRole.replace('_', ' ')} Workspace</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>

            <div className="bg-slate-100 border border-slate-200 rounded-xl p-3 text-[11px] text-slate-600 space-y-1">
              <span className="font-bold text-slate-800 block">Prototype Access Notice:</span>
              <p>Identity verification uses database seed accounts. Role separation isolates user views and routes.</p>
            </div>

          </div>

        </div>
      </div>

      {/* Bottom Footer */}
      <footer className="bg-[#0b2238] border-t border-slate-700 text-slate-300 text-xs py-3 px-6 text-center">
        <span>SETU Portal • Ministry of Tribal Affairs • Government of India</span>
      </footer>

    </div>
  );
};
