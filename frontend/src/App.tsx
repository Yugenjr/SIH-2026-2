import React, { useState, useEffect } from 'react';
import { Role, UserProfile, SchemeConfig, Application, Fellowship } from './types';
import { api } from './services/api';
import { Header } from './components/common/Header';
import { LoginScreen } from './components/common/LoginScreen';
import { SarvamVoiceModal } from './components/common/SarvamVoiceModal';
import { ConnectedIntegrationsModal } from './components/common/ConnectedIntegrationsModal';
import { DecisionReplayModal } from './components/common/DecisionReplayModal';

import { StudentHome } from './components/student/StudentHome';
import { SchemeDiscovery } from './components/student/SchemeDiscovery';
import { SmartApplicationForm } from './components/student/SmartApplicationForm';
import { OfficerWorkbench } from './components/officer/OfficerWorkbench';
import { SchemeBuilder } from './components/admin/SchemeBuilder';
import { CommandCenter } from './components/mota/CommandCenter';
import { FellowshipLifecycleView } from './components/fellowship/FellowshipLifecycleView';

export function App() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(true);
  const [role, setRole] = useState<Role>('STUDENT');
  const [lang, setLang] = useState<string>('en');
  const [studentView, setStudentView] = useState<'HOME' | 'DISCOVERY' | 'APPLICATION' | 'FELLOWSHIP'>('HOME');
  const [selectedSchemeId, setSelectedSchemeId] = useState<string>('SCHEME-NFST');

  // Modals
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [isIntegrationsOpen, setIsIntegrationsOpen] = useState(false);
  const [isReplayOpen, setIsReplayOpen] = useState(false);

  // Data state
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [schemes, setSchemes] = useState<SchemeConfig[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [fellowship, setFellowship] = useState<Fellowship | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    const prof = await api.getStudentProfile();
    const sch = await api.getSchemes();
    const apps = await api.getApplications();
    const fel = await api.getFellowship();

    setProfile(prof);
    setSchemes(sch);
    setApplications(apps);
    setFellowship(fel);
    setLoading(false);
  };

  const handleFixDeficiency = async (appId: string, defId: string) => {
    // Interactive resolution loop
    await api.resolveDeficiency(defId, appId);
    await loadInitialData();
    setStudentView('HOME');
  };

  if (!isLoggedIn) {
    return (
      <LoginScreen
        onLogin={(selectedRole) => {
          setRole(selectedRole);
          setIsLoggedIn(true);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#f3f6fa] text-slate-900 flex flex-col font-sans selection:bg-[#0e2a47] selection:text-white">
      
      {/* Persistent Role-Specific Header */}
      <Header
        currentRole={role}
        onLogout={() => setIsLoggedIn(false)}
        currentLang={lang}
        onLangChange={setLang}
        onOpenVoiceModal={() => setIsVoiceOpen(true)}
        onOpenIntegrationsModal={() => setIsIntegrationsOpen(true)}
        onOpenReplayModal={() => setIsReplayOpen(true)}
      />

      {/* Main View Container */}
      <main className="flex-1 w-full px-4 sm:px-6 py-6">
        
        {loading ? (
          <div className="py-24 text-center space-y-3">
            <div className="inline-block h-8 w-8 border-3 border-[#0e2a47] border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-semibold text-slate-600">Loading SETU Verification Engine & Data...</p>
          </div>
        ) : (
          <>
            {/* ROLE 1: STUDENT PORTAL */}
            {role === 'STUDENT' && profile && (
              <>
                {studentView === 'HOME' && (
                  <StudentHome
                    profile={profile}
                    applications={applications}
                    fellowship={fellowship}
                    onStartApplication={(schId) => {
                      setSelectedSchemeId(schId);
                      setStudentView('APPLICATION');
                    }}
                    onFixDeficiency={handleFixDeficiency}
                    onViewFellowship={() => setStudentView('FELLOWSHIP')}
                    onOpenDiscovery={() => setStudentView('DISCOVERY')}
                  />
                )}

                {studentView === 'DISCOVERY' && (
                  <SchemeDiscovery
                    profile={profile}
                    schemes={schemes}
                    onSelectScheme={(schId) => {
                      setSelectedSchemeId(schId);
                      setStudentView('APPLICATION');
                    }}
                    onBack={() => setStudentView('HOME')}
                  />
                )}

                {studentView === 'APPLICATION' && (
                  <SmartApplicationForm
                    profile={profile}
                    schemeId={selectedSchemeId}
                    onSubmitted={() => {
                      loadInitialData();
                      setStudentView('HOME');
                    }}
                    onCancel={() => setStudentView('HOME')}
                  />
                )}

                {studentView === 'FELLOWSHIP' && (
                  <FellowshipLifecycleView
                    fellowship={fellowship}
                    onBack={() => setStudentView('HOME')}
                  />
                )}
              </>
            )}

            {/* ROLE 2: OFFICER VERIFICATION WORKBENCH */}
            {role === 'OFFICER' && (
              <OfficerWorkbench onRefresh={loadInitialData} />
            )}

            {/* ROLE 3: SCHEME BUILDER (ADMIN) */}
            {role === 'SCHEME_ADMIN' && schemes.length > 0 && (
              <SchemeBuilder schemes={schemes} />
            )}

            {/* ROLE 4: MOTA COMMAND CENTER */}
            {role === 'MOTA_ADMIN' && (
              <CommandCenter />
            )}
          </>
        )}

      </main>

      {/* Global Footer */}
      <footer className="bg-[#0b2238] border-t border-slate-700 text-slate-300 text-xs py-4 px-6 text-center">
        <div className="w-full px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>SETU — Intelligent Scholarship Verification & Lifecycle Platform (SIH26239)</span>
          <span className="font-mono text-slate-400">Government of India • Ministry of Tribal Affairs</span>
        </div>
      </footer>

      {/* Global Interactive Modals */}
      <SarvamVoiceModal
        isOpen={isVoiceOpen}
        onClose={() => setIsVoiceOpen(false)}
        currentLang={lang}
      />

      <ConnectedIntegrationsModal
        isOpen={isIntegrationsOpen}
        onClose={() => setIsIntegrationsOpen(false)}
      />

      <DecisionReplayModal
        isOpen={isReplayOpen}
        onClose={() => setIsReplayOpen(false)}
      />

    </div>
  );
}
